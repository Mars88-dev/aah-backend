import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import FlyerPreview from "../components/FlyerPreview";

const BASE_URL = "https://aah-backend.onrender.com";

const Dashboard = () => {
  const [listings, setListings] = useState([]);
  const [videos, setVideos] = useState([]);
  const [savedImages, setSavedImages] = useState([]);
  const [generatingFlyerId, setGeneratingFlyerId] = useState(null);
  const canvasRef = useRef(null);
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchListings();
    fetchVideos();
    const localImages = JSON.parse(localStorage.getItem("savedImages")) || [];
    setSavedImages(localImages);
  }, []);

  const fetchListings = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/listings`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setListings(res.data);
    } catch (err) {
      console.error("❌ Error fetching listings:", err);
    }
  };

  const fetchVideos = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/videos`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setVideos(res.data);
    } catch (err) {
      console.error("❌ Error fetching videos:", err);
    }
  };

  const handleFlyerClick = async (listing) => {
    try {
      setGeneratingFlyerId(listing._id);
      const { default: html2canvas } = await import("html2canvas");
      const flyer = document.createElement("div");
      flyer.style.position = "fixed";
      flyer.style.left = "-9999px";
      flyer.style.width = "1080px";
      flyer.style.height = "1080px";
      flyer.style.backgroundColor = "white";
      flyer.innerHTML = `<img src='${BASE_URL}${listing.coverImage}' style='position:absolute;top:181.2px;width:1080px;height:480.3px;z-index:1;object-fit:cover'/><img src='/templates/${listing.template || "paula.png"}' style='width:1080px;height:1080px;position:absolute;top:0;left:0;z-index:2' />`;
      document.body.appendChild(flyer);

      const canvas = await html2canvas(flyer);
      const link = document.createElement("a");
      link.download = `${listing.title}-flyer.jpg`;
      link.href = canvas.toDataURL("image/jpeg", 1.0);
      link.click();
      document.body.removeChild(flyer);
    } catch (err) {
      console.error("❌ Flyer generation failed:", err);
    } finally {
      setGeneratingFlyerId(null);
    }
  };

  const handleAddNewListing = () => navigate("/add-listing");
  const handleAddNewVideo = () => navigate("/add-video");
  const handleEdit = (id) => navigate(`/edit-listing/${id}`);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this listing?")) {
      try {
        await axios.delete(`${BASE_URL}/api/listings/${id}`, {
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
        await axios.delete(`${BASE_URL}/api/videos/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        fetchVideos();
      } catch (err) {
        console.error("❌ Error deleting video:", err);
      }
    }
  };

  const handleDeleteImage = (index) => {
    const updated = savedImages.filter((_, i) => i !== index);
    setSavedImages(updated);
    localStorage.setItem("savedImages", JSON.stringify(updated));
  };

  const handleDownloadImage = (imageSrc) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      const logo = new Image();
      logo.src = "/assets/logo.png";
      logo.onload = () => {
        const scale = img.width / 10 / logo.width;
        const logoWidth = logo.width * scale;
        const logoHeight = logo.height * scale;
        ctx.globalAlpha = 0.8;
        ctx.drawImage(logo, 20, img.height - logoHeight - 20, logoWidth, logoHeight);
        const link = document.createElement("a");
        link.href = canvas.toDataURL("image/png");
        link.download = `ai-image-${Date.now()}.png`;
        link.click();
      };
    };
    img.src = imageSrc;
  };

  return (
    <div className="relative min-h-screen text-white overflow-x-hidden bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#0a0a23] via-[#1c1c3c] to-black">
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

      <canvas ref={canvasRef} className="hidden"></canvas>

      <header className="relative z-20 flex flex-col items-center justify-between w-full px-4 py-4 text-white border-b sm:flex-row border-white/10 backdrop-blur-md">
        <h1 className="text-2xl font-bold drop-shadow-lg">All About Homes AI</h1>
        <nav className="flex flex-wrap justify-center gap-4 mt-2 sm:mt-0">
          <Link to="/login" className="hover:underline">Login</Link>
          <Link to="/register" className="hover:underline">Register</Link>
          <Link to="/dashboard" className="hover:underline">Dashboard</Link>
        </nav>
      </header>

      <div className="relative z-10 min-h-screen px-4 py-6 sm:px-6">
        <h2 className="mb-6 overflow-hidden text-2xl font-bold text-center text-cyan-300 whitespace-nowrap text-ellipsis">🌌 Welcome to Your AI Real Estate Portal 🌌</h2>

        <div className="grid justify-center grid-cols-2 gap-4 mb-10 sm:grid-cols-4">
          <button onClick={handleAddNewListing} className="px-4 py-3 font-semibold transition bg-green-500 rounded-lg shadow hover:scale-105">➕ Add Listing</button>
          <button onClick={handleAddNewVideo} className="px-4 py-3 font-semibold transition bg-blue-500 rounded-lg shadow hover:scale-105">🎥 Add Video</button>
          <Link to="/description-generator" className="px-4 py-3 font-semibold text-center transition bg-yellow-500 rounded-lg shadow hover:scale-105">✍️ AI Description</Link>
          <Link to="/image-generator" className="px-4 py-3 font-semibold text-center transition bg-pink-500 rounded-lg shadow hover:scale-105">🎨 AI Image</Link>
        </div>

        {/* Listings Section */}
        <section className="mb-12">
          <h3 className="pb-2 mb-4 text-xl font-bold border-b text-cyan-200 border-cyan-600">🏠 Property Listings</h3>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
            {listings.map((listing) => (
              <div key={listing._id} className="flex flex-col justify-between p-4 shadow-md bg-slate-900 rounded-xl">
                {listing.coverImage && (
                  <img src={`${BASE_URL}${listing.coverImage}`} alt="Cover" className="object-cover w-full h-40 mb-2 rounded-md" />
                )}
                <div className="mb-2 text-white">
                  <h4 className="text-lg font-bold text-cyan-300">{listing.title}</h4>
                  <p className="font-semibold text-green-400">R {listing.price}</p>
                  <p className="text-sm text-white/80">📍 {listing.location}</p>
                </div>
                <div className="space-y-1 text-sm text-white">
                  {listing.bedrooms && <p>🛏️ {listing.bedrooms} Bedrooms</p>}
                  {listing.bathrooms && <p>🛁 {listing.bathrooms} Bathrooms</p>}
                  {listing.garages && <p>🚗 {listing.garages} Garages</p>}
                  {listing.landSize && <p>📐 {listing.landSize}</p>}
                </div>
                <div className="mt-3 space-y-2">
                  <button
                    onClick={() => handleFlyerClick(listing)}
                    disabled={generatingFlyerId === listing._id}
                    className="w-full py-2 text-white bg-purple-600 rounded hover:bg-purple-700 disabled:opacity-60"
                  >
                    {generatingFlyerId === listing._id ? "🕐 Generating..." : "🖨️ Generate Flyer"}
                  </button>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <button onClick={() => handleEdit(listing._id)} className="w-full py-2 text-white bg-blue-500 rounded hover:bg-blue-600">✏️ Edit</button>
                    <button onClick={() => handleDelete(listing._id)} className="w-full py-2 text-white bg-red-500 rounded hover:bg-red-600">🗑️ Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
