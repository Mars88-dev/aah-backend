const express = require("express");
const router = express.Router();
const Agent = require("../models/Agent");

// Register a new agent
router.post("/register", async (req, res) => {
  try {
    const agent = new Agent(req.body);
    await agent.save();
    res.status(201).json(agent);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to register agent" });
  }
});

// Get agent dashboard
router.get("/:id", async (req, res) => {
  try {
    const agent = await Agent.findById(req.params.id);
    if (!agent) return res.status(404).json({ error: "Agent not found" });
    res.json(agent);
  } catch (err) {
    res.status(500).json({ error: "Failed to load agent" });
  }
});

module.exports = router;
