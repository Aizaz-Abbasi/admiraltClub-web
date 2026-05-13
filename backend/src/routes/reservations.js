// src/routes/reservations.js
const express = require("express");
const router = express.Router();
const {
  getSlots,
  bookSlot,
  getMyReservations,
  getAllReservations,
  cancelReservation,
} = require("../controllers/reservationController");
const authenticate = require("../middleware/authenticate");
const authorizeAdmin = require("../middleware/authorizeAdmin");

/**
 * @swagger
 * tags:
 *   name: Reservations
 *   description: Slot browsing, booking, and cancellation
 */

/**
 * @swagger
 * /reservations/slots:
 *   get:
 *     summary: Get all time slots for a simulator on a given date
 *     tags: [Reservations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *           example: "2025-06-15"
 *         description: Date in YYYY-MM-DD format
 *       - in: query
 *         name: simulatorId
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *         description: Simulator ID
 *     responses:
 *       200:
 *         description: List of 6 four-hour slots with AVAILABLE or BOOKED status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 date:
 *                   type: string
 *                 simulator:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     name:
 *                       type: string
 *                     location:
 *                       type: string
 *                 slots:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       slotIndex:
 *                         type: integer
 *                         example: 0
 *                       startTime:
 *                         type: string
 *                         format: date-time
 *                       endTime:
 *                         type: string
 *                         format: date-time
 *                       label:
 *                         type: string
 *                         example: "00:00 – 04:00"
 *                       status:
 *                         type: string
 *                         enum: [AVAILABLE, BOOKED]
 *                       reservationId:
 *                         type: integer
 *                         nullable: true
 *                       bookedBy:
 *                         type: object
 *                         nullable: true
 *       400:
 *         description: Missing or invalid query params
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Simulator not found
 */
router.get("/slots", authenticate, getSlots);

/**
 * @swagger
 * /reservations/book:
 *   post:
 *     summary: Book a time slot
 *     tags: [Reservations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [simulatorId, date, slotIndex]
 *             properties:
 *               simulatorId:
 *                 type: integer
 *                 example: 1
 *               date:
 *                 type: string
 *                 example: "2025-06-15"
 *               slotIndex:
 *                 type: integer
 *                 example: 2
 *                 description: "0=00:00-04:00, 1=04:00-08:00, 2=08:00-12:00, 3=12:00-16:00, 4=16:00-20:00, 5=20:00-00:00"
 *     responses:
 *       201:
 *         description: Slot booked successfully, returns reservation with door code
 *       400:
 *         description: Invalid input or slot in the past
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Simulator not found
 *       409:
 *         description: Slot already booked or simulator unavailable
 */
router.post("/book", authenticate, bookSlot);

/**
 * @swagger
 * /reservations/my:
 *   get:
 *     summary: Get current user's reservations
 *     description: |
 *       Returns paginated reservations for the authenticated user.
 *       
 *       - If `status` is provided, results are filtered by that status.
 *       - If `status=ALL` or omitted, all reservations are returned (BOOKED, CANCELLED, COMPLETED).
 *       - BOOKED reservations may include both past and upcoming entries.
 *     tags: [Reservations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [BOOKED, CANCELLED, COMPLETED, ALL]
 *         required: false
 *         description: Filter by reservation status. Use ALL or omit to fetch all reservations.
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         required: false
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         required: false
 *         description: Number of records per page
 *     responses:
 *       200:
 *         description: Paginated list of user's reservations
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               total: 4
 *               page: 1
 *               limit: 10
 *               reservations:
 *                 - id: 2
 *                   startTime: "2026-04-06T08:00:00.000Z"
 *                   endTime: "2026-04-06T12:00:00.000Z"
 *                   doorCode: "6910"
 *                   status: "BOOKED"
 *                   createdAt: "2026-04-06T19:30:18.319Z"
 *                   bookingType: "UPCOMING"
 *                   simulator:
 *                     id: 1
 *                     name: "TEST_1"
 *                     location: "Uptown Golf Hub"
 *                     address: "456 Park Ave, New York, NY 10022"
 *       401:
 *         description: Unauthorized
 */
router.get("/my", authenticate, getMyReservations);

/**
 * @swagger
 * /reservations:
 *   get:
 *     summary: Get all reservations (admin only)
 *     tags: [Reservations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [ALL, BOOKED, CANCELLED, COMPLETED]
 *           default: ALL
 *         description: Filter by reservation status. Use ALL or omit to return every status.
 *       - in: query
 *         name: userName
 *         schema:
 *           type: string
 *         description: Search reservations by user name (case-insensitive partial match).
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
 *         description: Paginated list of all reservations
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden – admin only
 */
router.get("/", authenticate, authorizeAdmin, getAllReservations);

/**
 * @swagger
 * /reservations/{id}/cancel:
 *   patch:
 *     summary: Cancel a reservation
 *     tags: [Reservations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Reservation ID
 *     responses:
 *       200:
 *         description: Reservation cancelled successfully
 *       400:
 *         description: Reservation has already started
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden – not your reservation
 *       404:
 *         description: Reservation not found
 *       409:
 *         description: Already cancelled
 */
router.patch("/:id/cancel", authenticate, cancelReservation);

module.exports = router;

// // src/routes/reservations.js
// const express = require("express");
// const router = express.Router();

// router.get("/", (req, res) => {
//   res.json({ message: "reservations route working" });
// });

// module.exports = router;
