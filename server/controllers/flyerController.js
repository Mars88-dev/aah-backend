const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer");
const Listing = require("../models/Listing"); // ✅ Required fix

exports.generateFlyer = async (req, res) => {
  try {
    const { listingId } = req.body;

    const listing = await Listing.findById(listingId);
    if (!listing) return res.status(404).json({ error: "Listing not found" });

    const imageUrl = `https://aah-backend.onrender.com${listing.coverImage || ""}`;
    const htmlContent = `
      <html>
        <head>
          <style>
            body {
              font-family: Arial;
              padding: 20px;
              background: #f2f2f2;
            }
            .flyer {
              background: white;
              border-radius: 10px;
              padding: 20px;
              max-width: 800px;
              margin: auto;
              box-shadow: 0 0 10px rgba(0,0,0,0.1);
            }
            img {
              width: 100%;
              height: auto;
              border-radius: 10px;
            }
            h2 {
              margin-top: 10px;
              color: #333;
            }
            .details {
              margin-top: 10px;
              font-size: 16px;
              color: #555;
            }
          </style>
        </head>
        <body>
          <div class="flyer">
            <img src="${imageUrl}" />
            <h2>${listing.title}</h2>
            <p class="details">💰 ${listing.price}</p>
            <p class="details">🛏️ ${listing.bedrooms} Bed • 🛁 ${listing.bathrooms} Bath • 🚗 ${listing.garageOrParking}</p>
            <p class="details">📍 ${listing.location}</p>
          </div>
        </body>
      </html>
    `;

    const browser = await puppeteer.launch({
      args: ["--no-sandbox", "--disable-setuid-sandbox"], // ✅ Important for Render
    });

    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: "networkidle0" });

    const flyerPath = `./uploads/flyer-${Date.now()}.jpg`;
    await page.screenshot({ path: flyerPath, type: "jpeg", fullPage: true });
    await browser.close();

    res.download(flyerPath, () => {
      fs.unlinkSync(flyerPath); // Cleanup after download
    });

  } catch (err) {
    console.error("❌ Flyer Generation Error:", err);
    res.status(500).json({ error: "Failed to generate flyer" });
  }
};
