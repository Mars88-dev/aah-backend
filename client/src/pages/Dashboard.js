import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

const Dashboard = () => {
  const [listings, setListings] = useState([]);
  const [videos, setVideos] = useState([]);
  const [savedImages, setSavedImages] = useState([]);
  const [message, setMessage] = useState("");
  const [generatingFlyerId, setGeneratingFlyerId] = useState(null);
  const canvasRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSavedImages = async () => {
      try {
        const res = await axios.get("https://aah-backend.onrender.com/api/images");
        setSavedImages(res.data);
      } catch (err) {
        console.error("❌ Failed to load saved images:", err);
      }
    };

    const localImages = JSON.parse(localStorage.getItem("savedImages")) || [];
    setSavedImages(localImages);
    fetchListings();
    fetchVideos();
    fetchSavedImages();
  }, []);

  const fetchListings = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("https://aah-backend.onrender.com/api/listings", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setListings(res.data);
    } catch (err) {
      console.error("❌ Error fetching listings:", err);
      setMessage("❌ Failed to fetch listings.");
    }
  };

  const fetchVideos = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("https://aah-backend.onrender.com/api/videos", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setVideos(res.data);
    } catch (err) {
      console.error("❌ Error fetching videos:", err);
      setMessage("❌ Failed to fetch videos.");
    }
  };

  const handleAddNewListing = () => navigate("/add-listing");
  const handleAddNewVideo = () => navigate("/add-video");
  const handleEdit = (id) => navigate(`/edit-listing/${id}`);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this listing?")) {
      try {
        const token = localStorage.getItem("token");
        await axios.delete(`https://aah-backend.onrender.com/api/listings/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        fetchListings();
      } catch (err) {
        console.error("❌ Error deleting listing:", err);
        setMessage("❌ Failed to delete listing.");
      }
    }
  };

  const handleDeleteVideo = async (id) => {
    if (window.confirm("Are you sure you want to delete this video?")) {
      try {
        const token = localStorage.getItem("token");
        await axios.delete(`https://aah-backend.onrender.com/api/videos/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        fetchVideos();
      } catch (err) {
        console.error("❌ Error deleting video:", err);
        setMessage("❌ Failed to delete video.");
      }
    }
  };

  const handleDeleteImage = async (index, id) => {
    try {
      await axios.delete(`https://aah-backend.onrender.com/api/images/${id}`);
      const updated = savedImages.filter((_, i) => i !== index);
      setSavedImages(updated);
    } catch (err) {
      console.error("❌ Failed to delete image:", err);
    }
  };

  const handleDownloadImage = (imageSrc) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      const link = document.createElement("a");
      link.href = canvas.toDataURL("image/png");
      link.download = `ai-image-${Date.now()}.png`;
      link.click();
    };
    img.src = imageSrc;
  };

  const handleGenerateFlyer = async (listingId) => {
    try {
      setGeneratingFlyerId(listingId);
      const token = localStorage.getItem("token");
      const res = await axios.post(
        "https://aah-backend.onrender.com/api/flyers/generate",
        { listingId },
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: "blob",
        }
      );
      const blob = new Blob([res.data], { type: "image/jpeg" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `flyer-${Date.now()}.jpg`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("❌ Error generating flyer:", err);
      setMessage("❌ Failed to generate flyer.");
    } finally {
      setGeneratingFlyerId(null);
    }
  };

  return (
    <div className="relative min-h-screen px-4 py-10 overflow-hidden text-white bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#0a0a23] via-[#1c1c3c] to-black">
      {/* ✨ Starry background animation layer */}
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

      <div className="relative z-10">
        <header className="mb-12 text-center">
          <h1 className="mb-2 text-4xl font-extrabold sm:text-5xl text-cyan-300 drop-shadow-lg">All About Homes AI Portal</h1>
          <p className="text-sm text-white/60">Empowering your real estate business with smart tools and stunning marketing materials.</p>
        </header>

        <section className="mb-14">
          <div className="grid justify-center grid-cols-2 gap-4 sm:grid-cols-4">
            <button onClick={handleAddNewListing} className="px-4 py-3 font-bold transition shadow-lg bg-gradient-to-r from-green-400 to-green-600 rounded-xl hover:scale-105">➕ Add Listing</button>
            <button onClick={handleAddNewVideo} className="px-4 py-3 font-bold transition shadow-lg bg-gradient-to-r from-blue-500 to-blue-700 rounded-xl hover:scale-105">🎥 Add Video</button>
            <Link to="/description-generator" className="px-4 py-3 font-bold text-center transition shadow-lg bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-xl hover:scale-105">✍️ AI Description</Link>
            <Link to="/image-generator" className="px-4 py-3 font-bold text-center transition shadow-lg bg-gradient-to-r from-pink-400 to-pink-600 rounded-xl hover:scale-105">🎨 AI Image</Link>
          </div>
        </section>

        {savedImages.length > 0 && (
          <section className="mb-16">
            <h2 className="pb-2 mb-6 text-3xl font-bold border-b text-cyan-300 border-cyan-700">🖼️ Saved AI Images</h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
              {savedImages.map((img, index) => (
                <div key={index} className="relative flex flex-col h-full p-2 bg-gradient-to-tr from-slate-800 to-slate-900 rounded-xl">
                  <img src={img.url || img} alt={`AI ${index}`} className="object-cover w-full h-48 rounded-md" />
                  <div className="flex items-center justify-between mt-2">
                    <button onClick={() => handleDownloadImage(img.url || img)} className="flex-1 px-3 py-1 mr-1 text-xs text-white bg-blue-600 rounded hover:bg-blue-700">⬇ Save</button>
                    <button onClick={() => handleDeleteImage(index, img._id)} className="flex-1 px-3 py-1 ml-1 text-xs text-white bg-red-600 rounded hover:bg-red-700">🗑️ Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      <canvas ref={canvasRef} className="hidden"></canvas>
    </div>
  );
};

export default Dashboard;
