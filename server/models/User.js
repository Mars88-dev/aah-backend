const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  agency: { type: String, default: "All About Homes" }
});

module.exports = mongoose.model("User", userSchema);
