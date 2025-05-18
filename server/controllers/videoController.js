const fs = require("fs");
const path = require("path");
const ffmpeg = require("fluent-ffmpeg");
ffmpeg.setFfmpegPath("C:/ffmpeg/bin/ffmpeg.exe");
const Video = require("../models/Video");

exports.combineVideos = async (req, res) => {
  try {
    const { agentId, template } = req.body;
    const files = req.files;
    const timestamp = Date.now();

    if (!agentId || agentId === "undefined") {
      return res.status(400).json({ error: "Missing agentId." });
    }

    if (!files || files.length === 0) {
      return res.status(400).json({ error: "No videos uploaded." });
    }

    const introPath = path.resolve("assets/intro/video.mp4");
    const clipPaths = files.map(file => `file '${path.resolve(file.path)}'`);
    const clipsTxtPath = `uploads/videos/clips-${timestamp}.txt`;
    const stitchedClipsPath = `uploads/videos/stitched-${timestamp}.mp4`;

    fs.writeFileSync(clipsTxtPath, clipPaths.join("\n"));

    await new Promise((resolve, reject) => {
      ffmpeg()
        .input(clipsTxtPath)
        .inputOptions(["-f", "concat", "-safe", "0"])
        .outputOptions(["-c:v", "libx264", "-preset", "fast", "-crf", "22", "-pix_fmt", "yuv420p"])
        .output(stitchedClipsPath)
        .on("end", resolve)
        .on("error", reject)
        .run();
    });

    const watermarkedPath = `uploads/videos/watermarked-${timestamp}.mp4`;
    const watermarkOverlayPath = path.resolve("assets/watermark/full-overlay.png");
    await new Promise((resolve, reject) => {
      ffmpeg()
        .input(stitchedClipsPath)
        .input(watermarkOverlayPath)
        .complexFilter("overlay=0:main_h-overlay_h")
        .outputOptions(["-c:v", "libx264", "-preset", "fast", "-crf", "22", "-pix_fmt", "yuv420p"])
        .output(watermarkedPath)
        .on("end", resolve)
        .on("error", reject)
        .run();
    });

    const mergedListPath = `uploads/videos/merged-list-${timestamp}.txt`;
    const mergedPath = `uploads/videos/merged-${timestamp}.mp4`;

    fs.writeFileSync(mergedListPath, [
      `file '${introPath}'`,
      `file '${path.resolve(watermarkedPath)}'`,
    ].join("\n"));

    await new Promise((resolve, reject) => {
      ffmpeg()
        .input(mergedListPath)
        .inputOptions(["-f", "concat", "-safe", "0"])
        .outputOptions(["-c:v", "libx264", "-preset", "fast", "-crf", "22", "-pix_fmt", "yuv420p"])
        .output(mergedPath)
        .on("end", resolve)
        .on("error", reject)
        .run();
    });

    let finalPath = mergedPath;
    if (template) {
      const outroPath = path.resolve("assets/outros", template);
      const finalListPath = `uploads/videos/final-list-${timestamp}.txt`;
      finalPath = `uploads/videos/final-${timestamp}.mp4`;

      fs.writeFileSync(finalListPath, [
        `file '${path.resolve(mergedPath)}'`,
        `file '${outroPath}'`
      ].join("\n"));

      if (!fs.existsSync(finalListPath)) {
        throw new Error(`Final list file not found: ${finalListPath}`);
      }

      await new Promise((resolve, reject) => {
        ffmpeg()
          .input(finalListPath)
          .inputOptions(["-f", "concat", "-safe", "0"])
          .outputOptions(["-c:v", "libx264", "-preset", "fast", "-crf", "22", "-pix_fmt", "yuv420p"])
          .output(finalPath)
          .on("end", resolve)
          .on("error", reject)
          .run();
      });

      fs.unlinkSync(finalListPath);
    }

    await new Video({
      agentId,
      filename: path.basename(finalPath),
      filenameWithOutro: template ? path.basename(finalPath) : null,
      createdAt: new Date(),
    }).save();

    res.download(finalPath, () => {
      fs.unlinkSync(clipsTxtPath);
      fs.unlinkSync(stitchedClipsPath);
      fs.unlinkSync(watermarkedPath);
      fs.unlinkSync(mergedListPath);
      if (finalPath !== mergedPath) fs.unlinkSync(mergedPath);
    });

  } catch (err) {
    console.error("❌ Video processing failed:", err.message);
    res.status(500).json({ error: err.message || "Video processing error" });
  }
};
