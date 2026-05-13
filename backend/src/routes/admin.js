// src/routes/admin.js
const express = require("express");
const router = express.Router();
const authenticate = require("../middleware/authenticate");
const authorizeAdmin = require("../middleware/authorizeAdmin");
const { getMembersList, getDashboard } = require("../controllers/adminController");

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Admin management APIs
 */

/**
 * @swagger
 * /admin/members:
 *   get:
 *     summary: Get members list with membership and score stats
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Members fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 users:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       userId:
 *                         type: integer
 *                         example: 1
 *                       name:
 *                         type: string
 *                         example: John Smith
 *                       email:
 *                         type: string
 *                         example: john@test.com
 *                       type:
 *                         type: string
 *                         nullable: true
 *                         enum: [Monthly, Yearly, Daypass]
 *                         example: Monthly
 *                       status:
 *                         type: string
 *                         enum: [Active, Expired]
 *                         example: Active
 *                       rounds:
 *                         type: integer
 *                         example: 12
 *                       avgScore:
 *                         type: number
 *                         nullable: true
 *                         example: 78.5
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden – admin access required
 */
router.get("/members", authenticate, authorizeAdmin, getMembersList);

/**
 * @swagger
 * /admin/dashboard:
 *   get:
 *     summary: Get admin dashboard stats — admin only
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard stats, recent bookings, and system status
 */
router.get("/dashboard", authenticate, authorizeAdmin, getDashboard);

module.exports = router;
