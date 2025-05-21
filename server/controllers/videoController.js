const fs = require("fs");
const path = require("path");
const ffmpeg = require("fluent-ffmpeg");
const { v4: uuidv4 } = require("uuid");
const mongoose = require("mongoose");
const Video = require("../models/Video");

exports.combineVideos = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId || userId === "null") {
      return res.status(400).json({ error: "Missing or invalid userId" });
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);
    const introPath = path.join(__dirname, "../assets/intro/intro.mp4");
    const watermarkPath = path.join(__dirname, "../assets/video-watermark.png");

    const uploadedVideos = req.files["clips"];
    if (!uploadedVideos || uploadedVideos.length === 0) {
      return res.status(400).json({ error: "No video clips uploaded" });
    }

    const outroFileUploaded = req.files["outroFile"]?.[0];

    const tempDir = path.join(__dirname, "../uploads/temp");
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

    const convertToMp4 = (inputPath, outputPath) => {
      return new Promise((resolve, reject) => {
        ffmpeg(inputPath)
          .outputOptions(["-c:v libx264", "-preset veryfast", "-crf 23", "-c:a aac", "-movflags +faststart"])
          .on("end", () => resolve(outputPath))
          .on("error", reject)
          .save(outputPath);
      });
    };

    const convertedPaths = [];

    // ✅ Always add intro video
    if (!fs.existsSync(introPath)) {
      return res.status(500).json({ error: "Intro video missing at " + introPath });
    }
    const convertedIntro = path.join(tempDir, `intro-${uuidv4()}.mp4`);
    await convertToMp4(introPath, convertedIntro);
    convertedPaths.push(convertedIntro);

    // Convert uploaded clips
    for (const file of uploadedVideos) {
      const convertedClip = path.join(tempDir, `clip-${uuidv4()}.mp4`);
      await convertToMp4(file.path, convertedClip);
      convertedPaths.push(convertedClip);
    }

    // Convert outro video if uploaded
    if (outroFileUploaded) {
      const convertedOutro = path.join(tempDir, `outro-${uuidv4()}.mp4`);
      await convertToMp4(outroFileUploaded.path, convertedOutro);
      convertedPaths.push(convertedOutro);
    }

    // Create concat file
    const concatListPath = path.join(tempDir, `${uuidv4()}-list.txt`);
    const concatListContent = convertedPaths.map(p => `file '${p}'`).join("\n");
    fs.writeFileSync(concatListPath, concatListContent);

    const combinedVideoPath = path.join(tempDir, `combined-${uuidv4()}.mp4`);
    const finalVideoPath = path.join(__dirname, "../uploads/videos", `wm-video-${Date.now()}.mp4`);

    // Concatenate videos
    ffmpeg()
      .input(concatListPath)
      .inputOptions(["-f concat", "-safe 0"])
      .outputOptions(["-c:v libx264", "-preset veryfast", "-crf 23", "-c:a aac"])
      .on("end", () => {
        // Apply watermark
        ffmpeg(combinedVideoPath)
          .input(watermarkPath)
          .complexFilter("overlay=0:main_h-overlay_h")
          .outputOptions(["-preset ultrafast", "-crf 28", "-movflags +faststart"])
          .on("end", async () => {
            await Video.create({
              agentId: userObjectId,
              filename: path.basename(combinedVideoPath),
              filenameWithOutro: path.basename(finalVideoPath),
            });

            res.download(finalVideoPath, () => {
              [concatListPath, combinedVideoPath, ...convertedPaths].forEach(file => {
                if (fs.existsSync(file)) fs.unlinkSync(file);
              });
            });
          })
          .on("error", (err) => {
            console.error("❌ Error applying watermark:", err);
            res.status(500).json({ error: "Failed to apply watermark" });
          })
          .save(finalVideoPath);
      })
      .on("error", (err) => {
        console.error("❌ Error combining videos:", err);
        res.status(500).json({ error: "Failed to combine videos" });
      })
      .save(combinedVideoPath);

  } catch (err) {
    console.error("❌ Unexpected video processing error:", err);
    res.status(500).json({ error: "Unexpected error occurred during video processing" });
  }
};
