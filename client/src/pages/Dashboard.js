import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

const Dashboard = () => {
  const [listings, setListings] = useState([]);
  const [videos, setVideos] = useState([]);
  const [savedImages, setSavedImages] = useState([]);
  const [generatingFlyerId, setGeneratingFlyerId] = useState(null);
  const canvasRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
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
    }
  };

  const fetchSavedImages = async () => {
    try {
      const res = await axios.get("https://aah-backend.onrender.com/api/images");
      setSavedImages(res.data);
    } catch (err) {
      console.error("❌ Failed to load saved images:", err);
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
      }
    }
  };

  const handleDeleteImage = async (index, id) => {
    try {
      await axios.delete(`https://aah-backend.onrender.com/api/images/${id}`);
      setSavedImages((prev) => prev.filter((_, i) => i !== index));
    } catch (err) {
      console.error("❌ Failed to delete image:", err);
    }
  };

  const handleDownloadImage = (imageSrc) => {
    const link = document.createElement("a");
    link.href = imageSrc;
    link.download = `ai-image-${Date.now()}.png`;
    link.click();
  };

  const handleGenerateFlyer = async (listingId) => {
    setGeneratingFlyerId(listingId);
    const token = localStorage.getItem("token");
    const res = await axios.post(
      "https://aah-backend.onrender.com/api/flyers/generate",
      { listingId },
      { headers: { Authorization: `Bearer ${token}` }, responseType: "blob" }
    );
    const url = window.URL.createObjectURL(res.data);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `flyer-${Date.now()}.jpg`);
    link.click();
    setGeneratingFlyerId(null);
  };

  return (
    <div className="relative min-h-screen px-4 py-10 overflow-hidden text-white bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#0a0a23] via-[#1c1c3c] to-black">
      <div className="absolute inset-0 animate-pulse-slow">
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

      <header className="relative z-10 mb-12 text-center">
        <h1 className="text-4xl font-extrabold text-cyan-300">All About Homes AI Portal</h1>
        <p className="text-sm text-white/60">Empowering your real estate business with smart tools.</p>
      </header>

      <section className="relative z-10 grid grid-cols-2 gap-4 mb-12 sm:grid-cols-4">
        <button onClick={handleAddNewListing} className="py-3 font-bold bg-green-600 rounded">➕ Listing</button>
        <button onClick={handleAddNewVideo} className="py-3 font-bold bg-blue-600 rounded">🎥 Video</button>
        <Link to="/description-generator" className="py-3 font-bold text-center bg-yellow-600 rounded">✍️ AI Desc</Link>
        <Link to="/image-generator" className="py-3 font-bold text-center bg-pink-600 rounded">🎨 AI Image</Link>
      </section>

      <section className="relative z-10 mb-16">
        <h2 className="mb-4 text-2xl text-cyan-300">Listings</h2>
        {listings.map(listing => (
          <div key={listing._id} className="p-4 mb-4 bg-gray-800 rounded">
            <h3 className="font-bold">{listing.title}</h3>
            <button onClick={() => handleGenerateFlyer(listing._id)} className="px-2 bg-green-500 rounded">Flyer</button>
            <button onClick={() => handleEdit(listing._id)} className="px-2 bg-blue-500 rounded">Edit</button>
            <button onClick={() => handleDelete(listing._id)} className="px-2 bg-red-500 rounded">Delete</button>
          </div>
        ))}
      </section>

      <section className="relative z-10 mb-16">
        <h2 className="mb-4 text-2xl text-cyan-300">Videos</h2>
        {videos.map(video => (
          <div key={video._id} className="p-4 mb-4 bg-gray-800 rounded">
            <video src={`https://aah-backend.onrender.com/uploads/videos/${video.filename}`} controls className="rounded" />
            <button onClick={() => handleDeleteVideo(video._id)} className="px-2 bg-red-500 rounded">Delete</button>
          </div>
        ))}
      </section>

      <section className="relative z-10 mb-16">
        <h2 className="mb-4 text-2xl text-cyan-300">AI Images</h2>
        {savedImages.map((img, idx) => (
          <div key={idx} className="p-4 mb-4 bg-gray-800 rounded">
            <img src={img.url} alt="AI" className="rounded" />
            <button onClick={() => handleDownloadImage(img.url)} className="px-2 bg-blue-500 rounded">Download</button>
            <button onClick={() => handleDeleteImage(idx, img._id)} className="px-2 bg-red-500 rounded">Delete</button>
          </div>
        ))}
      </section>

      <canvas ref={canvasRef} className="hidden"></canvas>
    </div>
  );
};

export default Dashboard;
