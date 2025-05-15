const express = require("express");
const Listing = require("../models/Listing");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const router = express.Router();

// 🖼️ Setup Multer for image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = "uploads/images";
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});
const upload = multer({ storage });

// 📥 POST /api/listings — Create listing
router.post("/", upload.single("coverImage"), async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "No token provided" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const agentId = decoded.id;
    if (!agentId) return res.status(403).json({ error: "Invalid token" });

    const {
      title,
      price,
      location,
      bedrooms,
      bathrooms,
      garageOrParking,
      loungeOrFlatlet,
      kitchenOrSolar,
      gardenPoolView,
      template
    } = req.body;

    const coverImageUrl = req.file ? `/uploads/images/${req.file.filename}` : "";

    const newListing = new Listing({
      title,
      price,
      location,
      bedrooms,
      bathrooms,
      garageOrParking,
      loungeOrFlatlet,
      kitchenOrSolar,
      gardenPoolView,
      template,
      agentId,
      coverImage: coverImageUrl
    });

    await newListing.save();
    res.status(201).json({ message: "Listing created successfully" });
  } catch (err) {
    console.error("❌ Error saving listing:", err);
    res.status(500).json({ error: "Failed to save listing", details: err.message });
  }
});

// 📤 GET /api/listings — Fetch all listings
router.get("/", async (req, res) => {
  try {
    const listings = await Listing.find().sort({ createdAt: -1 });
    res.json(listings);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch listings" });
  }
});

// ✏️ PUT /api/listings/:id — Update listing
router.put("/:id", upload.single("coverImage"), async (req, res) => {
  try {
    const {
      title,
      price,
      location,
      bedrooms,
      bathrooms,
      garageOrParking,
      loungeOrFlatlet,
      kitchenOrSolar,
      gardenPoolView,
      template
    } = req.body;

    const updateData = {
      title,
      price,
      location,
      bedrooms,
      bathrooms,
      garageOrParking,
      loungeOrFlatlet,
      kitchenOrSolar,
      gardenPoolView,
      template,
    };

    if (req.file) {
      updateData.coverImage = `/uploads/images/${req.file.filename}`;
    }

    const updated = await Listing.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
    });

    if (!updated) {
      return res.status(404).json({ error: "Listing not found" });
    }

    res.json({ message: "✅ Listing updated successfully", listing: updated });
  } catch (err) {
    console.error("❌ Error updating listing:", err);
    res.status(500).json({ error: "Failed to update listing" });
  }
});

// ❌ DELETE /api/listings/:id — Delete listing
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Listing.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ error: "Listing not found" });
    }

    res.json({ message: "🗑️ Listing deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting listing:", err);
    res.status(500).json({ error: "Failed to delete listing" });
  }
});

module.exports = router;
