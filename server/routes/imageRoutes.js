const express = require("express");
const router = express.Router();
const {
  saveImage,
  getAllImages,
  deleteImage,
} = require("../controllers/imageController");

// POST /api/images/save
router.post("/save", saveImage);

// GET /api/images
router.get("/", getAllImages);

// DELETE /api/images/:id
router.delete("/:id", deleteImage);

module.exports = router;
