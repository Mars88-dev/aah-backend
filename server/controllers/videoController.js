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
    const introPath = path.resolve(__dirname, "../assets/intro/intro.mp4");
    const outroFile = req.files["outroFile"]?.[0];
    const outroPath = outroFile ? path.resolve(outroFile.path) : null;
    const watermarkPath = path.resolve(__dirname, "../assets/video-watermark.png");
    const uploadedVideos = req.files["clips"];

    if (!uploadedVideos || uploadedVideos.length === 0) {
      return res.status(400).json({ error: "No video clips uploaded" });
    }

    const tempDir = path.join(__dirname, "../uploads/temp");
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

    const convertToMp4 = (inputPath, outputPath) => {
      return new Promise((resolve, reject) => {
        if (!fs.existsSync(inputPath) || fs.statSync(inputPath).size === 0) {
          return reject(new Error(`❌ Skipped invalid input: ${inputPath}`));
        }

        ffmpeg(inputPath)
          .videoCodec("libx264")
          .audioCodec("aac")
          .addOption("-crf", "23")
          .addOption("-preset", "veryfast")
          .on("end", () => {
            if (fs.statSync(outputPath).size < 1024) {
              return reject(new Error(`❌ Output too small, likely invalid: ${outputPath}`));
            }
            resolve(outputPath);
          })
          .on("error", (err) => reject(err))
          .save(outputPath);
      });
    };

    const convertedPaths = [];

    console.log("📥 Intro Path:", introPath);
    if (fs.existsSync(introPath)) {
      const convertedIntro = path.join(tempDir, `intro-${Date.now()}.mp4`);
      console.log("✅ Intro found. Converting...");
      await convertToMp4(introPath, convertedIntro);
      convertedPaths.push(path.resolve(convertedIntro));
    } else {
      console.log("⚠️ Intro NOT found:", introPath);
    }

    for (const file of uploadedVideos) {
      const convertedClip = path.join(tempDir, `clip-${Date.now()}-${file.originalname}`);
      await convertToMp4(file.path, convertedClip);
      convertedPaths.push(path.resolve(convertedClip));
    }

    if (outroPath && fs.existsSync(outroPath)) {
      const convertedOutro = path.join(tempDir, `outro-${Date.now()}.mp4`);
      console.log("✅ Outro found. Converting:", outroPath);
      await convertToMp4(outroPath, convertedOutro);
      convertedPaths.push(path.resolve(convertedOutro));
    } else {
      console.log("ℹ️ No outro or missing:", outroPath);
    }

    if (convertedPaths.length === 0) {
      return res.status(400).json({ error: "No valid video segments to combine." });
    }

    const txtListPath = path.join(tempDir, `${uuidv4()}.txt`);
    const listFileContent = convertedPaths.map(p => `file '${p.replace(/'/g, "'\\''")}'`).join("\n");
    console.log("📝 Creating ffmpeg .txt list:", txtListPath);
    console.log(listFileContent);
    fs.writeFileSync(txtListPath, listFileContent);

    const outputFilename = `video-${Date.now()}.mp4`;
    const outputPath = path.join(__dirname, `../uploads/videos/${outputFilename}`);

    await new Promise((resolve, reject) => {
      ffmpeg()
        .input(txtListPath)
        .inputOptions(["-f", "concat", "-safe", "0"])
        .addOption("-c:v", "libx264")
        .addOption("-c:a", "aac")
        .on("end", resolve)
        .on("error", reject)
        .save(outputPath);
    });

    const finalWithWatermark = path.join(__dirname, `../uploads/videos/wm-${outputFilename}`);
    await new Promise((resolve, reject) => {
      ffmpeg(outputPath)
        .input(watermarkPath)
        .complexFilter("overlay=0:main_h-overlay_h")
        .addOption("-crf", "23")
        .addOption("-preset", "veryfast")
        .on("end", resolve)
        .on("error", reject)
        .save(finalWithWatermark);
    });

    await Video.create({
      agentId: userObjectId,
      filename: outputFilename,
      filenameWithOutro: `wm-${outputFilename}`,
    });

    res.download(finalWithWatermark);
  } catch (err) {
    console.error("❌ Video combination failed:", err);
    res.status(500).json({ error: "Video combination failed." });
  }
};
