const express = require("express");
const router = express.Router();
const Video = require("../models/Video");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const { combineVideos } = require("../controllers/videoController");

// ✅ Multer setup for uploading videos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "..", "uploads", "videos");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });

// ✅ GET all videos
router.get("/", async (req, res) => {
  try {
    const videos = await Video.find().sort({ createdAt: -1 });
    res.json(videos);
  } catch (err) {
    console.error("❌ Fetch error:", err);
    res.status(500).json({ error: "Failed to fetch videos" });
  }
});

// ✅ DELETE a video by ID
router.delete("/:id", async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ error: "Video not found" });

    const videoPath = path.join(__dirname, "..", "uploads", "videos", video.filename);
    if (fs.existsSync(videoPath)) {
      fs.unlinkSync(videoPath);
    }

    await Video.findByIdAndDelete(req.params.id);
    res.json({ message: "Video deleted successfully" });
  } catch (err) {
    console.error("❌ Delete error:", err);
    res.status(500).json({ error: "Failed to delete video" });
  }
});

// ✅ POST to combine videos (with optional outro template)
router.post("/combine", upload.array("videos", 10), combineVideos);

module.exports = router;
