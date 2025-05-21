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

    // Convert all videos (intro + clips + outro) to match format
    const convertToMp4 = async (inputPath, outputPath) => {
      return new Promise((resolve, reject) => {
        ffmpeg(inputPath)
          .outputOptions([
            "-c:v libx264",
            "-preset veryfast",
            "-crf 23",
            "-c:a aac",
            "-b:a 128k",
            "-movflags +faststart"
          ])
          .on("end", () => resolve(outputPath))
          .on("error", (err) => reject(err))
          .save(outputPath);
      });
    };

    const convertedPaths = [];

    if (fs.existsSync(introPath)) {
      const convertedIntro = path.join(tempDir, `converted-intro-${Date.now()}.mp4`);
      await convertToMp4(introPath, convertedIntro);
      convertedPaths.push(convertedIntro);
    }

    for (const file of uploadedVideos) {
      const convertedClip = path.join(tempDir, `converted-${Date.now()}-${file.originalname}`);
      await convertToMp4(file.path, convertedClip);
      convertedPaths.push(convertedClip);
    }

    if (outroPath && fs.existsSync(outroPath)) {
      const convertedOutro = path.join(tempDir, `converted-outro-${Date.now()}.mp4`);
      await convertToMp4(outroPath, convertedOutro);
      convertedPaths.push(convertedOutro);
    }

    const txtListPath = path.join(tempDir, `${uuidv4()}.txt`);
    const listFileContent = convertedPaths.map(p => `file '${path.resolve(p)}'`).join("\n");
    fs.writeFileSync(txtListPath, listFileContent);

    const outputFilename = `video-${Date.now()}.mp4`;
    const outputPath = path.join("uploads/videos", outputFilename);

    // Step 2: Concatenate converted videos
    ffmpeg()
      .input(txtListPath)
      .inputOptions(["-f", "concat", "-safe", "0"])
      .outputOptions(["-c:v libx264", "-preset veryfast", "-crf 23", "-c:a aac"])
      .on("end", () => {
        const finalWithWatermark = path.join("uploads/videos", `wm-${outputFilename}`);

        // Step 3: Apply watermark
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
            "-preset", "ultrafast",
            "-movflags", "+faststart",
            "-crf", "28"
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
