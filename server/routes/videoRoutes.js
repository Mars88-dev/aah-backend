const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const { combineVideos } = require("../controllers/videoController");
const { protect } = require("../middleware/authMiddleware");
const Video = require("../models/Video");

// ✅ Storage for uploaded files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/temp");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

// ✅ POST /api/videos/combine - Requires login
router.post(
  "/combine",
  protect,
  upload.fields([
    { name: "clips", maxCount: 10 },
    { name: "outroFile", maxCount: 1 }, // <-- outro file is uploaded as a file
  ]),
  combineVideos
);

module.exports = router;
