const fs = require("fs");
const path = require("path");
const ffmpeg = require("fluent-ffmpeg");
const { v4: uuidv4 } = require("uuid");

exports.combineVideos = async (req, res) => {
  try {
    const uploadedVideos = req.files["clips"];
    const outroFilename = req.body.outro; // e.g. "paula.mp4"

    const introPath = path.resolve(__dirname, "../assets/intro/intro.mp4");
    const outroPath = outroFilename
      ? path.resolve(__dirname, `../assets/outro/${outroFilename}`)
      : null;

    const watermarkPath = path.resolve(__dirname, "../assets/video-watermark.png");

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
          .size("1280x720") // 🔼 UPGRADED TO HD
          .addOption("-crf", "26")
          .addOption("-preset", "fast")
          .on("end", () => {
            if (fs.statSync(outputPath).size < 1024) {
              return reject(new Error(`❌ Output too small: ${outputPath}`));
            }
            resolve(outputPath);
          })
          .on("error", (err) => reject(err))
          .save(outputPath);
      });
    };

    const combinedPathList = [];

    // ✅ Convert intro
    let convertedIntro = null;
    if (fs.existsSync(introPath)) {
      convertedIntro = path.join(tempDir, `intro-${Date.now()}.mp4`);
      await convertToMp4(introPath, convertedIntro);
      combinedPathList.push(path.resolve(convertedIntro));
    }

    // ✅ Convert uploaded clips
    for (const file of uploadedVideos) {
      const convertedClip = path.join(tempDir, `clip-${Date.now()}-${file.originalname}`);
      await convertToMp4(file.path, convertedClip);
      combinedPathList.push(path.resolve(convertedClip));
    }

    // ✅ Convert outro from static assets if selected
    let convertedOutro = null;
    if (outroPath && fs.existsSync(outroPath)) {
      convertedOutro = path.join(tempDir, `outro-${Date.now()}.mp4`);
      if (fs.statSync(outroPath).size > 1024) {
        console.log("✅ Outro found. Converting:", outroPath);
        await convertToMp4(outroPath, convertedOutro);
        combinedPathList.push(path.resolve(convertedOutro));
      } else {
        console.log("❌ Outro file invalid or empty, skipping:", outroPath);
      }
    } else if (outroFilename) {
      console.log("⚠️ Outro not found at path:", outroPath);
    }

    if (combinedPathList.length === 0) {
      return res.status(400).json({ error: "No valid video segments to combine." });
    }

    const txtListPath = path.join(tempDir, `${uuidv4()}.txt`);
    const listFileContent = combinedPathList.map(p => `file '${p.replace(/'/g, "'\\''")}'`).join("\n");
    fs.writeFileSync(txtListPath, listFileContent);

    const outputPath = path.join(tempDir, `combined-${Date.now()}.mp4`);

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

    // ✅ Apply watermark @ 720p
    const finalPath = path.join(tempDir, `final-${Date.now()}.mp4`);
    await new Promise((resolve, reject) => {
      ffmpeg()
        .input(outputPath)
        .input(watermarkPath)
        .complexFilter([
          "[0:v]scale=1280:720[base]",
          "[1:v]scale=1280:80[wm]",
          "[base][wm]overlay=(main_w-overlay_w)/2:main_h-overlay_h"
        ])
        .videoCodec("libx264")
        .audioCodec("aac")
        .addOption("-crf", "26")
        .addOption("-preset", "fast")
        .on("end", resolve)
        .on("error", reject)
        .save(finalPath);
    });

    res.download(finalPath, "listing-video.mp4", () => {
      [convertedIntro, ...combinedPathList, txtListPath, outputPath, finalPath]
        .filter(Boolean)
        .forEach(f => { if (fs.existsSync(f)) fs.unlinkSync(f); });
    });

  } catch (err) {
    console.error("❌ Video combination failed:", err.message);
    res.status(500).json({ error: "Video combination failed." });
  }
};
