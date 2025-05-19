import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

const ImageGenerator = () => {
  const [prompt, setPrompt] = useState("");
  const [imageSrc, setImageSrc] = useState(null);
  const [savedImages, setSavedImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const canvasRef = useRef(null);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("savedImages")) || [];
    setSavedImages(stored);
  }, []);

  const handleGenerate = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.post("https://aah-backend.onrender.com/api/generate-image", { prompt });
      setImageSrc(res.data.image);
    } catch (err) {
      console.error("❌ Failed to generate image:", err);
      setError("❌ Error generating image. Please try again.");
    }
    setLoading(false);
  };

  const drawImageWithWatermark = async (imageDataUrl) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    return new Promise((resolve) => {
      const img = new window.Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        const watermark = new window.Image();
        watermark.src = "/assets/Untitled design (1).png";
        watermark.onload = () => {
          const scale = img.width / watermark.width;
          const wmWidth = img.width;
          const wmHeight = watermark.height * scale;
          ctx.drawImage(watermark, 0, img.height - wmHeight, wmWidth, wmHeight);
          resolve(canvas.toDataURL("image/png"));
        };
      };
      img.src = imageDataUrl;
    });
  };

  const handleDownload = async () => {
    if (!imageSrc) return;
    const watermarked = await drawImageWithWatermark(imageSrc);
    const link = document.createElement("a");
    link.href = watermarked;
    link.download = `ai-image-${Date.now()}.png`;
    link.click();
  };

  const handleSave = async () => {
    if (!imageSrc) return;
    const watermarked = await drawImageWithWatermark(imageSrc);
    const updated = [...savedImages, watermarked];
    setSavedImages(updated);
    localStorage.setItem("savedImages", JSON.stringify(updated));
    setImageSrc(null);
  };

  const handleDelete = (index) => {
    const updated = savedImages.filter((_, i) => i !== index);
    setSavedImages(updated);
    localStorage.setItem("savedImages", JSON.stringify(updated));
  };

  return (
    <div className="relative min-h-screen text-white bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#0a0a23] via-[#1c1c3c] to-black overflow-hidden">
      {/* Stars background */}
      <div className="absolute inset-0 z-0 animate-pulse-slow">
        {[...Array(200)].map((_, i) => (
          <div
            key={i}
            className="absolute w-[2px] h-[2px] bg-white rounded-full opacity-40 animate-flicker"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${2 + Math.random() * 3}s`,
            }}
          ></div>
        ))}
      </div>

      <div className="relative z-10 px-4 py-10 sm:px-6">
        <h1 className="mb-8 text-3xl font-extrabold text-center sm:text-4xl text-cyan-300 animate-pulse">
          🎨 AI Image Generator
        </h1>

        <div className="w-full max-w-xl mx-auto">
          <textarea
            placeholder="e.g., Happy Mother's Day card with flowers and sunset background"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={4}
            className="w-full p-4 mb-4 text-white placeholder-gray-400 border border-slate-600 bg-slate-800 rounded-xl focus:outline-none"
          ></textarea>
          <button
            onClick={handleGenerate}
            className="w-full px-6 py-3 font-bold text-white bg-green-600 rounded-xl hover:bg-green-700"
            disabled={loading}
          >
            {loading ? "Generating..." : "🧠 Generate Image"}
          </button>
          {error && <p className="mt-4 text-center text-red-400">{error}</p>}
        </div>

        {imageSrc && (
          <div className="flex flex-col items-center px-2 mt-10">
            <div className="relative w-full max-w-md overflow-hidden bg-white shadow-lg rounded-xl">
              <h3 className="py-2 text-lg font-bold text-center text-black">Generated Image:</h3>
              <img src={imageSrc} alt="AI Result" className="object-contain w-full" />
            </div>
            <div className="flex flex-col w-full max-w-md gap-3 mt-4 sm:flex-row">
              <button
                onClick={handleDownload}
                className="flex-1 px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700"
              >
                ⬇ Download
              </button>
              <button
                onClick={handleSave}
                className="flex-1 px-4 py-2 text-white bg-purple-600 rounded hover:bg-purple-700"
              >
                💾 Save to Dashboard
              </button>
            </div>
          </div>
        )}

        {savedImages.length > 0 && (
          <div className="max-w-6xl px-2 mx-auto mt-16">
            <h3 className="mb-4 text-2xl font-bold text-cyan-200">🖼️ Saved AI Images</h3>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {savedImages.map((url, index) => (
                <div key={index} className="relative flex flex-col h-full p-2 bg-gradient-to-tr from-black to-slate-900 rounded-xl">
                  <img src={url} alt={`AI ${index}`} className="object-cover w-full h-48 rounded-md" />
                  <button
                    onClick={() => handleDelete(index)}
                    className="absolute px-2 py-1 text-xs text-white bg-red-600 rounded top-2 right-2 hover:bg-red-700"
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
};

export default ImageGenerator;
