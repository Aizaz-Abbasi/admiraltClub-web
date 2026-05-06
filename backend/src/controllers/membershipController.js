// src/controllers/membershipController.js
const { PrismaClient } = require("@prisma/client");
const Stripe = require("stripe");
const bcrypt = require("bcryptjs");
const { sendGuestCredentialsEmail } = require("../services/emailService");
const prisma = new PrismaClient();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const PLANS = {
    MONTHLY: {
        amount: 35000, // $350 in cents
        interval: "month",
        label: "Monthly Membership",
    },
    YEARLY: {
        amount: 350000, // $3,500 in cents
        interval: "year",
        label: "Annual Club Membership",
    },
    DAY_PASS: {
        amount: 8500, // $85 in cents
        interval: null, // one-time
        label: "Day Pass",
    },
};

function computeEndDate(membershipType) {
    const d = new Date();
    if (membershipType === "MONTHLY") {
        d.setMonth(d.getMonth() + 1);
    } else if (membershipType === "YEARLY") {
        d.setFullYear(d.getFullYear() + 1);
    }
    return d;
}

// Promote a GUEST user to MEMBER when they purchase a recurring plan
async function promoteGuestIfNeeded(userId, membershipType) {
    if (membershipType === "DAY_PASS") return;
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
    if (user?.role === "GUEST") {
        await prisma.user.update({ where: { id: userId }, data: { role: "MEMBER" } });
    }
}

// Idempotent payment logger — skips if stripeId already recorded
async function logPayment({ userId, amount, type, status, stripeId }) {
    if (stripeId) {
        const exists = await prisma.payment.findFirst({ where: { stripeId } });
        if (exists) return;
    }
    await prisma.payment.create({
        data: { userId, amount, type, status, stripeId },
    });
}

// ─── GET /membership/my ───────────────────────────────────────────────────────
const getMyMembership = async (req, res) => {
    try {
        const membership = await prisma.membership.findUnique({
            where: { userId: req.user.id },
        });
        return res.status(200).json({ success: true, membership });
    } catch (error) {
        console.error("getMyMembership error:", error);
        return res.status(500).json({ success: false, message: "Internal server error." });
    }
};

// ─── GET /membership/day-passes ───────────────────────────────────────────────
const getMyDayPasses = async (req, res) => {
    try {
        const rawPasses = await prisma.dayPass.findMany({
            where: { userId: req.user.id },
            include: {
                booking: {
                    include: {
                        simulator: { include: { location: true } },
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        });

        // Attach guest user details for used passes
        const guestIds = rawPasses
            .filter((p) => p.guestUserId)
            .map((p) => p.guestUserId);

        const guestUsers = guestIds.length
            ? await prisma.user.findMany({
                  where: { id: { in: guestIds } },
                  select: { id: true, name: true, email: true },
              })
            : [];

        const guestMap = Object.fromEntries(guestUsers.map((u) => [u.id, u]));

        const dayPasses = rawPasses.map((p) => ({
            ...p,
            guestUser: p.guestUserId ? (guestMap[p.guestUserId] ?? null) : null,
        }));
        return res.status(200).json({ success: true, dayPasses });
    } catch (error) {
        console.error("getMyDayPasses error:", error);
        return res.status(500).json({ success: false, message: "Internal server error." });
    }
};

// ─── POST /membership/checkout ────────────────────────────────────────────────
const createCheckoutSession = async (req, res) => {
    try {
        const { type } = req.body; // MONTHLY | YEARLY | DAY_PASS

        if (!PLANS[type]) {
            return res.status(400).json({ success: false, message: "Invalid membership type." });
        }

        const plan = PLANS[type];
        const user = await prisma.user.findUnique({ where: { id: req.user.id } });

        // Get or create Stripe customer (use existing membership record for MONTHLY/YEARLY)
        let stripeCustomerId = null;
        const existingMembership = await prisma.membership.findUnique({
            where: { userId: req.user.id },
        });

        if (existingMembership?.stripeCustomerId) {
            stripeCustomerId = existingMembership.stripeCustomerId;
        } else {
            const customer = await stripe.customers.create({
                email: user.email,
                name: user.name,
                metadata: { userId: String(user.id) },
            });
            stripeCustomerId = customer.id;
        }

        const isRecurring = type !== "DAY_PASS";

        const lineItems = [
            {
                price_data: {
                    currency: "usd",
                    product_data: { name: plan.label },
                    unit_amount: plan.amount,
                    ...(isRecurring && {
                        recurring: { interval: plan.interval },
                    }),
                },
                quantity: 1,
            },
        ];

        const session = await stripe.checkout.sessions.create({
            customer: stripeCustomerId,
            payment_method_types: ["card"],
            line_items: lineItems,
            mode: isRecurring ? "subscription" : "payment",
            success_url: `${process.env.CLIENT_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.CLIENT_URL}/dashboard?cancelled=1`,
            metadata: {
                userId: String(user.id),
                membershipType: type,
            },
        });

        return res.status(200).json({ success: true, url: session.url });
    } catch (error) {
        console.error("createCheckoutSession error:", error);
        return res.status(500).json({ success: false, message: "Internal server error." });
    }
};

// ─── POST /membership/webhook ─────────────────────────────────────────────────
const handleWebhook = async (req, res) => {
    const sig = req.headers["stripe-signature"];
    let event;

    try {
        event = stripe.webhooks.constructEvent(
            req.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (err) {
        console.error("Webhook signature error:", err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    try {
        switch (event.type) {

            // ── Initial purchase (one-time or subscription first payment) ──────
            case "checkout.session.completed": {
                const session = event.data.object;

                if (session.payment_status !== "paid") break;

                const userId = Number(session.metadata.userId);
                const membershipType = session.metadata.membershipType;
                const paymentStripeId = session.payment_intent ?? session.id;

                if (membershipType === "DAY_PASS") {
                    // Day Pass → create an individual DayPass record (not a Membership)
                    const exists = await prisma.dayPass.findFirst({ where: { stripeId: paymentStripeId } });
                    if (!exists) {
                        await prisma.dayPass.create({
                            data: { userId, stripeId: paymentStripeId },
                        });
                    }
                } else {
                    // MONTHLY / YEARLY → upsert Membership
                    const stripeCustomerId = session.customer;
                    const stripeSubscriptionId = session.subscription ?? null;
                    const endDate = computeEndDate(membershipType);

                    await prisma.membership.upsert({
                        where: { userId },
                        create: {
                            userId,
                            type: membershipType,
                            status: "active",
                            startDate: new Date(),
                            endDate,
                            stripeCustomerId,
                            stripeSubscriptionId,
                        },
                        update: {
                            type: membershipType,
                            status: "active",
                            startDate: new Date(),
                            endDate,
                            stripeCustomerId,
                            stripeSubscriptionId,
                        },
                    });

                    await promoteGuestIfNeeded(userId, membershipType);
                }

                await logPayment({
                    userId,
                    amount: session.amount_total / 100,
                    type: membershipType,
                    status: "succeeded",
                    stripeId: paymentStripeId,
                });
                break;
            }

            // ── Subscription renewal ──────────────────────────────────────────
            case "invoice.paid": {
                const invoice = event.data.object;
                const subscriptionId = invoice.subscription;
                if (!subscriptionId) break;

                const membership = await prisma.membership.findFirst({
                    where: { stripeSubscriptionId: subscriptionId },
                });
                if (!membership) {
                    console.error("invoice.paid: no membership for subscription", subscriptionId);
                    break;
                }

                const line = invoice.lines?.data?.[0];
                const periodEnd = line?.period?.end
                    ? new Date(line.period.end * 1000)
                    : computeEndDate(membership.type);

                await prisma.membership.update({
                    where: { id: membership.id },
                    data: { status: "active", endDate: periodEnd },
                });

                await logPayment({
                    userId: membership.userId,
                    amount: invoice.amount_paid / 100,
                    type: membership.type,
                    status: "succeeded",
                    stripeId: invoice.payment_intent ?? invoice.id,
                });
                break;
            }

            // ── Subscription renewal payment failed ───────────────────────────
            case "invoice.payment_failed": {
                const invoice = event.data.object;
                const subscriptionId = invoice.subscription;
                if (!subscriptionId) break;

                const membership = await prisma.membership.findFirst({
                    where: { stripeSubscriptionId: subscriptionId },
                });
                if (!membership) break;

                await prisma.membership.update({
                    where: { id: membership.id },
                    data: { status: "past_due" },
                });

                await logPayment({
                    userId: membership.userId,
                    amount: invoice.amount_due / 100,
                    type: membership.type,
                    status: "failed",
                    stripeId: invoice.payment_intent ?? invoice.id,
                });
                break;
            }

            // ── Subscription status changes ───────────────────────────────────
            case "customer.subscription.updated": {
                const subscription = event.data.object;

                const statusMap = {
                    active: "active",
                    trialing: "active",
                    past_due: "past_due",
                    unpaid: "past_due",
                    canceled: "cancelled",
                    incomplete: "incomplete",
                    incomplete_expired: "expired",
                    paused: "paused",
                };
                const newStatus = statusMap[subscription.status] ?? subscription.status;
                const endDate = subscription.current_period_end
                    ? new Date(subscription.current_period_end * 1000)
                    : undefined;

                await prisma.membership.updateMany({
                    where: { stripeSubscriptionId: subscription.id },
                    data: {
                        status: newStatus,
                        ...(endDate && { endDate }),
                    },
                });
                break;
            }

            // ── Subscription cancelled ────────────────────────────────────────
            case "customer.subscription.deleted": {
                const subscription = event.data.object;
                await prisma.membership.updateMany({
                    where: { stripeSubscriptionId: subscription.id },
                    data: { status: "cancelled" },
                });
                break;
            }

            default:
                console.log(`Unhandled Stripe event: ${event.type}`);
        }

        return res.status(200).json({ received: true });
    } catch (error) {
        console.error("Webhook handler error:", error);
        return res.status(500).json({ message: "Webhook handler failed." });
    }
};

// ─── POST /membership/verify-session ─────────────────────────────────────────
const verifySession = async (req, res) => {
    try {
        const { sessionId } = req.body;
        if (!sessionId) {
            return res.status(400).json({ success: false, message: "Session ID required." });
        }

        const session = await stripe.checkout.sessions.retrieve(sessionId);

        if (!session || session.metadata?.userId !== String(req.user.id)) {
            return res.status(403).json({ success: false, message: "Session not found or unauthorized." });
        }

        if (session.payment_status !== "paid") {
            return res.status(400).json({ success: false, message: "Payment not completed." });
        }

        const membershipType = session.metadata.membershipType;
        const paymentStripeId = session.payment_intent ?? session.id;

        if (membershipType === "DAY_PASS") {
            // Idempotent: return existing DayPass if already created by webhook
            let dayPass = await prisma.dayPass.findFirst({ where: { stripeId: paymentStripeId } });
            if (!dayPass) {
                dayPass = await prisma.dayPass.create({
                    data: { userId: req.user.id, stripeId: paymentStripeId },
                });
                await logPayment({
                    userId: req.user.id,
                    amount: session.amount_total / 100,
                    type: membershipType,
                    status: "succeeded",
                    stripeId: paymentStripeId,
                });
            }
            return res.status(200).json({ success: true, purchaseType: "DAY_PASS", dayPass });
        }

        // MONTHLY / YEARLY
        const existing = await prisma.membership.findUnique({
            where: { userId: req.user.id },
        });
        if (
            existing?.status === "active" &&
            existing?.stripeCustomerId === session.customer &&
            existing?.type === membershipType
        ) {
            return res.status(200).json({ success: true, purchaseType: membershipType, membership: existing });
        }

        const stripeCustomerId = session.customer;
        const stripeSubscriptionId = session.subscription ?? null;
        const endDate = computeEndDate(membershipType);

        const membership = await prisma.membership.upsert({
            where: { userId: req.user.id },
            create: {
                userId: req.user.id,
                type: membershipType,
                status: "active",
                startDate: new Date(),
                endDate,
                stripeCustomerId,
                stripeSubscriptionId,
            },
            update: {
                type: membershipType,
                status: "active",
                startDate: new Date(),
                endDate,
                stripeCustomerId,
                stripeSubscriptionId,
            },
        });

        await promoteGuestIfNeeded(req.user.id, membershipType);

        await logPayment({
            userId: req.user.id,
            amount: session.amount_total / 100,
            type: membershipType,
            status: "succeeded",
            stripeId: paymentStripeId,
        });

        return res.status(200).json({ success: true, purchaseType: membershipType, membership });
    } catch (error) {
        console.error("verifySession error:", error);
        return res.status(500).json({ success: false, message: "Internal server error." });
    }
};

// ─── POST /membership/cancel ──────────────────────────────────────────────────
const cancelMembership = async (req, res) => {
    try {
        const membership = await prisma.membership.findUnique({
            where: { userId: req.user.id },
        });

        if (!membership) {
            return res.status(404).json({ success: false, message: "No active membership found." });
        }

        if (membership.stripeSubscriptionId) {
            await stripe.subscriptions.cancel(membership.stripeSubscriptionId);
        }

        await prisma.membership.update({
            where: { userId: req.user.id },
            data: { status: "cancelled" },
        });

        return res.status(200).json({ success: true, message: "Membership cancelled." });
    } catch (error) {
        console.error("cancelMembership error:", error);
        return res.status(500).json({ success: false, message: "Internal server error." });
    }
};

// ─── POST /membership/create-guest ───────────────────────────────────────────
// Uses an unused DayPass. Links it to a specific future booking.
// The guest can log in until the booking's endTime.
const createGuestUser = async (req, res) => {
    try {
        const { dayPassId, bookingId, name, email } = req.body;
        if (!dayPassId || !bookingId || !name || !email) {
            return res.status(400).json({
                success: false,
                message: "dayPassId, bookingId, name and email are required.",
            });
        }

        // Validate: day pass belongs to this member and is unused
        const dayPass = await prisma.dayPass.findFirst({
            where: { id: Number(dayPassId), userId: req.user.id, status: "unused" },
        });
        if (!dayPass) {
            return res.status(403).json({
                success: false,
                message: "Day pass not found or already used.",
            });
        }

        // Validate: booking belongs to this member, is active, and is in the future
        const booking = await prisma.reservation.findFirst({
            where: { id: Number(bookingId), userId: req.user.id, status: "BOOKED" },
            include: { simulator: { include: { location: true } } },
        });
        if (!booking) {
            return res.status(404).json({ success: false, message: "Booking not found." });
        }
        if (new Date(booking.endTime) <= new Date()) {
            return res.status(400).json({
                success: false,
                message: "Cannot assign a guest to a past or ongoing booking.",
            });
        }

        // Reject if email belongs to a non-GUEST account
        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing && existing.role !== "GUEST") {
            return res.status(400).json({
                success: false,
                message: "This email is already registered as a member account.",
            });
        }

        const rawPassword = "Day" + Math.random().toString(36).slice(2, 8).toUpperCase();
        const hashed = await bcrypt.hash(rawPassword, 10);
        // Guest can log in until the booking ends
        const guestAccessUntil = new Date(booking.endTime);

        let guestUser;
        if (existing) {
            guestUser = await prisma.user.update({
                where: { email },
                data: { name, password: hashed, guestAccessUntil },
            });
        } else {
            guestUser = await prisma.user.create({
                data: { name, email, password: hashed, role: "GUEST", guestAccessUntil },
            });
        }

        // Mark the day pass as used and link it to the booking and guest
        await prisma.dayPass.update({
            where: { id: dayPass.id },
            data: { status: "used", bookingId: booking.id, guestUserId: guestUser.id },
        });

        await sendGuestCredentialsEmail({
            to: email,
            name,
            email,
            password: rawPassword,
            accessDate: guestAccessUntil,
        });

        return res.status(201).json({
            success: true,
            message: `Guest account created and credentials sent to ${email}.`,
            guest: { id: guestUser.id, name: guestUser.name, email: guestUser.email },
        });
    } catch (error) {
        console.error("createGuestUser error:", error);
        return res.status(500).json({ success: false, message: "Internal server error." });
    }
};

module.exports = {
    getMyMembership,
    getMyDayPasses,
    createCheckoutSession,
    handleWebhook,
    verifySession,
    cancelMembership,
    createGuestUser,
};
