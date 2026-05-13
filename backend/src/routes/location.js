// src/routes/location.js
const express = require("express");
const router = express.Router();
const {
  createLocation,
  getLocations,
  getLocationById,
  deleteLocation,
  updateLocation,
} = require("../controllers/locationController");
const authenticate = require("../middleware/authenticate");
const authorizeAdmin = require("../middleware/authorizeAdmin"); // allow only admins to create

/**
 * @swagger
 * tags:
 *   name: Locations
 *   description: Golf simulator locations (max 1 allowed)
 */

/**
 * @swagger
 * /locations:
 *   post:
 *     summary: Create a location (admin only, max 1 allowed)
 *     tags: [Locations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, address]
 *             properties:
 *               name:
 *                 type: string
 *                 example: Downtown Golf Hub
 *               address:
 *                 type: string
 *                 example: 123 Main St, New York, NY 10001
 *     responses:
 *       201:
 *         description: Location created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 location:
 *                   $ref: '#/components/schemas/Location'
 *       400:
 *         description: Missing required fields
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden – admin access required
 *       409:
 *         description: A location already exists (max 1 allowed)
 */
router.post("/", authenticate, authorizeAdmin, createLocation);

/**
 * @swagger
 * /locations:
 *   get:
 *     summary: Get all locations (returns at most 1)
 *     tags: [Locations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of locations
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 locations:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Location'
 *       401:
 *         description: Unauthorized
 */
router.get("/", authenticate, getLocations);

/**
 * @swagger
 * /locations/{id}:
 *   get:
 *     summary: Get a location by ID
 *     tags: [Locations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Location ID
 *     responses:
 *       200:
 *         description: Location found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 location:
 *                   $ref: '#/components/schemas/Location'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Location not found
 */
router.get("/:id", authenticate, getLocationById);

/**
 * @swagger
 * /locations/{id}:
 *   delete:
 *     summary: Delete a location by ID (admin only)
 *     tags: [Locations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Location ID
 *     responses:
 *       200:
 *         description: Location deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Location deleted successfully.
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden – admin access required
 *       404:
 *         description: Location not found
 *       409:
 *         description: Cannot delete – location has active simulators
 */
router.delete("/:id", authenticate, authorizeAdmin, deleteLocation);

/**
 * @swagger
 * /locations/{id}:
 *   put:
 *     summary: Update a location by ID (admin only)
 *     tags: [Locations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Location ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Uptown Golf Hub
 *               address:
 *                 type: string
 *                 example: 456 Park Ave, New York, NY 10022
 *     responses:
 *       200:
 *         description: Location updated successfully
 *       400:
 *         description: No valid fields provided
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden – admin access required
 *       404:
 *         description: Location not found
 */
router.put("/:id", authenticate, authorizeAdmin, updateLocation);

/**
 *   schemas:
 *     Location:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: "e2a1b3c4-..."
 *         name:
 *           type: string
 *           example: Downtown Golf Hub
 *         address:
 *           type: string
 *           example: 123 Main St, New York, NY 10001
 *         createdAt:
 *           type: string
 *           format: date-time
 *         simulators:
 *           type: array
 *           items:
 *             type: object
 */

module.exports = router;
