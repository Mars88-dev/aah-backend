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
      console.error("❌ Failed to load images:", err);
    }
  };

  const handleAddNewListing = () => navigate("/add-listing");
  const handleAddNewVideo = () => navigate("/add-video");
  const handleEdit = (id) => navigate(`/edit-listing/${id}`);

  const handleDelete = async (id) => {
    if (window.confirm("Delete this listing?")) {
      const token = localStorage.getItem("token");
      await axios.delete(`https://aah-backend.onrender.com/api/listings/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchListings();
    }
  };

  const handleDeleteVideo = async (id) => {
    if (window.confirm("Delete this video?")) {
      const token = localStorage.getItem("token");
      await axios.delete(`https://aah-backend.onrender.com/api/videos/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchVideos();
    }
  };

  const handleDeleteImage = async (index, id) => {
    await axios.delete(`https://aah-backend.onrender.com/api/images/${id}`);
    setSavedImages((prev) => prev.filter((_, i) => i !== index));
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
        <p className="text-white/60">Smart tools for your real estate business.</p>
      </header>

      <section className="relative z-10 grid grid-cols-2 gap-4 mb-10 sm:grid-cols-4">
        <button onClick={handleAddNewListing} className="py-3 bg-green-600 rounded-xl">➕ Add Listing</button>
        <button onClick={handleAddNewVideo} className="py-3 bg-blue-600 rounded-xl">🎥 Add Video</button>
        <Link to="/description-generator" className="py-3 text-center bg-yellow-600 rounded-xl">✍️ AI Desc</Link>
        <Link to="/image-generator" className="py-3 text-center bg-pink-600 rounded-xl">🎨 AI Image</Link>
      </section>

      <section className="relative z-10 mb-10">
        <h2 className="mb-4 text-2xl border-b text-cyan-300 border-cyan-700">🏠 Listings</h2>
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {listings.map(listing => (
            <div key={listing._id} className="p-4 bg-slate-800 rounded-xl">
              {listing.coverImage && (
                <img
                  src={`https://aah-backend.onrender.com${listing.coverImage}`}
                  className="object-cover w-full h-32 rounded-md"
                />
              )}
              <h3 className="text-lg font-bold">{listing.title}</h3>
              <p className="text-green-300">R {listing.price}</p>
              <p>📍 {listing.location}</p>
              <button onClick={() => handleGenerateFlyer(listing._id)} className="w-full py-1 mt-2 bg-green-500 rounded">
                {generatingFlyerId === listing._id ? "Generating..." : "🖨️ Flyer"}
              </button>
              <div className="flex gap-2 mt-2">
                <button onClick={() => handleEdit(listing._id)} className="flex-1 py-1 bg-blue-500 rounded">✏️ Edit</button>
                <button onClick={() => handleDelete(listing._id)} className="flex-1 py-1 bg-red-500 rounded">🗑️ Delete</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="relative z-10 mb-10">
        <h2 className="mb-4 text-2xl border-b text-cyan-300 border-cyan-700">🎞️ Videos</h2>
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {videos.map(video => (
            <div key={video._id} className="p-4 bg-slate-800 rounded-xl">
              <video src={`https://aah-backend.onrender.com/uploads/videos/${video.filename}`} controls className="rounded" />
              <div className="flex gap-2 mt-2">
                <a href={`https://aah-backend.onrender.com/uploads/videos/${video.filename}`} download className="flex-1 py-1 text-center bg-green-500 rounded">⬇️ Save</a>
                <button onClick={() => handleDeleteVideo(video._id)} className="flex-1 py-1 bg-red-500 rounded">🗑️ Delete</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="relative z-10">
        <h2 className="mb-4 text-2xl border-b text-cyan-300 border-cyan-700">🖼️ AI Images</h2>
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {savedImages.map((img, idx) => (
            <div key={idx} className="p-4 bg-slate-800 rounded-xl">
              <img src={img.url} className="object-cover w-full h-32 rounded-md" />
              <button onClick={() => handleDownloadImage(img.url)} className="w-full py-1 mt-2 bg-blue-500 rounded">⬇️ Save</button>
              <button onClick={() => handleDeleteImage(idx, img._id)} className="w-full py-1 mt-1 bg-red-500 rounded">🗑️ Delete</button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
