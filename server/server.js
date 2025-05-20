const express = require("express");
const axios = require("axios");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();
const path = require("path");
const fs = require("fs");
const OpenAI = require("openai");

// ✅ Ensure upload folders exist on Render/local
const uploadDirs = ["uploads", "uploads/temp", "uploads/videos", "uploads/images"];
uploadDirs.forEach(dir => {
  const fullPath = path.join(__dirname, dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
  }
});

// ✅ Import routes
const videoRoutes = require("./routes/videoRoutes");
const agentRoutes = require("./routes/agentRoutes");
const listingRoutes = require("./routes/listingRoutes");
const flyerRoutes = require("./routes/flyerRoutes");
const imageRoutes = require("./routes/imageRoutes");
const authRoutes = require("./routes/authRoutes");

const app = express();
app.use(express.json());

// ✅ CORS for frontend (Render)
app.use(cors({
  origin: "https://aah-frontend.onrender.com",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
  exposedHeaders: ["Content-Disposition"],
}));

// ✅ Static folders
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/templates", express.static(path.join(__dirname, "templates")));
app.use("/outros", express.static(path.join(__dirname, "assets/outros")));
app.use("/intro", express.static(path.join(__dirname, "assets/intro")));
app.use("/assets", express.static(path.join(__dirname, "assets")));

// ✅ Route: Image routes first for priority
app.use("/api/images", imageRoutes);

// ✅ OpenAI
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ✅ AI Description Generator
app.post("/api/generate-description", async (req, res) => {
  const { heading, bedrooms, bathrooms, location, features } = req.body;

  const prompt = `
You are a South African real estate assistant.
Write a high-quality listing description for a property with:
- Heading: ${heading}
- Bedrooms: ${bedrooms}
- Bathrooms: ${bathrooms}
- Location: ${location}
- Features: ${features}

Keep it professional, engaging, and appealing to buyers.
`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 300,
    });

    const description = response.choices[0]?.message?.content?.trim() || "No description generated.";
    res.json({ description });
  } catch (err) {
    console.error("❌ Description generation error:", err);
    res.status(500).json({ error: "Failed to generate description." });
  }
});

// ✅ AI Image Generator (with watermark applied server-side)
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
    if (!imageUrl) return res.status(500).json({ error: "No image URL returned from OpenAI." });

    const imageRes = await axios.get(imageUrl, { responseType: "arraybuffer" });
    const imageBuffer = Buffer.from(imageRes.data, "binary");

    const { createCanvas, loadImage } = require("canvas");
    const canvas = createCanvas(1024, 1024);
    const ctx = canvas.getContext("2d");

    const mainImage = await loadImage(imageBuffer);
    ctx.drawImage(mainImage, 0, 0);

    const watermark = await loadImage(path.join(__dirname, "assets/Untitled design (1).png"));
    const wmHeight = 120;
    const wmWidth = 1024;
    ctx.globalAlpha = 0.9;
    ctx.drawImage(watermark, 0, canvas.height - wmHeight, wmWidth, wmHeight);

    const base64Image = canvas.toDataURL("image/png");
    res.json({ image: base64Image });

  } catch (err) {
    console.error("❌ OpenAI Image Generation Error:", err.response?.data || err.message);
    res.status(500).json({ image: null, error: "Failed to generate image." });
  }
});

// ✅ Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// ✅ Register all other routes
app.use("/api/auth", authRoutes);
app.use("/api/agents", agentRoutes);
app.use("/api/listings", listingRoutes);
app.use("/api/flyers", flyerRoutes);
app.use("/api/videos", videoRoutes);

// ✅ Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
