const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const { combineVideos } = require("../controllers/videoController");
const { requireAuth } = require("../middleware/authMiddleware");

// ✅ Multer config for .mp4 uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/temp");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// ✅ POST /api/videos/combine
router.post(
  "/combine",
  requireAuth,
  upload.fields([{ name: "clips", maxCount: 10 }]),
  combineVideos
);

module.exports = router;
