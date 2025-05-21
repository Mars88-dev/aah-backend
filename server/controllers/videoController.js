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

    const tempDir = path.join(__dirname, "../uploads/temp");
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

    // Utility function to convert videos to MP4
    const convertToMp4 = (inputPath, outputPath) => {
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
          .on("error", reject)
          .save(outputPath);
      });
    };

    const convertedPaths = [];

    // Convert intro video
    if (fs.existsSync(introPath)) {
      const convertedIntro = path.join(tempDir, `intro-${uuidv4()}.mp4`);
      await convertToMp4(introPath, convertedIntro);
      convertedPaths.push(convertedIntro);
    }

    // Convert uploaded clips
    for (const file of uploadedVideos) {
      const convertedClip = path.join(tempDir, `clip-${uuidv4()}.mp4`);
      await convertToMp4(file.path, convertedClip);
      convertedPaths.push(convertedClip);
    }

    // Convert outro video
    if (outroPath && fs.existsSync(outroPath)) {
      const convertedOutro = path.join(tempDir, `outro-${uuidv4()}.mp4`);
      await convertToMp4(outroPath, convertedOutro);
      convertedPaths.push(convertedOutro);
    }

    // Generate concat file list for ffmpeg
    const concatListPath = path.join(tempDir, `${uuidv4()}-list.txt`);
    const concatListContent = convertedPaths.map(p => `file '${p}'`).join("\n");
    fs.writeFileSync(concatListPath, concatListContent);

    // Output paths
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
              // Cleanup temporary files
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
