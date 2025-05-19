const mongoose = require("mongoose");

const videoSchema = new mongoose.Schema(
  {
    agentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // ✅ Correct: referencing your User model
      required: true,
    },
    filename: {
      type: String,
      required: true,
    },
    filenameWithOutro: {
      type: String, // ✅ Optional field for outro-added videos
    },
    introText: {
      type: String,
      default: "Welcome to All About Homes, The Home of Great Agents",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { collection: "videos" } // ✅ Optional override — good for clarity
);

module.exports = mongoose.model("Video", videoSchema);
