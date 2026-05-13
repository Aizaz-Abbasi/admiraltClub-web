// src/middleware/upload.js
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Create upload folders if they don't exist
const createFolder = (folder) => {
  if (!fs.existsSync(folder)) {
    fs.mkdirSync(folder, { recursive: true });
  }
};

createFolder("uploads/profiles");
createFolder("uploads/licenses");

// Storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === "profilePicture") {
      cb(null, "uploads/profiles");
    } else if (file.fieldname === "drivingLicense") {
      cb(null, "uploads/licenses");
    }
  },
  filename: (req, file, cb) => {
    // userId + timestamp + original extension
    const ext = path.extname(file.originalname);
    const filename = `${req.user.id}-${Date.now()}${ext}`;
    cb(null, filename);
  },
});

// Only allow images and PDFs
const fileFilter = (req, file, cb) => {
  const allowed = [".jpg", ".jpeg", ".png", ".webp", ".pdf"];
  const ext = path.extname(file.originalname).toLowerCase();

  if (allowed.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error("Only jpg, png, webp and pdf files are allowed"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
});

module.exports = upload;
