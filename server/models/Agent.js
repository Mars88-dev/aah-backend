const mongoose = require("mongoose");

const ListingSchema = new mongoose.Schema({
  title: String,
  price: String,
  description: String,
  imageUrls: [String],
  location: String,
  bedrooms: String,
  bathrooms: String,
  garages: String,
  landSize: String,
  agency: String,
  property24Link: String,
}, { timestamps: true });

const AgentSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  phone: String,
  agencyName: String,
  profileImage: String,
  listings: [ListingSchema],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Agent", AgentSchema);
