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

    const canvas = createCanvas(1080, 1080);
    const ctx = canvas.getContext("2d");

    // ✅ Step 1: Draw the cover image first
    const cover = await loadImage(coverImagePath);
    ctx.drawImage(cover, 0, 181.2, 1080, 480.3);

    // ✅ Step 2: Draw the PNG template on top
    const template = await loadImage(templatePath);
    ctx.drawImage(template, 0, 0, 1080, 1080);

    // ✅ Step 3: Title
    ctx.fillStyle = "#002060";
    ctx.font = "bold 32px Arial";
    ctx.fillText(listing.title || "New Listing", 20, 597.5 + 40);

    // ✅ Step 4: Price
    ctx.font = "bold 36px Arial";
    ctx.textAlign = "left";
    ctx.fillText(`R ${listing.price}`, 769.6, 445.7 + 40);

    // ✅ Step 5: Location
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 32px Arial";
    ctx.fillText(listing.location, 270, 535 + 38);

    // ✅ Step 6: Features
    ctx.font = "20px Arial";
    ctx.fillText(`${listing.bedrooms} Bedrooms`, 88.2, 771.8 + 20);
    ctx.fillText(`${listing.bathrooms} Bathrooms`, 88.2, 846.8 + 20);
    ctx.fillText(`${listing.gardenPoolView}`, 88.2, 921.9 + 20);
    ctx.fillText(`${listing.kitchenOrSolar}`, 340.7, 846.8 + 20);
    ctx.fillText(`${listing.loungeOrFlatlet}`, 340.7, 771.8 + 20);
    ctx.fillText(`${listing.garageOrParking}`, 340.7, 921.9 + 20);

    // ✅ Step 7: Save flyer
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
