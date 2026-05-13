// src/routes/membership.js
const express = require("express");
const router = express.Router();
const {
    getPlans,
    getMyMembership,
    getMyDayPasses,
    createCheckoutSession,
    handleWebhook,
    verifySession,
    cancelMembership,
    createGuestUser,
} = require("../controllers/membershipController");
const authenticate = require("../middleware/authenticate");

/**
 * @swagger
 * tags:
 *   name: Membership
 *   description: Membership and payments
 */

/**
 * @swagger
 * /membership/webhook:
 *   post:
 *     summary: Stripe webhook — do not call manually
 *     tags: [Membership]
 *     security: []
 */
// ⚠️ Webhook must use raw body — register BEFORE express.json()
// In server.js: app.use('/api/membership/webhook', express.raw({ type: 'application/json' }))
router.post("/webhook", handleWebhook);

// Public — no auth needed to view plan prices
router.get("/plans", getPlans);

/**
 * @swagger
 * /membership/my:
 *   get:
 *     summary: Get current user's membership
 *     tags: [Membership]
 *     security:
 *       - bearerAuth: []
 */
router.get("/my", authenticate, getMyMembership);
router.get("/day-passes", authenticate, getMyDayPasses);

/**
 * @swagger
 * /membership/checkout:
 *   post:
 *     summary: Create Stripe Checkout session
 *     tags: [Membership]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [type]
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [MONTHLY, YEARLY, DAY_PASS]
 *     responses:
 *       200:
 *         description: Stripe Checkout URL
 */
router.post("/checkout", authenticate, createCheckoutSession);

/**
 * @swagger
 * /membership/cancel:
 *   post:
 *     summary: Cancel current membership
 *     tags: [Membership]
 *     security:
 *       - bearerAuth: []
 */
/**
 * @swagger
 * /membership/verify-session:
 *   post:
 *     summary: Verify a Stripe Checkout session and save membership (webhook fallback)
 *     tags: [Membership]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [sessionId]
 *             properties:
 *               sessionId:
 *                 type: string
 */
router.post("/verify-session", authenticate, verifySession);

router.post("/create-guest", authenticate, createGuestUser);

router.post("/cancel", authenticate, cancelMembership);

module.exports = router;