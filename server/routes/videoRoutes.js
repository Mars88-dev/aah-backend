const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const { combineVideos } = require("../controllers/videoController");
const { protect } = require("../middleware/authMiddleware");
const Video = require("../models/Video");

// ✅ Storage engine for uploaded clips and outro
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/temp");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// ✅ POST /api/videos/combine - Requires login
router.post(
  "/combine",
  protect,
  upload.fields([
    { name: "clips", maxCount: 10 },
    { name: "outroFile", maxCount: 1 },
  ]),
  combineVideos
);

// ✅ GET /api/videos - list videos uploaded by logged-in user
router.get("/", protect, async (req, res) => {
  try {
    const videos = await Video.find({ agentId: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json(videos);
  } catch (err) {
    console.error("❌ Error fetching videos:", err);
    res.status(500).json({ error: "Failed to fetch videos." });
  }
});

module.exports = router;
