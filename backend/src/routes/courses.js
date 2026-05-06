const express = require("express");
const router = express.Router();
const { getCourses, getCourseById, createCourse, updateCourse, deleteCourse } = require("../controllers/courseController");
const authenticate = require("../middleware/authenticate");
const authorizeAdmin = require("../middleware/authorizeAdmin");

/**
 * @swagger
 * tags:
 *   name: Courses
 *   description: Golf course management
 */

/**
 * @swagger
 * /courses:
 *   get:
 *     summary: List all courses
 *     description: Members see active courses only. Admins can filter by isActive.
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Admin only — filter by active status
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
 *         description: Paginated list of courses
 */
router.get("/", authenticate, getCourses);

/**
 * @swagger
 * /courses/{id}:
 *   get:
 *     summary: Get a single course by ID
 *     tags: [Courses]
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
 *         description: Course details
 *       404:
 *         description: Course not found (or inactive for non-admins)
 */
router.get("/:id", authenticate, getCourseById);

/**
 * @swagger
 * /courses:
 *   post:
 *     summary: Create a new course — admin only
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Augusta National"
 *     responses:
 *       201:
 *         description: Course created
 *       409:
 *         description: Course name already exists
 */
router.post("/", authenticate, authorizeAdmin, createCourse);

/**
 * @swagger
 * /courses/{id}:
 *   patch:
 *     summary: Update a course — admin only
 *     tags: [Courses]
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
 *               name:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Course updated
 *       404:
 *         description: Course not found
 *       409:
 *         description: Name conflict with another course
 */
router.patch("/:id", authenticate, authorizeAdmin, updateCourse);



/**
 * @swagger
 * /courses/{id}:
 *   delete:
 *     summary: Delete a course — admin only
 *     description: Fails if the course has existing scorecards. Deactivate instead.
 *     tags: [Courses]
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
 *         description: Course deleted
 *       404:
 *         description: Course not found
 *       409:
 *         description: Course has scorecards and cannot be deleted
 */
router.delete("/:id", authenticate, authorizeAdmin, deleteCourse);

module.exports = router;




// const express = require("express");
// const router = express.Router();
// const {
//   getCourses,
//   getCourseById,
//   createCourse,
//   updateCourse,
// } = require("../controllers/courseController");
// const authenticate = require("../middleware/authenticate");
// const authorizeAdmin = require("../middleware/authorizeAdmin");

// /**
//  * @swagger
//  * tags:
//  *   name: Courses
//  *   description: Golf course management
//  */

// /**
//  * @swagger
//  * /courses:
//  *   get:
//  *     summary: List all courses
//  *     description: Members see active courses only. Admins can filter by isActive.
//  *     tags: [Courses]
//  *     security:
//  *       - bearerAuth: []
//  *     parameters:
//  *       - in: query
//  *         name: isActive
//  *         schema:
//  *           type: boolean
//  *         description: Admin only — filter by active status
//  *       - in: query
//  *         name: page
//  *         schema:
//  *           type: integer
//  *           default: 1
//  *       - in: query
//  *         name: limit
//  *         schema:
//  *           type: integer
//  *           default: 20
//  *     responses:
//  *       200:
//  *         description: Paginated list of courses
//  */
// router.get("/", authenticate, getCourses);

// /**
//  * @swagger
//  * /courses/{id}:
//  *   get:
//  *     summary: Get a single course by ID
//  *     tags: [Courses]
//  *     security:
//  *       - bearerAuth: []
//  *     parameters:
//  *       - in: path
//  *         name: id
//  *         required: true
//  *         schema:
//  *           type: integer
//  *     responses:
//  *       200:
//  *         description: Course details
//  *       404:
//  *         description: Course not found (or inactive for non-admins)
//  */
// router.get("/:id", authenticate, getCourseById);

// /**
//  * @swagger
//  * /courses:
//  *   post:
//  *     summary: Create a new course — admin only
//  *     tags: [Courses]
//  *     security:
//  *       - bearerAuth: []
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             required: [name, par]
//  *             properties:
//  *               name:
//  *                 type: string
//  *                 example: "Augusta National"
//  *               holes:
//  *                 type: integer
//  *                 example: 18
//  *                 description: Defaults to 18 if omitted
//  *               par:
//  *                 type: integer
//  *                 example: 72
//  *     responses:
//  *       201:
//  *         description: Course created
//  *       409:
//  *         description: Course name already exists
//  */
// router.post("/", authenticate, authorizeAdmin, createCourse);

// /**
//  * @swagger
//  * /courses/{id}:
//  *   patch:
//  *     summary: Update a course — admin only
//  *     tags: [Courses]
//  *     security:
//  *       - bearerAuth: []
//  *     parameters:
//  *       - in: path
//  *         name: id
//  *         required: true
//  *         schema:
//  *           type: integer
//  *     requestBody:
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             properties:
//  *               name:
//  *                 type: string
//  *               holes:
//  *                 type: integer
//  *               par:
//  *                 type: integer
//  *               isActive:
//  *                 type: boolean
//  *     responses:
//  *       200:
//  *         description: Course updated
//  *       404:
//  *         description: Course not found
//  *       409:
//  *         description: Name conflict with another course
//  */
// router.patch("/:id", authenticate, authorizeAdmin, updateCourse);

// module.exports = router;
