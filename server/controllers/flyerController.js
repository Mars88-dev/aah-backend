const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer");
const Listing = require("../models/Listing");

exports.generateFlyer = async (req, res) => {
  try {
    const { listingId } = req.body;

    const listing = await Listing.findById(listingId);
    if (!listing) return res.status(404).json({ error: "Listing not found" });

    const templatePath = path.join(__dirname, "../templates", listing.template);
    const coverImageUrl = `https://aah-backend.onrender.com${listing.coverImage}`;

    const htmlContent = `
      <html>
        <head>
          <style>
            body {
              margin: 0;
              padding: 0;
              width: 1080px;
              height: 1080px;
              position: relative;
              font-family: Arial, sans-serif;
              overflow: hidden;
            }
            .template {
              position: absolute;
              top: 0;
              left: 0;
              width: 1080px;
              height: 1080px;
              z-index: 0;
            }
            .cover {
              position: absolute;
              top: 181.2px;
              left: 0;
              width: 1080px;
              height: 480.3px;
              object-fit: cover;
              z-index: 1;
            }
            .price {
              position: absolute;
              top: 445.7px;
              left: 769.6px;
              width: 321.7px;
              font-size: 32px;
              font-weight: bold;
              color: #fff;
              text-align: right;
              z-index: 2;
            }
            .location {
              position: absolute;
              top: 550px;
              left: 270px;
              font-size: 22px;
              font-weight: bold;
              color: #fff;
              z-index: 2;
            }
            .bedrooms {
              position: absolute;
              top: 771.8px;
              left: 88.2px;
              font-size: 18px;
              color: #fff;
              z-index: 2;
            }
            .bathrooms {
              position: absolute;
              top: 846.8px;
              left: 88.2px;
              font-size: 18px;
              color: #fff;
              z-index: 2;
            }
            .garages {
              position: absolute;
              top: 921.9px;
              left: 340.7px;
              font-size: 18px;
              color: #fff;
              z-index: 2;
            }
          </style>
        </head>
        <body>
          <img class="template" src="file://${templatePath}" />
          <img class="cover" src="${coverImageUrl}" />
          <div class="price">R ${listing.price}</div>
          <div class="location">${listing.location}</div>
          <div class="bedrooms">🛏️ ${listing.bedrooms}</div>
          <div class="bathrooms">🛁 ${listing.bathrooms}</div>
          <div class="garages">🚗 ${listing.garageOrParking}</div>
        </body>
      </html>
    `;

    // ✅ Use puppeteer's built-in Chrome binary (fixes "could not find Chrome" error on Render)
    const browser = await puppeteer.launch({
      executablePath: puppeteer.executablePath(),
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1080, height: 1080 });
    await page.setContent(htmlContent, { waitUntil: "networkidle0" });

    const flyerPath = `./uploads/flyer-${Date.now()}.jpg`;
    await page.screenshot({ path: flyerPath, type: "jpeg" });
    await browser.close();

    res.download(flyerPath, () => {
      fs.unlinkSync(flyerPath);
    });

  } catch (err) {
    console.error("❌ Flyer generation failed:", err);
    res.status(500).json({ error: "Failed to generate flyer" });
  }
};
