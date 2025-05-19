const fs = require("fs");
const path = require("path");
const { createCanvas, loadImage } = require("canvas");
const Listing = require("../models/Listing");

exports.generateFlyer = async (req, res) => {
  try {
    const { listingId } = req.body;
    const listing = await Listing.findById(listingId);
    if (!listing) return res.status(404).json({ error: "Listing not found" });

    const templatePath = path.resolve(__dirname, "..", "templates", listing.template);
    const coverImagePath = path.resolve(__dirname, "..", listing.coverImage.replace(/^\\|^\//, ""));
    console.log("🖼️ Loading cover image from:", coverImagePath);

    const canvas = createCanvas(1080, 1080);
    const ctx = canvas.getContext("2d");

    // ✅ Draw cover image first (background)
    const cover = await loadImage(coverImagePath);
    ctx.drawImage(cover, 0, 181.2, 1080, 480.3);

    // ✅ Draw PNG template on top
    const template = await loadImage(templatePath);
    ctx.drawImage(template, 0, 0, 1080, 1080);

    // ✅ Title (moved down from 637.5 to 655)
    ctx.fillStyle = "#002060";
    ctx.font = "bold 32px Arial";
    ctx.textAlign = "left";
    ctx.fillText(listing.title || "New Listing", 20, 655);

    // ✅ Price (moved down from 485.7 to 495)
    ctx.textAlign = "left";
    ctx.font = "bold 36px Arial";
    ctx.fillStyle = "#ffffff";
    ctx.fillText(`R ${listing.price}`, 769.6, 495);

    // ✅ Location (moved down from 573 to 590)
    ctx.font = "bold 32px Arial";
    ctx.fillText(listing.location, 270, 590);

    // ✅ Features
    ctx.font = "20px Arial";
    ctx.fillText(`${listing.bedrooms} Bedrooms`, 88.2, 791.8);
    ctx.fillText(`${listing.bathrooms} Bathrooms`, 88.2, 866.8);
    ctx.fillText(`${listing.gardenPoolView}`, 88.2, 941.9);
    ctx.fillText(`${listing.kitchenOrSolar}`, 340.7, 866.8);
    ctx.fillText(`${listing.loungeOrFlatlet}`, 340.7, 791.8);
    ctx.fillText(`${listing.garageOrParking}`, 340.7, 941.9);

    // ✅ Output image
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
