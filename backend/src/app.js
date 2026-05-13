// src/app.js
const express = require("express");
const cors = require("cors");
const path = require("path"); // ← add this line
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./swagger");
require("dotenv").config();

const authRoutes = require("./routes/auth");
const reservationRoutes = require("./routes/reservations");
const simulatorRoutes = require("./routes/simulators");
const scorecardRoutes = require("./routes/scorecards");
const leaderboardRoutes = require("./routes/leaderboard");
const adminRoutes = require("./routes/admin");
const courseRoutes = require("./routes/courses");
////
const locationRoutes = require("./routes/location");
const app = express();

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
// IMPORTANT: This must come BEFORE app.use(express.json())
app.use('/api/membership/webhook', express.raw({ type: 'application/json' }));
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Swagger UI
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use("/api/auth", authRoutes);
app.use("/api/reservations", reservationRoutes);
app.use("/api/simulators", simulatorRoutes);
app.use("/api/scorecards", scorecardRoutes);
app.use("/api/leaderboard", leaderboardRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/courses", courseRoutes);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

//
app.use("/api/locations", locationRoutes);

// Then routes
app.use('/api/membership', require('./routes/membership'));

module.exports = app;
