// src/controllers/scorecardController.js
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// ─── POST /scorecards ─────────────────────────────────────────────────────────
const createScore = async (req, res) => {
  try {
    // GUEST users cannot submit scores
    if (req.user.role === 'GUEST') {
      return res.status(403).json({ success: false, message: 'Guests cannot add scores.' });
    }

    // Non-admin members must have an active MONTHLY or YEARLY membership
    if (req.user.role !== 'ADMIN') {
      const membership = await prisma.membership.findUnique({
        where: { userId: req.user.id },
        select: { status: true, type: true },
      });
      const isActive =
        membership?.status === 'active' &&
        (membership?.type === 'MONTHLY' || membership?.type === 'YEARLY');
      if (!isActive) {
        return res.status(403).json({ success: false, message: 'An active membership is required to add scores.' });
      }
    }

    const { courseId, score, datePlayed } = req.body;

    if (courseId === undefined || score === undefined) {
      return res.status(400).json({
        success: false,
        message: "courseId and score are required.",
      });
    }

    const courseIdNum = Number(courseId);
    const scoreNum = Number(score);

    if (!Number.isInteger(courseIdNum) || courseIdNum <= 0) {
      return res.status(400).json({ success: false, message: "Invalid courseId." });
    }

    if (!Number.isInteger(scoreNum) || scoreNum < 1) {
      return res.status(400).json({
        success: false,
        message: "score must be a positive integer.",
      });
    }

    if (datePlayed && isNaN(Date.parse(datePlayed))) {
      return res.status(400).json({
        success: false,
        message: "datePlayed must be a valid ISO date string.",
      });
    }

    const course = await prisma.course.findUnique({ where: { id: courseIdNum } });

    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found." });
    }

    if (!course.isActive) {
      return res.status(409).json({
        success: false,
        message: "Cannot log a score for an inactive course.",
      });
    }

    const scorecard = await prisma.scorecard.create({
      data: {
        userId: req.user.id,
        courseId: courseIdNum,
        score: scoreNum,
        datePlayed: datePlayed ? new Date(datePlayed) : new Date(),
      },
      include: {
        course: { select: { id: true, name: true } },
        user: { select: { id: true, name: true, email: true } },
      },
    });

    return res.status(201).json({
      success: true,
      message: "Score recorded successfully.",
      scorecard: formatScorecard(scorecard),
    });
  } catch (error) {
    console.error("createScore error:", error);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};

// ─── PATCH /scorecards/:id ────────────────────────────────────────────────────
const updateScore = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ success: false, message: "Invalid scorecard id." });
    }

    const { score, datePlayed } = req.body;

    if (score === undefined && datePlayed === undefined) {
      return res.status(400).json({
        success: false,
        message: "At least one field (score, datePlayed) is required.",
      });
    }

    const existing = await prisma.scorecard.findUnique({ where: { id } });

    if (!existing) {
      return res.status(404).json({ success: false, message: "Scorecard not found." });
    }

    // Ownership check — disabled for now
    // if (req.user.role !== "ADMIN" && existing.userId !== req.user.id) {
    //   return res.status(403).json({ success: false, message: "Forbidden." });
    // }

    const data = {};

    if (score !== undefined) {
      const scoreNum = Number(score);
      if (!Number.isInteger(scoreNum) || scoreNum < 1) {
        return res.status(400).json({ success: false, message: "score must be a positive integer." });
      }
      data.score = scoreNum;
    }

    if (datePlayed !== undefined) {
      if (isNaN(Date.parse(datePlayed))) {
        return res.status(400).json({ success: false, message: "datePlayed must be a valid ISO date string." });
      }
      data.datePlayed = new Date(datePlayed);
    }

    const updated = await prisma.scorecard.update({
      where: { id },
      data,
      include: {
        course: { select: { id: true, name: true } },
        user: { select: { id: true, name: true, email: true } },
      },
    });

    return res.status(200).json({
      success: true,
      message: "Score updated successfully.",
      scorecard: formatScorecard(updated),
    });
  } catch (error) {
    console.error("updateScore error:", error);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};

// ─── DELETE /scorecards/:id ───────────────────────────────────────────────────
const deleteScore = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ success: false, message: "Invalid scorecard id." });
    }

    const existing = await prisma.scorecard.findUnique({ where: { id } });

    if (!existing) {
      return res.status(404).json({ success: false, message: "Scorecard not found." });
    }

    // Ownership check — disabled for now
    // if (req.user.role !== "ADMIN" && existing.userId !== req.user.id) {
    //   return res.status(403).json({ success: false, message: "Forbidden." });
    // }

    await prisma.scorecard.delete({ where: { id } });

    return res.status(200).json({ success: true, message: "Score deleted successfully." });
  } catch (error) {
    console.error("deleteScore error:", error);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};

// ─── POST /scorecards/admin ───────────────────────────────────────────────────
const adminCreateScore = async (req, res) => {
  try {
    const { userId, courseId, score, datePlayed } = req.body;

    if (userId === undefined || courseId === undefined || score === undefined) {
      return res.status(400).json({
        success: false,
        message: "userId, courseId and score are required.",
      });
    }

    const userIdNum = Number(userId);
    const courseIdNum = Number(courseId);
    const scoreNum = Number(score);

    if (!Number.isInteger(userIdNum) || userIdNum <= 0) {
      return res.status(400).json({ success: false, message: "Invalid userId." });
    }
    if (!Number.isInteger(courseIdNum) || courseIdNum <= 0) {
      return res.status(400).json({ success: false, message: "Invalid courseId." });
    }
    if (!Number.isInteger(scoreNum) || scoreNum < 1) {
      return res.status(400).json({ success: false, message: "score must be a positive integer." });
    }
    if (datePlayed && isNaN(Date.parse(datePlayed))) {
      return res.status(400).json({ success: false, message: "datePlayed must be a valid ISO date string." });
    }

    const user = await prisma.user.findUnique({ where: { id: userIdNum } });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    const course = await prisma.course.findUnique({ where: { id: courseIdNum } });
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found." });
    }
    if (!course.isActive) {
      return res.status(409).json({
        success: false,
        message: "Cannot log a score for an inactive course.",
      });
    }

    const scorecard = await prisma.scorecard.create({
      data: {
        userId: userIdNum,
        courseId: courseIdNum,
        score: scoreNum,
        datePlayed: datePlayed ? new Date(datePlayed) : new Date(),
      },
      include: {
        course: { select: { id: true, name: true } },
        user: { select: { id: true, name: true, email: true } },
      },
    });

    return res.status(201).json({
      success: true,
      message: "Score recorded successfully.",
      scorecard: formatScorecard(scorecard),
    });
  } catch (error) {
    console.error("adminCreateScore error:", error);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};

// ─── GET /scorecards/my ───────────────────────────────────────────────────────
const getMyScores = async (req, res) => {
  try {
    const { courseId, page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where = {
      userId: req.user.id,
      ...(courseId && { courseId: Number(courseId) }),
    };

    const [scorecards, total] = await Promise.all([
      prisma.scorecard.findMany({
        where,
        include: {
          course: { select: { id: true, name: true } },
        },
        orderBy: { datePlayed: "desc" },
        skip,
        take: Number(limit),
      }),
      prisma.scorecard.count({ where }),
    ]);

    const scores = scorecards.map((s) => s.score);
    const bestScore = scores.length ? Math.min(...scores) : null;
    const avgScore = scores.length
      ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10
      : null;

    return res.status(200).json({
      success: true,
      total,
      page: Number(page),
      limit: Number(limit),
      stats: { bestScore, avgScore, totalRounds: total },
      scorecards: scorecards.map((s) => formatScorecard(s)),
    });
  } catch (error) {
    console.error("getMyScores error:", error);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};

// ─── GET /scorecards (admin) ──────────────────────────────────────────────────
const getAllScores = async (req, res) => {
  try {
    const { courseId, userId, page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where = {
      ...(courseId && { courseId: Number(courseId) }),
      ...(userId && { userId: Number(userId) }),
    };

    const [scorecards, total] = await Promise.all([
      prisma.scorecard.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, email: true } },
          course: { select: { id: true, name: true } },
        },
        orderBy: { datePlayed: "desc" },
        skip,
        take: Number(limit),
      }),
      prisma.scorecard.count({ where }),
    ]);

    return res.status(200).json({
      success: true,
      total,
      page: Number(page),
      limit: Number(limit),
      scorecards: scorecards.map((s) => ({
        ...formatScorecard(s),
        user: s.user,
      })),
    });
  } catch (error) {
    console.error("getAllScores error:", error);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};

// ─── Shared formatter ─────────────────────────────────────────────────────────
function formatScorecard(s) {
  return {
    id: s.id,
    score: s.score,
    datePlayed: s.datePlayed,
    createdAt: s.createdAt,
    course: s.course,
    ...(s.user && { user: s.user }),
  };
}

module.exports = { createScore, getMyScores, getAllScores, updateScore, deleteScore, adminCreateScore };