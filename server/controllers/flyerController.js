const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer");
const Agent = require("../models/Agent");
const Listing = require("../models/Listing"); // ✅ NEW: Import Listing model

exports.generateFlyer = async (req, res) => {
  try {
    const { listingId } = req.body;

    const listing = await Listing.findById(listingId);
    if (!listing) return res.status(404).json({ error: "Listing not found" });

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
            <img src="http://localhost:5000${listing.coverImage}" />
            <h2>${listing.title}</h2>
            <p class="details">💰 ${listing.price}</p>
            <p class="details">🛏️ ${listing.bedrooms} Bed • 🛁 ${listing.bathrooms} Bath • 🚗 ${listing.garageOrParking}</p>
            <p class="details">📍 ${listing.location}</p>
          </div>
        </body>
      </html>
    `;

    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: "networkidle0" });

    const flyerPath = `./uploads/flyer-${Date.now()}.jpg`;
    await page.screenshot({ path: flyerPath, type: "jpeg", fullPage: true });
    await browser.close();

    res.download(flyerPath, () => {
      fs.unlinkSync(flyerPath);
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to generate flyer" });
  }
};

exports.generatePortfolioFlyer = async (req, res) => {
  try {
    const { agentId } = req.body;

    const agent = await Agent.findById(agentId);
    if (!agent) return res.status(404).json({ error: "Agent not found" });

    const htmlContent = `
      <html>
        <head>
          <style>
            body {
              font-family: Arial;
              padding: 20px;
              background: #f5f5f5;
            }
            h1 {
              text-align: center;
              margin-bottom: 30px;
            }
            .grid {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 20px;
            }
            .card {
              background: white;
              padding: 10px;
              border-radius: 8px;
              box-shadow: 0 0 8px rgba(0,0,0,0.1);
            }
            .card img {
              width: 100%;
              height: 200px;
              object-fit: cover;
              border-radius: 6px;
            }
            .card h3 {
              margin: 10px 0 5px;
              font-size: 16px;
              color: #333;
            }
            .card p {
              font-size: 14px;
              color: #666;
              margin: 2px 0;
            }
          </style>
        </head>
        <body>
          <h1>${agent.agencyName} – Properties by ${agent.name}</h1>
          <div class="grid">
            ${agent.listings.map(listing => `
              <div class="card">
                <img src="${listing.imageUrls[0]}" />
                <h3>${listing.title}</h3>
                <p>💰 ${listing.price}</p>
                <p>🛏️ ${listing.bedrooms} Bed • 🛁 ${listing.bathrooms} Bath • 🚗 ${listing.garages} Garage</p>
                <p>📍 ${listing.location}</p>
              </div>
            `).join("")}
          </div>
        </body>
      </html>
    `;

    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

    const flyerPath = `./uploads/portfolio-${Date.now()}.jpg`;
    await page.screenshot({ path: flyerPath, type: "jpeg", fullPage: true });
    await browser.close();

    res.download(flyerPath, () => {
      fs.unlinkSync(flyerPath);
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to generate portfolio flyer" });
  }
};

exports.generateMessageFlyer = async (req, res) => {
  try {
    const { agentId, message, backgroundUrl } = req.body;

    const agent = await Agent.findById(agentId);
    if (!agent) return res.status(404).json({ error: "Agent not found" });

    const htmlContent = `
      <html>
        <head>
          <style>
            body {
              margin: 0;
              padding: 0;
              font-family: Arial, sans-serif;
              background-image: url('${backgroundUrl}');
              background-size: cover;
              background-position: center;
              height: 100vh;
              color: white;
              text-shadow: 1px 1px 4px rgba(0,0,0,0.7);
              display: flex;
              align-items: center;
              justify-content: center;
              text-align: center;
            }
            .overlay {
              background-color: rgba(0,0,0,0.5);
              padding: 40px;
              border-radius: 10px;
            }
            h1 {
              font-size: 48px;
              margin-bottom: 20px;
            }
            p {
              font-size: 20px;
              margin: 0;
            }
          </style>
        </head>
        <body>
          <div class="overlay">
            <h1>${message}</h1>
            <p>From ${agent.name} – ${agent.agencyName}</p>
            <p>${agent.phone} | ${agent.email}</p>
          </div>
        </body>
      </html>
    `;

    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: "networkidle0" });

    const flyerPath = `./uploads/message-flyer-${Date.now()}.jpg`;
    await page.screenshot({ path: flyerPath, type: "jpeg", fullPage: true });
    await browser.close();

    res.download(flyerPath, () => {
      fs.unlinkSync(flyerPath);
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to generate message flyer" });
  }
};
