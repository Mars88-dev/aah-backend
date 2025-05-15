const mongoose = require("mongoose");

const listingSchema = new mongoose.Schema(
  {
    agentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: String,
    price: String,
    location: String,
    bedrooms: String,
    bathrooms: String,
    garages: String,
    coverImage: String,
    template: String,
    agentName: String,
    garageOrParking: String,
    loungeOrFlatlet: String,
    kitchenOrSolar: String,
    gardenPoolView: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Listing", listingSchema);
