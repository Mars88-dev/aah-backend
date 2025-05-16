const express = require("express");
const axios = require("axios");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();
const path = require("path");
const OpenAI = require("openai");

const videoRoutes = require("./routes/videoRoutes");
const agentRoutes = require("./routes/agentRoutes");
const listingRoutes = require("./routes/listingRoutes");
const flyerRoutes = require("./routes/flyerRoutes");
const authRoutes = require("./routes/authRoutes");

const app = express(); // ✅ move this line up here
app.use(express.json());

// ✅ CORS setup – allow localhost and Render frontend
app.use(cors({
  origin: ["http://localhost:3000", "https://aah-frontend.onrender.com"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
  exposedHeaders: ["Content-Disposition"]
}));

// ✅ Serve static assets
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/templates", express.static(path.join(__dirname, "client/public/templates")));
app.use("/outros", express.static(path.join(__dirname, "assets/outros")));

// ✅ OpenAI setup
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ✅ Property description generator
app.post("/api/generate-description", async (req, res) => {
  const { heading, bedrooms, bathrooms, location, features } = req.body;

  const fullPrompt = `
You are a South African real estate assistant.
Write a high-quality listing description for a property with the following details:
- Heading: ${heading}
- Bedrooms: ${bedrooms}
- Bathrooms: ${bathrooms}
- Location: ${location}
- Features: ${features}

Keep the tone professional yet engaging. Use vivid, descriptive language, highlight lifestyle benefits, and avoid repeating keywords.
Only output the description (no headings or formatting).
  `;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: fullPrompt }],
      temperature: 0.7,
      max_tokens: 300,
    });

    const description = response.choices[0].message.content.trim();
    res.json({ description });
  } catch (err) {
    console.error("❌ OpenAI API Error:", err?.response?.data || err.message);
    res.status(500).json({ description: "Failed to generate description." });
  }
});

// ✅ Image generator
app.post("/api/generate-image", async (req, res) => {
  const { prompt } = req.body;

  try {
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt,
      n: 1,
      size: "1024x1024",
      response_format: "url",
    });

    const imageUrl = response?.data?.[0]?.url;
    if (!imageUrl) {
      return res.status(500).json({ error: "No image URL returned from OpenAI." });
    }

    const imageRes = await axios.get(imageUrl, { responseType: "arraybuffer" });
    const base64Image = `data:image/png;base64,${Buffer.from(imageRes.data).toString("base64")}`;
    res.json({ image: base64Image });
  } catch (err) {
    console.error("❌ OpenAI Image Generation Error:", err.response?.data || err.message);
    res.status(500).json({ image: null, error: "Failed to generate image." });
  }
});

// ✅ MongoDB connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// ✅ API routes
app.use("/api/auth", authRoutes);
app.use("/api/agents", agentRoutes);
app.use("/api/listings", listingRoutes);
app.use("/api/flyers", flyerRoutes);
app.use("/api/videos", videoRoutes);

// ✅ Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
