const express = require("express");
const router = express.Router();
const {
  createScore,
  getMyScores,
  getAllScores,
  updateScore,
  deleteScore,
  adminCreateScore,
} = require("../controllers/scorecardController");
const authenticate = require("../middleware/authenticate");
const authorizeAdmin = require("../middleware/authorizeAdmin");

/**
 * @swagger
 * tags:
 *   name: Scorecards
 *   description: Golf score tracking
 */

/**
 * @swagger
 * /scorecards:
 *   post:
 *     summary: Log a score for the authenticated user
 *     tags: [Scorecards]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [courseId, score]
 *             properties:
 *               courseId:
 *                 type: integer
 *                 example: 1
 *               score:
 *                 type: integer
 *                 example: 72
 *               datePlayed:
 *                 type: string
 *                 format: date-time
 *                 example: "2025-06-15T10:00:00.000Z"
 *     responses:
 *       201:
 *         description: Score recorded successfully
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Course not found
 *       409:
 *         description: Course is inactive
 */
router.post("/", authenticate, createScore);

/**
 * @swagger
 * /scorecards/admin:
 *   post:
 *     summary: Admin — log a score for any user
 *     tags: [Scorecards]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [userId, courseId, score]
 *             properties:
 *               userId:
 *                 type: integer
 *                 example: 1
 *               courseId:
 *                 type: integer
 *                 example: 1
 *               score:
 *                 type: integer
 *                 example: 72
 *               datePlayed:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Score recorded
 *       404:
 *         description: User or course not found
 *       409:
 *         description: Course is inactive
 */
router.post("/admin", authenticate, adminCreateScore);

/**
 * @swagger
 * /scorecards/my:
 *   get:
 *     summary: Get current user's scorecards
 *     tags: [Scorecards]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: courseId
 *         schema:
 *           type: integer
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Paginated scorecards with personal stats
 */
router.get("/my", authenticate, getMyScores);

/**
 * @swagger
 * /scorecards:
 *   get:
 *     summary: Get all scorecards — admin only
 *     tags: [Scorecards]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: courseId
 *         schema:
 *           type: integer
 *       - in: query
 *         name: userId
 *         schema:
 *           type: integer
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: Paginated list of all scorecards
 */
router.get("/", authenticate, getAllScores);

/**
 * @swagger
 * /scorecards/{id}:
 *   patch:
 *     summary: Update a scorecard
 *     tags: [Scorecards]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               score:
 *                 type: integer
 *               datePlayed:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Score updated
 *       404:
 *         description: Scorecard not found
 */
router.patch("/:id", authenticate, updateScore);

/**
 * @swagger
 * /scorecards/{id}:
 *   delete:
 *     summary: Delete a scorecard
 *     tags: [Scorecards]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Score deleted
 *       404:
 *         description: Scorecard not found
 */
router.delete("/:id", authenticate, deleteScore);

module.exports = router;