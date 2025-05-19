import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const AddVideo = () => {
  const [clips, setClips] = useState([]);
  const [outro, setOutro] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    setClips(e.target.files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("⏳ Generating video...");

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setMessage("❌ You must be logged in to generate a video.");
        return;
      }

      const formData = new FormData();
      for (let i = 0; i < clips.length; i++) {
        formData.append("clips", clips[i]);
      }
      formData.append("outroFile", outro);

      const res = await axios.post(
        "https://aah-backend.onrender.com/api/videos/combine",
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: "blob",
        }
      );

      const blob = new Blob([res.data], { type: "video/mp4" });
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = "listing-video.mp4";
      link.click();

      setMessage("✅ Video downloaded successfully!");
    } catch (err) {
      console.error("❌ Error generating video:", err);
      setMessage("❌ Failed to generate video.");
    }
  };

  return (
    <div className="relative min-h-screen px-4 py-10 overflow-hidden text-white bg-gradient-to-br from-black via-slate-900 to-slate-800">
      {/* ✨ Animated Starry Background */}
      <div className="absolute top-0 left-0 w-full h-full -z-10 stars" />

      <div className="max-w-xl p-8 mx-auto text-white rounded shadow-xl bg-slate-800/80">
        <h1 className="mb-6 text-3xl font-bold text-center text-cyan-300">🎬 Generate Property Video</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="file"
            accept="video/mp4"
            multiple
            onChange={handleFileChange}
            className="block w-full px-4 py-2 text-white rounded bg-slate-700"
          />

          <select
            value={outro}
            onChange={(e) => setOutro(e.target.value)}
            className="w-full px-4 py-2 rounded bg-slate-700"
          >
            <option value="">Select Outro (Optional)</option>
            <option value="paula.mp4">Paula</option>
            <option value="mignon.mp4">Mignon</option>
            <option value="richard.mp4">Richard</option>
            <option value="jlee.mp4">Juan-Lee</option>
            <option value="cidreck.mp4">Cidreck</option>
            <option value="victoria.mp4">Victoria</option>
          </select>

          <button
            type="submit"
            className="w-full py-3 font-bold text-white bg-blue-600 rounded hover:bg-blue-700"
          >
            Generate Video
          </button>

          {message && <p className="mt-2 text-center">{message}</p>}
        </form>

        <button
          onClick={() => navigate("/dashboard")}
          className="w-full py-2 mt-6 font-semibold text-white rounded bg-slate-600 hover:bg-slate-700"
        >
          ⬅ Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default AddVideo;
