// src/server.js
const app = require("./app");

const PORT = process.env.PORT || 5000;

// Surface boot-time failures. Without these, a throw during module load or an
// unhandled rejection exits silently and App Platform only reports
// "readiness probe failed" with no logs.
process.on("uncaughtException", (err) => {
  console.error("FATAL uncaughtException:", err);
  process.exit(1);
});
process.on("unhandledRejection", (err) => {
  console.error("FATAL unhandledRejection:", err);
  process.exit(1);
});

// Bind 0.0.0.0 so the container is reachable from outside, not just localhost.
const server = app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server listening on 0.0.0.0:${PORT}`);
});

server.on("error", (err) => {
  console.error("FATAL server.listen error:", err);
  process.exit(1);
});
