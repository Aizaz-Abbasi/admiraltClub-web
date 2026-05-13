// src/routes/simulators.js
const express = require("express");
const router = express.Router();

const authenticate = require("../middleware/authenticate");
const authorizeAdmin = require("../middleware/authorizeAdmin");
const {
  getSimulators,
  createSimulator,
  updateSimulator,
  deleteSimulator,
} = require("../controllers/simulatorController");

/**
 * @swagger
 * tags:
 *   name: Simulators
 *   description: Golf simulators
 */

/**
 * @swagger
 * /simulators:
 *   get:
 *     summary: Get simulators list
 *     tags: [Simulators]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: locationId
 *         required: false
 *         schema:
 *           type: integer
 *         description: Filter by location ID
 *       - in: query
 *         name: status
 *         required: false
 *         schema:
 *           type: string
 *           enum: [ACTIVE, MAINTENANCE]
 *         description: Filter by simulator status
 *     responses:
 *       200:
 *         description: Simulators fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 simulators:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Simulator'
 *       400:
 *         description: Invalid filter values
 *       401:
 *         description: Unauthorized
 *   post:
 *     summary: Create a simulator (admin only)
 *     tags: [Simulators]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, locationId]
 *             properties:
 *               name:
 *                 type: string
 *                 example: Bay 1
 *               locationId:
 *                 type: integer
 *                 example: 1
 *               status:
 *                 type: string
 *                 enum: [ACTIVE, MAINTENANCE]
 *                 example: ACTIVE
 *     responses:
 *       201:
 *         description: Simulator created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 simulator:
 *                   $ref: '#/components/schemas/Simulator'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden – admin access required
 *       404:
 *         description: Location not found
 */
router.get("/", authenticate, getSimulators);
router.post("/", authenticate, authorizeAdmin, createSimulator);

/**
 * @swagger
 * /simulators/{id}:
 *   put:
 *     summary: Update a simulator (admin only)
 *     tags: [Simulators]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Simulator ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Bay 2
 *               locationId:
 *                 type: integer
 *                 example: 1
 *               status:
 *                 type: string
 *                 enum: [ACTIVE, MAINTENANCE]
 *                 example: MAINTENANCE
 *     responses:
 *       200:
 *         description: Simulator updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 simulator:
 *                   $ref: '#/components/schemas/Simulator'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden – admin access required
 *       404:
 *         description: Simulator or location not found
 */
router.put("/:id", authenticate, authorizeAdmin, updateSimulator);

/**
 * @swagger
 * /simulators/{id}:
 *   delete:
 *     summary: Delete a simulator (admin only)
 *     tags: [Simulators]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Simulator ID
 *     responses:
 *       200:
 *         description: Simulator deleted successfully
 *       400:
 *         description: Invalid id
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden – admin access required
 *       404:
 *         description: Simulator not found
 *       409:
 *         description: Cannot delete simulator with existing reservations
 */
router.delete("/:id", authenticate, authorizeAdmin, deleteSimulator);

module.exports = router;
