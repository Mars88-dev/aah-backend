// server/controllers/listingController.js

const Listing = require("../models/Listing");

// POST /api/listings - create new listing
exports.createListing = async (req, res) => {
  try {
    const {
      title,
      price,
      location,
      bedrooms,
      bathrooms,
      garages,
      agentName,
      garageOrParking,
      loungeOrFlatlet,
      kitchenOrSolar,
      gardenOrPoolOrView,
    } = req.body;

    if (!title || !price || !location || !agentName) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const newListing = new Listing({
      title,
      price,
      location,
      bedrooms,
      bathrooms,
      garages,
      agentName,
      template: agentName,
      agentId: req.userId, // Ensure this is set correctly via middleware if needed
      coverImage: req.file ? `/uploads/images/${req.file.filename}` : "",
      garageOrParking,
      loungeOrFlatlet,
      kitchenOrSolar,
      gardenOrPoolOrView,
    });

    const saved = await newListing.save();
    return res.status(201).json(saved);
  } catch (err) {
    console.error("❌ Error creating listing:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

// GET /api/listings - fetch all listings
exports.getListings = async (req, res) => {
  try {
    const listings = await Listing.find();
    return res.json(listings);
  } catch (err) {
    console.error("❌ Error fetching listings:", err);
    return res.status(500).json({ error: "Server error" });
  }
};
