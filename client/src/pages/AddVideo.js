import React, { useState } from "react";
import axios from "axios";

const AddVideo = () => {
  const [clips, setClips] = useState([]);
  const [outro, setOutro] = useState("");
  const [message, setMessage] = useState("");

  const handleFileChange = (e) => {
    setClips(e.target.files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("⏳ Generating video...");

    try {
      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user"));
      const agentId = user?._id;

      if (!agentId) {
        setMessage("❌ Agent ID is missing. Please log in again.");
        return;
      }

      const formData = new FormData();
      for (let i = 0; i < clips.length; i++) {
        formData.append("clips", clips[i]);
      }
      formData.append("outroFile", outro);
      formData.append("agentId", agentId);

      const res = await axios.post("https://aah-backend.onrender.com/api/videos/combine", formData, {
        responseType: "blob",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

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
    <div className="max-w-xl p-8 mx-auto text-white">
      <h1 className="mb-6 text-3xl font-bold">Add New Video</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="file"
          accept="video/mp4"
          multiple
          onChange={handleFileChange}
          className="block w-full text-white"
        />

        <select
          value={outro}
          onChange={(e) => setOutro(e.target.value)}
          className="w-full px-4 py-2 rounded bg-slate-800"
        >
          <option value="">Select Outro (Optional)</option>
          <option value="paula.mp4">Paula</option>
          <option value="mignon.mp4">Mignon</option>
          <option value="richard.mp4">Richard</option>
          <option value="jlee.mp4">Juan-Lee</option>
          <option value="cidreck.mp4">Cidreck</option>
          <option value="victoria.mp4">Victoria</option>
        </select>

        <button type="submit" className="w-full py-3 font-bold text-white bg-blue-500 rounded hover:bg-blue-600">
          Generate Video
        </button>

        {message && <p className="mt-2 text-center">{message}</p>}
      </form>
    </div>
  );
};

export default AddVideo;
