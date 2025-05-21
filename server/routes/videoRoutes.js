const express = require("express");
const multer = require("multer");
const path = require("path");
const { combineVideos } = require("../controllers/videoController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

const storage = multer.diskStorage({
  destination: "./uploads/temp",
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

router.post(
  "/combine",
  protect,
  upload.fields([{ name: "clips", maxCount: 10 }, { name: "outroFile", maxCount: 1 }]),
  combineVideos
);

module.exports = router;
