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
          .size("1280x720")
          .addOption("-crf", "30")
          .addOption("-preset", "fast")
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
    let convertedIntro = null;
    if (fs.existsSync(introPath)) {
      convertedIntro = path.join(tempDir, `intro-${Date.now()}.mp4`);
      console.log("✅ Intro found. Converting...");
      await convertToMp4(introPath, convertedIntro);
    } else {
      console.log("⚠️ Intro NOT found:", introPath);
    }

    const convertedClips = [];
    for (const file of uploadedVideos) {
      const convertedClip = path.join(tempDir, `clip-${Date.now()}-${file.originalname}`);
      await convertToMp4(file.path, convertedClip);
      convertedClips.push(path.resolve(convertedClip));
    }

    let convertedOutro = null;
    if (outroPath && fs.existsSync(outroPath)) {
      convertedOutro = path.join(tempDir, `outro-${Date.now()}.mp4`);
      if (fs.existsSync(outroPath) && fs.statSync(outroPath).size > 1024) {
        console.log("✅ Outro found. Converting:", outroPath);
        await convertToMp4(outroPath, convertedOutro);
      } else {
        console.log("❌ Outro file invalid or empty, skipping:", outroPath);
        convertedOutro = null;
      }
    } else {
      console.log("ℹ️ No outro or missing:", outroPath);
    }

    const combinedPathList = [];
    if (convertedIntro) combinedPathList.push(path.resolve(convertedIntro));
    combinedPathList.push(...convertedClips);
    if (convertedOutro) combinedPathList.push(path.resolve(convertedOutro));

    if (combinedPathList.length === 0) {
      return res.status(400).json({ error: "No valid video segments to combine." });
    }

    const txtListPath = path.join(tempDir, `${uuidv4()}.txt`);
    const listFileContent = combinedPathList.map(p => `file '${p.replace(/'/g, "'\\''")}'`).join("\n");
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
      ffmpeg()
        .input(outputPath)
        .input(watermarkPath)
        .complexFilter([
          "[0:v]scale=854:480[base]",
          "[1:v]scale=854:60[wm]",
          "[base][wm]overlay=(main_w-overlay_w)/2:main_h-overlay_h"
        ])
        .videoCodec("libx264")
        .audioCodec("aac")
        .addOption("-crf", "30")
        .addOption("-preset", "fast")
        .on("end", resolve)
        .on("error", reject)
        .save(finalWithWatermark);
    });

    await Video.create({
      agentId: userObjectId,
      filename: outputFilename,
      filenameWithOutro: `wm-${outputFilename}`,
    });

    const finalStats = fs.statSync(finalWithWatermark);

    // Clean up temp files
    [convertedIntro, ...convertedClips, convertedOutro, txtListPath].forEach(f => {
      if (f && fs.existsSync(f)) fs.unlinkSync(f);
    });

    // Debug mode returns metadata instead of download
    if (req.query.debug === "true") {
      return res.json({
        outputFile: `wm-${outputFilename}`,
        sizeInMB: (finalStats.size / (1024 * 1024)).toFixed(2),
        created: true,
      });
    }

    res.download(finalWithWatermark);
  } catch (err) {
    console.error("❌ Video combination failed:", err);
    res.status(500).json({ error: "Video combination failed." });
  }
};
