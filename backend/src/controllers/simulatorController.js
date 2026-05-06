// src/controllers/simulatorController.js
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const VALID_STATUSES = new Set(["ACTIVE", "MAINTENANCE"]);

const parseIntParam = (value) => {
  const n = Number(value);
  return Number.isInteger(n) ? n : null;
};

const getSimulators = async (req, res) => {
  try {
    const { locationId, status } = req.query;
    const where = {};

    if (locationId !== undefined) {
      const locId = parseIntParam(locationId);
      if (locId === null) {
        return res.status(400).json({
          success: false,
          message: "locationId must be an integer.",
        });
      }
      where.locationId = locId;
    }

    if (status !== undefined) {
      if (!VALID_STATUSES.has(status)) {
        return res.status(400).json({
          success: false,
          message: "status must be ACTIVE or MAINTENANCE.",
        });
      }
      where.status = status;
    }

    const simulators = await prisma.simulator.findMany({
      where,
      include: { location: true },
      orderBy: { createdAt: "asc" },
    });

    return res.status(200).json({ success: true, simulators });
  } catch (error) {
    console.error("getSimulators error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error." });
  }
};

const createSimulator = async (req, res) => {
  try {
    const { name, locationId, status } = req.body;

    if (!name || locationId === undefined || locationId === null) {
      return res.status(400).json({
        success: false,
        message: "name and locationId are required.",
      });
    }

    const locId = parseIntParam(locationId);
    if (locId === null) {
      return res.status(400).json({
        success: false,
        message: "locationId must be an integer.",
      });
    }

    if (status && !VALID_STATUSES.has(status)) {
      return res.status(400).json({
        success: false,
        message: "status must be ACTIVE or MAINTENANCE.",
      });
    }

    const location = await prisma.location.findUnique({
      where: { id: locId },
      select: { id: true },
    });
    if (!location) {
      return res.status(404).json({
        success: false,
        message: "Location not found.",
      });
    }

    const simulator = await prisma.simulator.create({
      data: {
        name,
        locationId: locId,
        ...(status ? { status } : {}),
      },
      include: { location: true },
    });

    return res.status(201).json({ success: true, simulator });
  } catch (error) {
    console.error("createSimulator error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error." });
  }
};

const updateSimulator = async (req, res) => {
  try {
    const id = parseIntParam(req.params.id);
    if (id === null) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid simulator id." });
    }

    const { name, locationId, status } = req.body;
    if (name === undefined && locationId === undefined && status === undefined) {
      return res.status(400).json({
        success: false,
        message: "At least one field (name, locationId, status) is required.",
      });
    }

    if (status !== undefined && !VALID_STATUSES.has(status)) {
      return res.status(400).json({
        success: false,
        message: "status must be ACTIVE or MAINTENANCE.",
      });
    }

    let locId;
    if (locationId !== undefined) {
      locId = parseIntParam(locationId);
      if (locId === null) {
        return res.status(400).json({
          success: false,
          message: "locationId must be an integer.",
        });
      }

      const location = await prisma.location.findUnique({
        where: { id: locId },
        select: { id: true },
      });
      if (!location) {
        return res.status(404).json({
          success: false,
          message: "Location not found.",
        });
      }
    }

    const existing = await prisma.simulator.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Simulator not found.",
      });
    }

    const simulator = await prisma.simulator.update({
      where: { id },
      data: {
        ...(name !== undefined ? { name } : {}),
        ...(locId !== undefined ? { locationId: locId } : {}),
        ...(status !== undefined ? { status } : {}),
      },
      include: { location: true },
    });

    return res.status(200).json({ success: true, simulator });
  } catch (error) {
    console.error("updateSimulator error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error." });
  }
};

const deleteSimulator = async (req, res) => {
  try {
    const id = parseIntParam(req.params.id);
    if (id === null) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid simulator id." });
    }

    const simulator = await prisma.simulator.findUnique({
      where: { id },
      include: { reservations: true },
    });

    if (!simulator) {
      return res.status(404).json({
        success: false,
        message: "Simulator not found.",
      });
    }

    if (simulator.reservations.length > 0) {
      return res.status(409).json({
        success: false,
        message:
          "Cannot delete simulator with existing reservations. Remove reservations first.",
      });
    }

    await prisma.simulator.delete({ where: { id } });

    return res
      .status(200)
      .json({ success: true, message: "Simulator deleted successfully." });
  } catch (error) {
    console.error("deleteSimulator error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error." });
  }
};

module.exports = {
  getSimulators,
  createSimulator,
  updateSimulator,
  deleteSimulator,
};

