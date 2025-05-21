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

    const introPath = path.resolve(__dirname, "../assets/intro/intro.mp4");
    const outroPath = outroFile
      ? path.resolve(__dirname, `../assets/outros/${outroFile}`)
      : null;
    const watermarkPath = path.resolve(__dirname, "../assets/video-watermark.png");

    const uploadedVideos = req.files["clips"];
    if (!uploadedVideos || uploadedVideos.length === 0) {
      return res.status(400).json({ error: "No video clips uploaded" });
    }

    const tempDir = path.resolve("./uploads/temp");
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

    const allClips = [];

    if (fs.existsSync(introPath)) allClips.push(introPath);
    uploadedVideos.forEach((file) => allClips.push(file.path));
    if (outroPath && fs.existsSync(outroPath)) allClips.push(outroPath);

    const txtListPath = path.join(tempDir, `${uuidv4()}.txt`);
    const listFileContent = allClips.map(p => `file '${p}'`).join("\n");
    fs.writeFileSync(txtListPath, listFileContent);

    const combinedPath = path.resolve(`./uploads/videos/combined-${uuidv4()}.mp4`);
    const watermarkedPath = path.resolve(`./uploads/videos/watermarked-${uuidv4()}.mp4`);

    ffmpeg()
      .input(txtListPath)
      .inputOptions(["-f", "concat", "-safe", "0"])
      .outputOptions([
        "-c:v libx264",
        "-preset", "ultrafast",
        "-c:a aac",
        "-movflags", "faststart",
        "-crf", "23"
      ])
      .on("end", () => {
        ffmpeg(combinedPath)
          .input(watermarkPath)
          .complexFilter("overlay=0:main_h-overlay_h")
          .outputOptions([
            "-preset", "ultrafast",
            "-movflags", "faststart",
            "-crf", "28"
          ])
          .save(watermarkedPath)
          .on("end", async () => {
            await Video.create({
              agentId: new mongoose.Types.ObjectId(userId),
              filename: path.basename(watermarkedPath),
              filenameWithOutro: path.basename(watermarkedPath),
            });
            res.download(watermarkedPath, () => {
              [txtListPath, combinedPath].forEach((file) => {
                if (fs.existsSync(file)) fs.unlinkSync(file);
              });
            });
          })
          .on("error", err => {
            console.error("❌ Watermark error:", err);
            res.status(500).json({ error: "Watermark failed" });
          });
      })
      .on("error", err => {
        console.error("❌ Combining error:", err);
        res.status(500).json({ error: "Combining videos failed" });
      })
      .save(combinedPath);

  } catch (err) {
    console.error("❌ Video processing error:", err);
    res.status(500).json({ error: "Unexpected server error" });
  }
};
