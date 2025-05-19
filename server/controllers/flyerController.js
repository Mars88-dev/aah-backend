const fs = require("fs");
const path = require("path");
const { createCanvas, loadImage } = require("canvas");
const Listing = require("../models/Listing");

exports.generateFlyer = async (req, res) => {
  try {
    const { listingId } = req.body;
    const listing = await Listing.findById(listingId);
    if (!listing) return res.status(404).json({ error: "Listing not found" });

    const templatePath = path.join(__dirname, "../templates", listing.template);
    const coverImagePath = path.join(__dirname, `../${listing.coverImage}`);

    // Create canvas
    const canvas = createCanvas(1080, 1080);
    const ctx = canvas.getContext("2d");

    // Load and draw flyer template
    const template = await loadImage(templatePath);
    ctx.drawImage(template, 0, 0, 1080, 1080);

    // Load and draw cover image
    const cover = await loadImage(coverImagePath);
    ctx.drawImage(cover, 0, 181.2, 1080, 480.3);

    // Draw text
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "right";
    ctx.font = "bold 32px Arial";
    ctx.fillText(`R ${listing.price}`, 1080 - 20, 445.7 + 40);

    ctx.textAlign = "left";
    ctx.font = "bold 22px Arial";
    ctx.fillText(listing.location, 270, 550 + 30);

    ctx.font = "18px Arial";
    ctx.fillText(`🛏️ ${listing.bedrooms}`, 88.2, 771.8 + 20);
    ctx.fillText(`🛁 ${listing.bathrooms}`, 88.2, 846.8 + 20);
    ctx.fillText(`🚗 ${listing.garageOrParking}`, 340.7, 921.9 + 20);

    // Export flyer
    const flyerPath = `/tmp/flyer-${Date.now()}.jpg`;
    const out = fs.createWriteStream(flyerPath);
    const stream = canvas.createJPEGStream();
    stream.pipe(out);

    out.on("finish", () => {
      res.download(flyerPath, () => {
        if (fs.existsSync(flyerPath)) fs.unlinkSync(flyerPath);
      });
    });

  } catch (err) {
    console.error("❌ Flyer generation failed:", err);
    res.status(500).json({ error: "Failed to generate flyer" });
  }
};
