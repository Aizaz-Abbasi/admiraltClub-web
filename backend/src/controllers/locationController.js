// src/controllers/locationController.js
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

/**
 * Create a new location.
 * Enforces a hard limit of 1 location across the entire system.
 */
const createLocation = async (req, res) => {
  try {
    const { name, address } = req.body;

    if (!name || !address) {
      return res.status(400).json({
        success: false,
        message: "Name and address are required.",
      });
    }

    // Enforce max 1 location
    const existingCount = await prisma.location.count();
    if (existingCount >= 1) {
      return res.status(409).json({
        success: false,
        message: "A location already exists. Only 1 location is allowed.",
      });
    }

    const location = await prisma.location.create({
      data: { name, address },
    });

    return res.status(201).json({ success: true, location });
  } catch (error) {
    console.error("createLocation error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error." });
  }
};

/**
 * Get all locations (will return at most 1).
 */
const getLocations = async (req, res) => {
  try {
    const locations = await prisma.location.findMany({
      include: { simulators: true },
      orderBy: { createdAt: "asc" },
    });

    return res.status(200).json({ success: true, locations });
  } catch (error) {
    console.error("getLocations error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error." });
  }
};

/**
 * Get a single location by ID.
 */
const getLocationById = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid location id." });
    }

    const location = await prisma.location.findUnique({
      where: { id },
      include: { simulators: true },
    });

    if (!location) {
      return res
        .status(404)
        .json({ success: false, message: "Location not found." });
    }

    return res.status(200).json({ success: true, location });
  } catch (error) {
    console.error("getLocationById error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error." });
  }
};

/**
 * Update a location by ID.
 * Only name and address can be updated.
 */
const updateLocation = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid location id." });
    }
    const { name, address } = req.body;

    if (!name && !address) {
      return res.status(400).json({
        success: false,
        message: "At least one field (name or address) is required.",
      });
    }

    const existing = await prisma.location.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Location not found.",
      });
    }

    const updated = await prisma.location.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(address && { address }),
      },
    });

    return res.status(200).json({ success: true, location: updated });
  } catch (error) {
    console.error("updateLocation error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

/**
 * Delete a location by ID.
 * Also blocked if the location has simulators attached.
 */
const deleteLocation = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid location id." });
    }

    const location = await prisma.location.findUnique({
      where: { id },
      include: { simulators: true },
    });

    if (!location) {
      return res
        .status(404)
        .json({ success: false, message: "Location not found." });
    }

    if (location.simulators.length > 0) {
      return res.status(409).json({
        success: false,
        message:
          "Cannot delete location with active simulators. Remove all simulators first.",
      });
    }

    await prisma.location.delete({ where: { id } });

    return res
      .status(200)
      .json({ success: true, message: "Location deleted successfully." });
  } catch (error) {
    console.error("deleteLocation error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error." });
  }
};

module.exports = {
  createLocation,
  getLocations,
  getLocationById,
  updateLocation,
  deleteLocation,
};
