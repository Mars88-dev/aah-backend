const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const Listing = require("../models/Listing");
const { requireAuth } = require("../middleware/authMiddleware"); // Correct import

// ✅ Multer config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/images");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// ✅ Create a listing
router.post("/", requireAuth, upload.single("coverImage"), async (req, res) => {
  try {
    const newListing = new Listing({
      ...req.body,
      coverImage: req.file ? `/uploads/images/${req.file.filename}` : null,
      agentId: req.user.id,
    });

    await newListing.save();
    res.status(201).json(newListing);
  } catch (err) {
    console.error("❌ Error saving listing:", err);
    res.status(500).json({ error: "Failed to save listing." });
  }
});

// ✅ Get all listings
router.get("/", requireAuth, async (req, res) => {
  try {
    const listings = await Listing.find();
    res.status(200).json(listings);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch listings." });
  }
});

// ✅ Get one listing
router.get("/:id", requireAuth, async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ error: "Listing not found" });
    res.json(listing);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch listing." });
  }
});

// ✅ Update listing
router.put("/:id", requireAuth, upload.single("coverImage"), async (req, res) => {
  try {
    const update = {
      ...req.body,
    };
    if (req.file) {
      update.coverImage = `/uploads/images/${req.file.filename}`;
    }

    const updated = await Listing.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!updated) return res.status(404).json({ error: "Listing not found" });

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Failed to update listing." });
  }
});

// ✅ Delete listing
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const result = await Listing.findByIdAndDelete(req.params.id);
    if (!result) return res.status(404).json({ error: "Listing not found" });

    res.json({ message: "Listing deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete listing." });
  }
});

module.exports = router;
