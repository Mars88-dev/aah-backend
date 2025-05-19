const fs = require("fs");
const path = require("path");
const ffmpeg = require("fluent-ffmpeg");
const { v4: uuidv4 } = require("uuid");
const mongoose = require("mongoose");
const Video = require("../models/Video");

exports.combineVideos = async (req, res) => {
  try {
    const userId = req.user?.id;
    const outroFile = req.body.outroFile;

    if (!userId || userId === "null") {
      return res.status(400).json({ error: "Missing or invalid userId" });
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);
    const introPath = path.join(__dirname, "../assets/intro/intro.mp4");
    const outroPath = outroFile
      ? path.join(__dirname, `../assets/outros/${outroFile}`)
      : null;
    const watermarkPath = path.join(__dirname, "../assets/video-watermark.png");

    const uploadedVideos = req.files["clips"];
    if (!uploadedVideos || uploadedVideos.length === 0) {
      return res.status(400).json({ error: "No video clips uploaded" });
    }

    const tempDir = "./uploads/temp";
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

    const allClips = [];
    if (fs.existsSync(introPath)) allClips.push(introPath);
    allClips.push(...uploadedVideos.map((file) => file.path));
    if (outroPath && fs.existsSync(outroPath)) allClips.push(outroPath);

    const txtListPath = path.join(tempDir, `${uuidv4()}.txt`);
    const listFileContent = allClips.map(p => `file '${path.resolve(p)}'`).join("\n");
    fs.writeFileSync(txtListPath, listFileContent);

    const outputFilename = `video-${Date.now()}.mp4`;
    const outputPath = path.join("uploads/videos", outputFilename);

    // Step 1: Combine all clips
    ffmpeg()
      .input(txtListPath)
      .inputOptions(["-f", "concat", "-safe", "0"])
      .outputOptions("-c", "copy")
      .on("end", () => {
        const finalWithWatermark = path.join("uploads/videos", `wm-${outputFilename}`);

        // Step 2: Apply watermark (minimizing CPU/memory)
        ffmpeg(outputPath)
          .input(watermarkPath)
          .complexFilter([
            {
              filter: "overlay",
              options: {
                x: 0,
                y: "main_h-overlay_h"
              }
            }
          ])
          .outputOptions([
            "-preset", "ultrafast",         // ✅ Use least CPU
            "-movflags", "+faststart",     // ✅ Fast streaming support
            "-crf", "28"                    // ✅ Lower quality = faster
          ])
          .output(finalWithWatermark)
          .on("end", async () => {
            await Video.create({
              agentId: userObjectId,
              filename: outputFilename,
              filenameWithOutro: `wm-${outputFilename}`,
            });

            res.download(finalWithWatermark, () => {
              fs.unlinkSync(txtListPath);
              fs.unlinkSync(outputPath);
            });
          })
          .on("error", (err) => {
            console.error("❌ Error adding watermark:", err);
            res.status(500).json({ error: "Failed to add watermark" });
          })
          .run();
      })
      .on("error", (err) => {
        console.error("❌ Error combining videos:", err);
        res.status(500).json({ error: "Failed to combine videos" });
      })
      .save(outputPath);
  } catch (err) {
    console.error("❌ Video processing error:", err);
    res.status(500).json({ error: "Unexpected error" });
  }
};
