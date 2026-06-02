// src/controllers/reservationController.js
const { PrismaClient } = require("@prisma/client");
const { sendBookingEmail } = require("../services/emailService");
const prisma = new PrismaClient();

// ─── Config ───────────────────────────────────────────────────────────────────
// Each slot is 4 hours. Slots start at 00:00 and repeat every 4 hours.
const SLOT_DURATION_HOURS = 4;
const SLOT_START_HOURS = [0, 4, 8, 12, 16, 20]; // 6 slots per day per simulator
const MAX_SPOTS = 4; // max players per slot

// Max concurrent upcoming reservations per membership plan
const CONCURRENT_LIMITS = {
    MONTHLY: 1,
    MONTHLY_PREMIUM: 3,
    YEARLY: 1,
};

function generateDoorCode() {
    return Math.floor(1000 + Math.random() * 9000).toString();
}

/**
 * Build slot windows for a given date string (YYYY-MM-DD).
 * Returns array of { startTime, endTime } as UTC Date objects.
 */
function buildSlots(dateStr) {
    return SLOT_START_HOURS.map((hour) => {
        const startTime = new Date(`${dateStr}T${String(hour).padStart(2, "0")}:00:00.000Z`);
        const endTime = new Date(startTime.getTime() + SLOT_DURATION_HOURS * 60 * 60 * 1000);
        return { startTime, endTime };
    });
}

// ─── GET /reservations/slots?date=YYYY-MM-DD&simulatorId=1 ───────────────────
/**
 * Returns all slots for a given date and simulator,
 * each marked as AVAILABLE or BOOKED.
 */
const getSlots = async (req, res) => {
    try {
        const { date, simulatorId } = req.query;

        if (!date || !simulatorId) {
            return res.status(400).json({
                success: false,
                message: "date (YYYY-MM-DD) and simulatorId are required.",
            });
        }

        // Validate date format
        if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
            return res.status(400).json({
                success: false,
                message: "date must be in YYYY-MM-DD format.",
            });
        }

        const simId = Number(simulatorId);
        if (!Number.isInteger(simId)) {
            return res.status(400).json({ success: false, message: "Invalid simulatorId." });
        }

        const simulator = await prisma.simulator.findUnique({
            where: { id: simId },
            include: { location: true },
        });

        if (!simulator) {
            return res.status(404).json({ success: false, message: "Simulator not found." });
        }

        const slots = buildSlots(date);

        // Fetch all BOOKED reservations for this simulator on this date
        const dayStart = new Date(`${date}T00:00:00.000Z`);
        const dayEnd = new Date(`${date}T23:59:59.999Z`);

        const existingReservations = await prisma.reservation.findMany({
            where: {
                simulatorId: simId,
                status: "BOOKED",
                startTime: { gte: dayStart, lte: dayEnd },
            },
            include: {
                user: { select: { id: true, name: true } },
                dayPasses: { select: { id: true } },
            },
        });
        const now = new Date();
        // Map each slot to its status
        const result = slots.map((slot, index) => {
            if (slot.endTime <= now) return null;
            const reservationsForSlot = existingReservations.filter(
                (r) => r.startTime.getTime() === slot.startTime.getTime()
            );
            // Each reservation = 1 member spot + however many guest passes they added
            const spotsUsed = reservationsForSlot.reduce((sum, r) => sum + 1 + r.dayPasses.length, 0);
            const spotsAvailable = MAX_SPOTS - spotsUsed;

            return {
                slotIndex: index,
                startTime: slot.startTime,
                endTime: slot.endTime,
                label: `${String(SLOT_START_HOURS[index]).padStart(2, "0")}:00 – ${String(SLOT_START_HOURS[index] + SLOT_DURATION_HOURS).padStart(2, "0")}:00`,
                status: spotsAvailable > 0 ? "AVAILABLE" : "FULL",
                spotsTotal: MAX_SPOTS,
                spotsUsed,
                spotsAvailable,
                bookedBy: reservationsForSlot.map((r) => r.user),
            };
        }).filter(Boolean);

        return res.status(200).json({
            success: true,
            date,
            simulator: {
                id: simulator.id,
                name: simulator.name,
                location: simulator.location.name,
            },
            slots: result,
        });
    } catch (error) {
        console.error("getSlots error:", error);
        return res.status(500).json({ success: false, message: "Internal server error." });
    }
};

// ─── POST /reservations/book ──────────────────────────────────────────────────
/**
 * Book a slot. Body: { simulatorId, date, slotIndex }
 * slotIndex: 0–5 (maps to SLOT_START_HOURS)
 */
const bookSlot = async (req, res) => {
    try {
        const { simulatorId, date, slotIndex } = req.body;

        if (!simulatorId || !date || slotIndex === undefined) {
            return res.status(400).json({
                success: false,
                message: "simulatorId, date, and slotIndex are required.",
            });
        }

        if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
            return res.status(400).json({
                success: false,
                message: "date must be in YYYY-MM-DD format.",
            });
        }

        const simId = Number(simulatorId);
        const idx = Number(slotIndex);

        if (!Number.isInteger(simId)) {
            return res.status(400).json({ success: false, message: "Invalid simulatorId." });
        }

        if (!Number.isInteger(idx) || idx < 0 || idx >= SLOT_START_HOURS.length) {
            return res.status(400).json({
                success: false,
                message: `slotIndex must be between 0 and ${SLOT_START_HOURS.length - 1}.`,
            });
        }

        const simulator = await prisma.simulator.findUnique({ where: { id: simId } });
        if (!simulator) {
            return res.status(404).json({ success: false, message: "Simulator not found." });
        }

        if (simulator.status !== "ACTIVE") {
            return res.status(409).json({
                success: false,
                message: "Simulator is not available for booking.",
            });
        }

        const slots = buildSlots(date);
        const { startTime, endTime } = slots[idx];

        // Check spot availability
        const existingForSlot = await prisma.reservation.findMany({
            where: { simulatorId: simId, startTime, status: "BOOKED" },
            include: { dayPasses: { select: { id: true } } },
        });
        const spotsUsed = existingForSlot.reduce((sum, r) => sum + 1 + r.dayPasses.length, 0);

        if (spotsUsed >= MAX_SPOTS) {
            return res.status(409).json({
                success: false,
                message: "This slot is fully booked. No spots remaining.",
            });
        }

        // Prevent the same member from booking the same slot twice
        const alreadyBooked = existingForSlot.find((r) => r.userId === req.user.id);
        if (alreadyBooked) {
            return res.status(409).json({
                success: false,
                message: "You already have a booking for this time slot.",
            });
        }

        // Check if slot is in the past
        if (startTime < new Date()) {
            return res.status(400).json({
                success: false,
                message: "Cannot book a slot in the past.",
            });
        }

        // Require an active paid membership (MONTHLY, MONTHLY_PREMIUM, or YEARLY) to book
        const membership = await prisma.membership.findUnique({
            where: { userId: req.user.id },
            select: { type: true, status: true },
        });
        const BOOKABLE_PLANS = ["MONTHLY", "MONTHLY_PREMIUM", "YEARLY"];
        if (!membership || membership.status !== "active" || !BOOKABLE_PLANS.includes(membership.type)) {
            return res.status(403).json({
                success: false,
                message: "An active membership is required to book a simulator bay. Please purchase a Monthly or Annual plan to get started.",
            });
        }

        // Enforce concurrent reservation limit based on membership plan
        const maxConcurrent = CONCURRENT_LIMITS[membership.type] ?? 1;
        const upcomingCount = await prisma.reservation.count({
            where: { userId: req.user.id, status: "BOOKED", startTime: { gt: new Date() } },
        });
        if (upcomingCount >= maxConcurrent) {
            const msg = maxConcurrent === 1
                ? "Your plan allows only 1 active reservation at a time. Cancel your existing booking first."
                : `Your plan allows up to ${maxConcurrent} active reservations at a time.`;
            return res.status(409).json({ success: false, message: msg });
        }

        const doorCode = generateDoorCode();

        const reservation = await prisma.reservation.create({
            data: {
                userId: req.user.id,
                simulatorId: simId,
                startTime,
                endTime,
                doorCode,
                status: "BOOKED",
            },
            include: {
                simulator: { include: { location: true } },
                user: { select: { id: true, name: true, email: true } },
            },
        });

        // ✅ Send confirmation email (non-blocking — won't fail the booking if email fails)
        sendBookingEmail({
            to: reservation.user.email,
            reservation,
            date,
        }).catch((err) => console.error("Email send failed:", err));

        return res.status(201).json({
            success: true,
            message: "Slot booked successfully.",
            reservation: {
                id: reservation.id,
                date,
                startTime: reservation.startTime,
                endTime: reservation.endTime,
                doorCode: reservation.doorCode,
                status: reservation.status,
                simulator: {
                    id: reservation.simulator.id,
                    name: reservation.simulator.name,
                    location: reservation.simulator.location.name,
                },
                user: reservation.user,
            },
        });


    } catch (error) {
        // Unique constraint = race condition double-booking
        if (error.code === "P2002") {
            return res.status(409).json({
                success: false,
                message: "This slot was just booked by someone else.",
            });
        }
        console.error("bookSlot error:", error);
        return res.status(500).json({ success: false, message: "Internal server error." });
    }
};

// ─── GET /reservations/my ─────────────────────────────────────────────────────
/**
 * Get the logged-in user's reservations (upcoming by default).
 * Query: ?status=BOOKED|CANCELLED&page=1&limit=10
 */
const getMyReservations = async (req, res) => {
    try {
        const { status, page = 1, limit = 10 } = req.query;
        const skip = (Number(page) - 1) * Number(limit);

        const now = new Date();

        let where = {
            userId: req.user.id,
        };

        if (status && status !== "ALL") {
            where.status = status;
        }

        const [reservations, total] = await Promise.all([
            prisma.reservation.findMany({
                where,
                include: {
                    simulator: { include: { location: true } },
                },
                orderBy: { startTime: "asc" },
                skip,
                take: Number(limit),
            }),
            prisma.reservation.count({ where }),
        ]);

        return res.status(200).json({
            success: true,
            total,
            page: Number(page),
            limit: Number(limit),
            reservations: reservations.map((r) => ({
                id: r.id,
                startTime: r.startTime,
                endTime: r.endTime,
                doorCode: r.doorCode,
                status: r.status,
                createdAt: r.createdAt,

                // 👇 Optional: classify booking
                bookingType:
                    r.status === "BOOKED"
                        ? r.startTime < now
                            ? "PAST"
                            : "UPCOMING"
                        : null,

                simulator: {
                    id: r.simulator.id,
                    name: r.simulator.name,
                    location: r.simulator.location.name,
                    address: r.simulator.location.address,
                },
            })),
        });
    } catch (error) {
        console.error("getMyReservations error:", error);
        return res.status(500).json({ success: false, message: "Internal server error." });
    }
};


// ─── GET /reservations (admin) ────────────────────────────────────────────────
/**
 * Admin: get all reservations with filters.
 * Query: ?status=BOOKED|CANCELLED&simulatorId=1&date=YYYY-MM-DD&page=1&limit=20
 */
const getAllReservations = async (req, res) => {
    try {
        const { status, userName, page = 1, limit = 20 } = req.query;
        const skip = (Number(page) - 1) * Number(limit);

        const where = {
            ...(status && status !== "ALL" && { status }),
            ...(userName && {
                user: {
                    name: {
                        contains: userName,
                        mode: "insensitive",
                    },
                },
            }),
        };

        const [reservations, total] = await Promise.all([
            prisma.reservation.findMany({
                where,
                include: {
                    user: { select: { id: true, name: true, email: true } },
                    simulator: { include: { location: true } },
                },
                orderBy: { startTime: "asc" },
                skip,
                take: Number(limit),
            }),
            prisma.reservation.count({ where }),
        ]);

        return res.status(200).json({
            success: true,
            total,
            page: Number(page),
            limit: Number(limit),
            reservations: reservations.map((r) => ({
                id: r.id,
                startTime: r.startTime,
                endTime: r.endTime,
                doorCode: r.doorCode,
                status: r.status,
                createdAt: r.createdAt,
                user: r.user,
                simulator: {
                    id: r.simulator.id,
                    name: r.simulator.name,
                    location: r.simulator.location.name,
                },
            })),
        });
    } catch (error) {
        console.error("getAllReservations error:", error);
        return res.status(500).json({ success: false, message: "Internal server error." });
    }
};
// ─── DELETE /reservations/:id/cancel ─────────────────────────────────────────
/**
 * Cancel a reservation. Members can only cancel their own; admins can cancel any.
 */
const cancelReservation = async (req, res) => {
    try {
        const id = Number(req.params.id);
        if (!Number.isInteger(id)) {
            return res.status(400).json({ success: false, message: "Invalid reservation id." });
        }

        const reservation = await prisma.reservation.findUnique({ where: { id } });

        if (!reservation) {
            return res.status(404).json({ success: false, message: "Reservation not found." });
        }

        // Members can only cancel their own reservations
        if (req.user.role !== "ADMIN" && reservation.userId !== req.user.id) {
            return res.status(403).json({ success: false, message: "Forbidden." });
        }

        if (reservation.status === "CANCELLED") {
            return res.status(409).json({
                success: false,
                message: "Reservation is already cancelled.",
            });
        }

        // Prevent cancelling a slot that has already started
        if (reservation.startTime < new Date()) {
            return res.status(400).json({
                success: false,
                message: "Cannot cancel a reservation that has already started.",
            });
        }

        const updated = await prisma.reservation.update({
            where: { id },
            data: { status: "CANCELLED" },
        });

        return res.status(200).json({
            success: true,
            message: "Reservation cancelled successfully.",
            reservation: { id: updated.id, status: updated.status },
        });
    } catch (error) {
        console.error("cancelReservation error:", error);
        return res.status(500).json({ success: false, message: "Internal server error." });
    }
};

module.exports = {
    getSlots,
    bookSlot,
    getMyReservations,
    getAllReservations,
    cancelReservation,
};