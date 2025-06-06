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

  const handleOutroChange = (e) => {
    setOutro(e.target.value); // send just the filename like "paula.mp4"
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

      if (outro) {
        formData.append("outro", outro); // ✅ send just the string
      }

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
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setMessage("✅ Video downloaded successfully!");
    } catch (err) {
      console.error("❌ Error generating video:", err);
      setMessage("❌ Failed to generate video.");
    }
  };

  return (
    <div className="relative min-h-screen text-white bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#0a0a23] via-[#1c1c3c] to-black overflow-hidden">
      {/* ✨ Starry animated background */}
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

      <div className="relative z-10 max-w-xl p-8 mx-auto mt-10 text-white border rounded shadow-xl bg-slate-800/80 backdrop-blur-md border-white/10">
        <h1 className="mb-6 text-3xl font-bold text-center text-cyan-300">
          🎬 Generate Property Video
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="file"
            accept="video/mp4"
            multiple
            onChange={handleFileChange}
            className="block w-full px-4 py-2 text-white rounded bg-slate-700"
          />

          <select
            onChange={handleOutroChange}
            className="w-full px-4 py-2 rounded bg-slate-700"
            defaultValue=""
          >
            <option value="">Select Outro (Optional)</option>
            <option value="adri.mp4">Adri</option>
            <option value="charlene.mp4">Charlene</option>
            <option value="cidreck.mp4">Cidreck</option>
            <option value="dean.mp4">Dean</option>
            <option value="erika.mp4">Erika</option>
            <option value="florence.mp4">Florence</option>
            <option value="given.mp4">Given</option>
            <option value="griselda.mp4">Griselda</option>
            <option value="henry.mp4">Henry</option>
            <option value="ilona.mp4">Ilona</option>
            <option value="ilse.mp4">Ilse</option>
            <option value="jaco.mp4">Jaco</option>
            <option value="jacolien.mp4">Jacolien</option>
            <option value="jacques.mp4">Jacques</option>
            <option value="jeanette.mp4">Jeanette</option>
            <option value="jlee.mp4">Jlee</option>
            <option value="kwanele.mp4">Kwanele</option>
            <option value="lapo.mp4">Lapo</option>
            <option value="lizzy.mp4">Lizzy</option>
            <option value="maki.mp4">Maki</option>
            <option value="martha.mp4">Martha</option>
            <option value="mignon.mp4">Mignon</option>
            <option value="oupa.mp4">Oupa</option>
            <option value="paula.mp4">Paula</option>
            <option value="richard.mp4">Richard</option>
            <option value="rudolph.mp4">Rudoplh</option>
            <option value="shirley.mp4">Shirley</option>
            <option value="sylvia.mp4">Sylvia</option>
            <option value="theuns.mp4">Theuns</option>
            <option value="veronika.mp4">Veronika</option>
            <option value="victoria.mp4">Victoria</option>
            <option value="wesley.mp4">Wesley</option>
            <option value="zach.mp4">Zach</option>
          </select>

          <button
            type="submit"
            className="w-full py-3 font-bold text-white bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl hover:from-purple-700 hover:to-blue-700"
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
