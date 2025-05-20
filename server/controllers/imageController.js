// File: controllers/imageController.js
const Image = require("../models/Image");

// Save base64 image to MongoDB
exports.saveImage = async (req, res) => {
  try {
    const { image } = req.body;
    if (!image) return res.status(400).json({ error: "No image provided" });

    const saved = await Image.create({ url: image });
    res.status(201).json(saved);
  } catch (err) {
    console.error("❌ Error saving image:", err);
    res.status(500).json({ error: "Failed to save image" });
  }
};

// Fetch all saved images
exports.getAllImages = async (req, res) => {
  try {
    const all = await Image.find().sort({ createdAt: -1 });
    res.json(all);
  } catch (err) {
    console.error("❌ Error fetching images:", err);
    res.status(500).json({ error: "Failed to fetch images" });
  }
};

// Delete an image by ID
exports.deleteImage = async (req, res) => {
  try {
    await Image.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    console.error("❌ Error deleting image:", err);
    res.status(500).json({ error: "Failed to delete image" });
  }
};
