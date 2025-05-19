const mongoose = require("mongoose");

const videoSchema = new mongoose.Schema(
  {
    agentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // ✅ Changed from "Agent"
      required: true,
    },
    filename: {
      type: String,
      required: true,
    },
    filenameWithOutro: {
      type: String, // optional — only saved if an agent outro is appended
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
  { collection: "videos" }
);

module.exports = mongoose.model("Video", videoSchema);
