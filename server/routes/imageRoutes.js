const express = require("express");
const router = express.Router();
const Image = require("../models/Image");

// POST /api/images/save
router.post("/save", async (req, res) => {
  const { image } = req.body;
  const saved = await Image.create({ url: image });
  res.status(201).json(saved);
});

// GET /api/images
router.get("/", async (req, res) => {
  const all = await Image.find().sort({ createdAt: -1 });
  res.json(all);
});

// DELETE /api/images/:id
router.delete("/:id", async (req, res) => {
  await Image.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

module.exports = router;
