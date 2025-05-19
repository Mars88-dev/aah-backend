const express = require("express");
const router = express.Router();

const { generateFlyer } = require("../controllers/flyerController");

// ✅ Working route only
router.post("/generate", generateFlyer);

module.exports = router;
