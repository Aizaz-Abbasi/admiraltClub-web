// src/controllers/courseController.js
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// ─── GET /courses ─────────────────────────────────────────────────────────────
const getCourses = async (req, res) => {
  try {
    const { isActive, page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const isAdmin = req.user?.role === "ADMIN";

    const where = {};

    if (isAdmin && isActive !== undefined) {
      where.isActive = isActive === "true";
    } else if (!isAdmin) {
      where.isActive = true;
    }

    const [courses, total] = await Promise.all([
      prisma.course.findMany({
        where,
        orderBy: { name: "asc" },
        skip,
        take: Number(limit),
      }),
      prisma.course.count({ where }),
    ]);

    return res.status(200).json({
      success: true,
      total,
      page: Number(page),
      limit: Number(limit),
      courses,
    });
  } catch (error) {
    console.error("getCourses error:", error);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};

// ─── GET /courses/:id ─────────────────────────────────────────────────────────
const getCourseById = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ success: false, message: "Invalid course id." });
    }

    const course = await prisma.course.findUnique({ where: { id } });

    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found." });
    }

    if (!course.isActive && req.user?.role !== "ADMIN") {
      return res.status(404).json({ success: false, message: "Course not found." });
    }

    return res.status(200).json({ success: true, course });
  } catch (error) {
    console.error("getCourseById error:", error);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};

// ─── POST /courses (admin) ────────────────────────────────────────────────────
const createCourse = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return res.status(400).json({ success: false, message: "name is required." });
    }

    const existing = await prisma.course.findFirst({
      where: { name: { equals: name.trim(), mode: "insensitive" } },
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: "A course with this name already exists.",
      });
    }

    const course = await prisma.course.create({
      data: { name: name.trim() },
    });

    return res.status(201).json({
      success: true,
      message: "Course created successfully.",
      course,
    });
  } catch (error) {
    console.error("createCourse error:", error);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};

// ─── PATCH /courses/:id (admin) ───────────────────────────────────────────────
const updateCourse = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ success: false, message: "Invalid course id." });
    }

    const { name, isActive } = req.body;

    if (name === undefined && isActive === undefined) {
      return res.status(400).json({
        success: false,
        message: "At least one field (name, isActive) is required.",
      });
    }

    const existing = await prisma.course.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: "Course not found." });
    }

    const data = {};

    if (name !== undefined) {
      if (typeof name !== "string" || !name.trim()) {
        return res.status(400).json({ success: false, message: "name must be a non-empty string." });
      }
      const nameConflict = await prisma.course.findFirst({
        where: {
          name: { equals: name.trim(), mode: "insensitive" },
          NOT: { id },
        },
      });
      if (nameConflict) {
        return res.status(409).json({
          success: false,
          message: "Another course with this name already exists.",
        });
      }
      data.name = name.trim();
    }

    if (isActive !== undefined) {
      if (typeof isActive !== "boolean") {
        return res.status(400).json({ success: false, message: "isActive must be a boolean." });
      }
      data.isActive = isActive;
    }

    const updated = await prisma.course.update({ where: { id }, data });

    return res.status(200).json({
      success: true,
      message: "Course updated successfully.",
      course: updated,
    });
  } catch (error) {
    console.error("updateCourse error:", error);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};


// ─── DELETE /courses/:id (admin) ──────────────────────────────────────────────
const deleteCourse = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ success: false, message: "Invalid course id." });
    }

    const existing = await prisma.course.findUnique({
      where: { id },
      include: { scorecards: { take: 1 } },
    });

    if (!existing) {
      return res.status(404).json({ success: false, message: "Course not found." });
    }

    // Prevent deleting a course that has scorecards
    if (existing.scorecards.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Cannot delete a course with existing scorecards. Deactivate it instead.",
      });
    }

    await prisma.course.delete({ where: { id } });

    return res.status(200).json({ success: true, message: "Course deleted successfully." });
  } catch (error) {
    console.error("deleteCourse error:", error);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};

module.exports = { getCourses, getCourseById, createCourse, updateCourse, deleteCourse };





//with hoes and pars
// // src/controllers/courseController.js
// const { PrismaClient } = require("@prisma/client");
// const prisma = new PrismaClient();

// // ─── GET /courses ─────────────────────────────────────────────────────────────
// /**
//  * List all courses. Members see only active ones; admins see all.
//  * Query: ?isActive=true|false&page=1&limit=20   (isActive filter admin-only)
//  */
// const getCourses = async (req, res) => {
//   try {
//     const { isActive, page = 1, limit = 20 } = req.query;
//     const skip = (Number(page) - 1) * Number(limit);
//     const isAdmin = req.user?.role === "ADMIN";

//     const where = {};

//     if (isAdmin && isActive !== undefined) {
//       // Admin can filter by isActive explicitly
//       where.isActive = isActive === "true";
//     } else if (!isAdmin) {
//       // Members always get active courses only
//       where.isActive = true;
//     }

//     const [courses, total] = await Promise.all([
//       prisma.course.findMany({
//         where,
//         orderBy: { name: "asc" },
//         skip,
//         take: Number(limit),
//       }),
//       prisma.course.count({ where }),
//     ]);

//     return res.status(200).json({
//       success: true,
//       total,
//       page: Number(page),
//       limit: Number(limit),
//       courses,
//     });
//   } catch (error) {
//     console.error("getCourses error:", error);
//     return res
//       .status(500)
//       .json({ success: false, message: "Internal server error." });
//   }
// };

// // ─── GET /courses/:id ─────────────────────────────────────────────────────────
// const getCourseById = async (req, res) => {
//   try {
//     const id = Number(req.params.id);
//     if (!Number.isInteger(id) || id <= 0) {
//       return res
//         .status(400)
//         .json({ success: false, message: "Invalid course id." });
//     }

//     const course = await prisma.course.findUnique({ where: { id } });

//     if (!course) {
//       return res
//         .status(404)
//         .json({ success: false, message: "Course not found." });
//     }

//     // Non-admins cannot view inactive courses
//     if (!course.isActive && req.user?.role !== "ADMIN") {
//       return res
//         .status(404)
//         .json({ success: false, message: "Course not found." });
//     }

//     return res.status(200).json({ success: true, course });
//   } catch (error) {
//     console.error("getCourseById error:", error);
//     return res
//       .status(500)
//       .json({ success: false, message: "Internal server error." });
//   }
// };

// // ─── POST /courses (admin) ────────────────────────────────────────────────────
// /**
//  * Create a new course.
//  * Body: { name, holes?, par }
//  */
// const createCourse = async (req, res) => {
//   try {
//     const { name, holes = 18, par } = req.body;

//     if (!name || par === undefined) {
//       return res.status(400).json({
//         success: false,
//         message: "name and par are required.",
//       });
//     }

//     if (typeof name !== "string" || !name.trim()) {
//       return res
//         .status(400)
//         .json({ success: false, message: "name must be a non-empty string." });
//     }

//     const holesNum = Number(holes);
//     const parNum = Number(par);

//     if (!Number.isInteger(holesNum) || holesNum < 1) {
//       return res
//         .status(400)
//         .json({ success: false, message: "holes must be a positive integer." });
//     }

//     if (!Number.isInteger(parNum) || parNum < 1) {
//       return res
//         .status(400)
//         .json({ success: false, message: "par must be a positive integer." });
//     }

//     // Prevent duplicate course names
//     const existing = await prisma.course.findFirst({
//       where: { name: { equals: name.trim(), mode: "insensitive" } },
//     });

//     if (existing) {
//       return res.status(409).json({
//         success: false,
//         message: "A course with this name already exists.",
//       });
//     }

//     const course = await prisma.course.create({
//       data: { name: name.trim(), holes: holesNum, par: parNum },
//     });

//     return res.status(201).json({
//       success: true,
//       message: "Course created successfully.",
//       course,
//     });
//   } catch (error) {
//     console.error("createCourse error:", error);
//     return res
//       .status(500)
//       .json({ success: false, message: "Internal server error." });
//   }
// };

// // ─── PATCH /courses/:id (admin) ───────────────────────────────────────────────
// /**
//  * Update a course. Any combination of: name, holes, par, isActive.
//  * Deactivating a course does NOT delete existing scorecards.
//  */
// const updateCourse = async (req, res) => {
//   try {
//     const id = Number(req.params.id);
//     if (!Number.isInteger(id) || id <= 0) {
//       return res
//         .status(400)
//         .json({ success: false, message: "Invalid course id." });
//     }

//     const { name, holes, par, isActive } = req.body;

//     if (
//       name === undefined &&
//       holes === undefined &&
//       par === undefined &&
//       isActive === undefined
//     ) {
//       return res.status(400).json({
//         success: false,
//         message: "At least one field (name, holes, par, isActive) is required.",
//       });
//     }

//     const existing = await prisma.course.findUnique({ where: { id } });
//     if (!existing) {
//       return res
//         .status(404)
//         .json({ success: false, message: "Course not found." });
//     }

//     // Build update payload — only include fields that were actually sent
//     const data = {};

//     if (name !== undefined) {
//       if (typeof name !== "string" || !name.trim()) {
//         return res.status(400).json({
//           success: false,
//           message: "name must be a non-empty string.",
//         });
//       }
//       // Check for name collision with another course
//       const nameConflict = await prisma.course.findFirst({
//         where: {
//           name: { equals: name.trim(), mode: "insensitive" },
//           NOT: { id },
//         },
//       });
//       if (nameConflict) {
//         return res.status(409).json({
//           success: false,
//           message: "Another course with this name already exists.",
//         });
//       }
//       data.name = name.trim();
//     }

//     if (holes !== undefined) {
//       const holesNum = Number(holes);
//       if (!Number.isInteger(holesNum) || holesNum < 1) {
//         return res.status(400).json({
//           success: false,
//           message: "holes must be a positive integer.",
//         });
//       }
//       data.holes = holesNum;
//     }

//     if (par !== undefined) {
//       const parNum = Number(par);
//       if (!Number.isInteger(parNum) || parNum < 1) {
//         return res
//           .status(400)
//           .json({ success: false, message: "par must be a positive integer." });
//       }
//       data.par = parNum;
//     }

//     if (isActive !== undefined) {
//       if (typeof isActive !== "boolean") {
//         return res
//           .status(400)
//           .json({ success: false, message: "isActive must be a boolean." });
//       }
//       data.isActive = isActive;
//     }

//     const updated = await prisma.course.update({ where: { id }, data });

//     return res.status(200).json({
//       success: true,
//       message: "Course updated successfully.",
//       course: updated,
//     });
//   } catch (error) {
//     console.error("updateCourse error:", error);
//     return res
//       .status(500)
//       .json({ success: false, message: "Internal server error." });
//   }
// };

// module.exports = { getCourses, getCourseById, createCourse, updateCourse };
