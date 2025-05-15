import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const AddVideo = () => {
  const [videos, setVideos] = useState([]);
  const [agentTemplate, setAgentTemplate] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    setVideos([...e.target.files]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");
    const agentId = localStorage.getItem("userId");

    if (!agentId) {
      setMessage("❌ Agent ID missing from local storage.");
      return;
    }

    const formData = new FormData();
    videos.forEach((video) => formData.append("videos", video));
    formData.append("agentId", agentId);
    if (agentTemplate) formData.append("template", agentTemplate);

    try {
      const res = await axios.post(
        "http://localhost:5000/api/videos/combine",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
          responseType: "blob",
        }
      );

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "final-highlight.mp4");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setMessage("✅ Video generated successfully!");
      setTimeout(() => navigate("/dashboard"), 700);
    } catch (err) {
      console.error("❌ Upload error:", err.response?.data || err.message);
      setMessage("❌ Failed to upload and process videos.");
    }
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen px-4 py-10 text-white bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#0a0a23] via-[#1c1c3c] to-black overflow-hidden">
      {/* Starry background */}
      <div className="absolute inset-0 z-0 animate-pulse-slow">
        {[...Array(150)].map((_, i) => (
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

      <form
        onSubmit={handleSubmit}
        className="relative z-10 w-full max-w-xl p-8 shadow-2xl bg-gradient-to-tr from-slate-800 to-slate-700 rounded-2xl"
      >
        <h2 className="mb-6 text-3xl font-bold text-center text-cyan-300">
          🎬 Upload Video Clips
        </h2>

        <input
          type="file"
          accept="video/*"
          multiple
          onChange={handleFileChange}
          className="w-full px-4 py-2 mb-4 text-white border rounded-xl bg-slate-700 border-slate-600"
        />

        <label className="block mb-2 font-semibold text-white">
          Attach Agent Outro Template (Optional)
        </label>
        <select
          value={agentTemplate}
          onChange={(e) => setAgentTemplate(e.target.value)}
          className="w-full px-4 py-3 mb-6 text-white border bg-slate-700 border-slate-600 rounded-xl"
        >
          <option value="">-- No Outro --</option>
          <option value="paula.mp4">Paula</option>
          <option value="mignon.mp4">Mignon</option>
          <option value="richard.mp4">Richard</option>
          <option value="jlee.mp4">Juan-Lee</option>
          <option value="cidreck.mp4">Cidreck</option>
          <option value="victoria.mp4">Victoria</option>
        </select>

        <button
          type="submit"
          className="w-full py-3 font-bold text-white bg-green-500 rounded-xl hover:bg-green-600"
        >
          🚀 Generate Branded Video
        </button>

        {message && (
          <p className="mt-4 font-medium text-center text-pink-300">{message}</p>
        )}
      </form>
    </div>
  );
};

export default AddVideo;
