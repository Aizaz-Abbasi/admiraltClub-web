// src/controllers/authController.js
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { PrismaClient } = require("@prisma/client");
const { sendPasswordResetEmail } = require("../services/emailService");
const { uploadToSpaces } = require("../services/spaces");
const prisma = new PrismaClient();

const register = async (req, res) => {
  const { name, email, password, phone } = req.body;

  try {
    if (!name || !email || !password) {
      return res.status(400).json({
        error: "Name, email and password are required",
      });
    }

    const existing = await prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      return res.status(400).json({
        error: "Email already registered",
      });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashed,
        ...(phone && { phone }), // optional field
      },
    });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN },
    );

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({
      error: "Registration failed",
      details: err.message,
    });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, name: true, email: true, password: true, role: true, guestAccessUntil: true },
    });
    if (!user) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    // GUEST accounts can only log in before their booking's end time
    if (user.role === "GUEST") {
      if (!user.guestAccessUntil) {
        return res.status(403).json({ error: "Guest access not configured." });
      }
      if (new Date() > new Date(user.guestAccessUntil)) {
        const formatted = new Date(user.guestAccessUntil).toLocaleString("en-US", {
          weekday: "long", year: "numeric", month: "long", day: "numeric",
          hour: "numeric", minute: "2-digit",
        });
        return res.status(403).json({
          error: `Your guest access expired on ${formatted}.`,
        });
      }
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN },
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("login error:", err);
    res.status(500).json({ error: "Login failed" });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        age: true,   // ← was missing
        role: true,
        profilePicture: true,   // ← was missing
        drivingLicense: true,   // ← was missing
        createdAt: true,
      },
    });
    res.json(user);
  } catch (err) {
    console.error('getProfile error:', err);
    res.status(500).json({ error: 'Could not fetch profile' });
  }
};

const updateProfile = async (req, res) => {
  const { name, phone, age } = req.body;

  try {
    if (!name && !phone && age === undefined) {
      return res.status(400).json({ error: 'Nothing to update' });
    }

    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        ...(name !== undefined && { name }),
        ...(phone !== undefined && { phone }),
        ...(age !== undefined && { age: age === '' ? null : parseInt(age) }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        age: true,
        role: true,
        profilePicture: true,
        drivingLicense: true,
        createdAt: true,
      },
    });

    res.json({ message: 'Profile updated', user: updated });
  } catch (err) {
    console.error('updateProfile error:', err);
    res.status(500).json({ error: 'Update failed', details: err.message });
  }
};

const uploadProfilePicture = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const url = await uploadToSpaces(req.file, "profiles");

    await prisma.user.update({
      where: { id: req.user.id },
      data: { profilePicture: url },
    });

    res.json({ message: "Profile picture updated", path: url });
  } catch (err) {
    console.error("Profile picture upload error:", err);
    res.status(500).json({ error: "Upload failed" });
  }
};

const uploadDrivingLicense = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const url = await uploadToSpaces(req.file, "licenses");

    await prisma.user.update({
      where: { id: req.user.id },
      data: { drivingLicense: url },
    });

    res.json({ message: "Driving license uploaded", path: url });
  } catch (err) {
    console.error("Driving license upload error:", err);
    res.status(500).json({ error: "Upload failed" });
  }
};


const forgotPassword = async (req, res) => {
  const { email } = req.body;
  const genericOk = { message: 'If that email exists, a reset link has been sent.' };
  try {
    if (!email) return res.status(400).json({ error: 'Email is required' });

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, name: true, email: true },
    });

    if (!user) return res.json(genericOk);

    const rawToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
    const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data: { resetToken: hashedToken, resetTokenExpiry: expiry },
    });

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetUrl = `${frontendUrl}/reset-password?token=${rawToken}`;

    try {
      await sendPasswordResetEmail({ to: user.email, name: user.name, resetUrl });
    } catch (emailErr) {
      console.error('Reset email send failed (token still saved):', emailErr?.message ?? emailErr);
    }

    res.json(genericOk);
  } catch (err) {
    console.error('forgotPassword error:', err);
    res.status(500).json({ error: 'Failed to process request' });
  }
};

const resetPassword = async (req, res) => {
  const { token, password } = req.body;
  try {
    if (!token || !password) return res.status(400).json({ error: 'Token and password are required' });
    if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await prisma.user.findFirst({
      where: { resetToken: hashedToken, resetTokenExpiry: { gt: new Date() } },
      select: { id: true },
    });

    if (!user) return res.status(400).json({ error: 'Invalid or expired reset link.' });

    const hashed = await bcrypt.hash(password, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashed, resetToken: null, resetTokenExpiry: null },
    });

    res.json({ message: 'Password has been reset successfully.' });
  } catch (err) {
    console.error('resetPassword error:', err);
    res.status(500).json({ error: 'Failed to reset password' });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  uploadProfilePicture,
  uploadDrivingLicense,
  forgotPassword,
  resetPassword,
};
