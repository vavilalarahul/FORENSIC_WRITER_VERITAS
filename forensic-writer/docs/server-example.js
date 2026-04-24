// ============================================================
//  server.js — Add this to your EXISTING Express server
//  Just plug the new route in — nothing else changes
// ============================================================

const express = require("express");
const cors    = require("cors");
const fs      = require("fs");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// Make sure uploads folder exists
if (!fs.existsSync("uploads")) fs.mkdirSync("uploads");

// ── Your existing routes (unchanged) ──
// const authRoutes  = require("./routes/auth");
// const caseRoutes  = require("./routes/cases");
// app.use("/api/auth",  authRoutes);
// app.use("/api/cases", caseRoutes);

// ── NEW: Image Analysis Pipeline ──────
const imageAnalysis = require("./imageAnalysis");
app.use("/api", imageAnalysis);

// ── Start server ───────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🚀 ForensiQ Server running on port ${PORT}`);
  console.log(`   Image-only:  POST /api/analyze/image-only`);
  console.log(`   Full:        POST /api/analyze`);
});
