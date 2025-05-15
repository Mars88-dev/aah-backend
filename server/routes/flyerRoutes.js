const express = require("express");
const router = express.Router();
const { generateFlyer, generatePortfolioFlyer, generateMessageFlyer } = require("../controllers/flyerController");

router.post("/generate", generateFlyer);
router.post("/generate-portfolio", generatePortfolioFlyer);
router.post("/generate-message", generateMessageFlyer);

module.exports = router;

