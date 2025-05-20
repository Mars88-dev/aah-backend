const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs"); // ✅ Needed to delete video files
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

// ✅ GET /api/videos - List all videos for logged-in user
router.get("/", protect, async (req, res) => {
  try {
    const videos = await Video.find({ agentId: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json(videos);
  } catch (err) {
    console.error("❌ Error fetching videos:", err);
    res.status(500).json({ error: "Failed to fetch videos." });
  }
});

// ✅ DELETE /api/videos/:id - Delete a saved video
router.delete("/:id", protect, async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);

    if (!video) {
      return res.status(404).json({ error: "Video not found" });
    }

    // Check if the video belongs to the user
    if (video.agentId.toString() !== req.user.id) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    // Delete associated video files
    const pathsToDelete = [
      `uploads/videos/${video.filename}`,
      `uploads/videos/${video.filenameWithOutro}`,
    ];

    pathsToDelete.forEach((filePath) => {
      if (filePath && fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    });

    // Delete from database
    await video.deleteOne();

    res.status(200).json({ message: "Video deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting video:", err);
    res.status(500).json({ error: "Failed to delete video" });
  }
});

module.exports = router;
