import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

const Dashboard = () => {
  const [listings, setListings] = useState([]);
  const [videos, setVideos] = useState([]);
  const [savedImages, setSavedImages] = useState([]);
  const [message, setMessage] = useState("");
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
      const res = await axios.get("http://localhost:5000/api/listings", {
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
      const res = await axios.get("http://localhost:5000/api/videos", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setVideos(res.data);
    } catch (err) {
      console.error("❌ Error fetching videos:", err);
    }
  };

  const handleAddNewListing = () => navigate("/add-listing");
  const handleAddNewVideo = () => navigate("/add-video");
  const handleEdit = (id) => navigate(`/edit-listing/${id}`);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this listing?")) {
      try {
        await axios.delete(`http://localhost:5000/api/listings/${id}`, {
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
        await axios.delete(`http://localhost:5000/api/videos/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        fetchVideos();
      } catch (err) {
        console.error("❌ Error deleting video:", err);
        setMessage("❌ Failed to delete video.");
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

  const handleGenerateFlyer = async (listingId) => {
    try {
      const res = await axios.post(
        "http://localhost:5000/api/flyers/generate",
        { listingId },
        { responseType: "blob", headers: { Authorization: `Bearer ${token}` } }
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
    }
  };

  return (
    <div className="relative min-h-screen text-white bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#0a0a23] via-[#1c1c3c] to-black overflow-hidden">
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

      <header className="relative z-20 flex items-center justify-between w-full px-6 py-4 text-white border-b bg-opacity-10 backdrop-blur-md border-white/10">
        <h1 className="text-2xl font-bold text-white drop-shadow-lg">All About Homes AI</h1>
        <nav className="space-x-6">
          <Link to="/login" className="text-lg font-semibold hover:underline">Login</Link>
          <Link to="/register" className="text-lg font-semibold hover:underline">Register</Link>
          <Link to="/dashboard" className="text-lg font-semibold hover:underline">Dashboard</Link>
        </nav>
      </header>

      <div className="relative z-10 min-h-screen px-4 py-10 sm:px-6">
        <h2 className="flex items-center justify-center gap-4 mb-10 text-4xl font-extrabold text-center sm:text-5xl text-cyan-300 animate-pulse">
          🌌 <span>Welcome to Your AI Real Estate Portal</span> 🌌
        </h2>

        <div className="grid justify-center grid-cols-2 gap-4 mb-10 sm:grid-cols-4">
          <button onClick={handleAddNewListing} className="px-4 py-3 font-bold transition shadow-lg bg-gradient-to-r from-green-400 to-green-600 rounded-xl hover:scale-105">
            ➕ Add Listing
          </button>
          <button onClick={handleAddNewVideo} className="px-4 py-3 font-bold transition shadow-lg bg-gradient-to-r from-blue-500 to-blue-700 rounded-xl hover:scale-105">
            🎥 Add Video
          </button>
          <Link to="/description-generator" className="px-4 py-3 font-bold text-center transition shadow-lg bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-xl hover:scale-105">
            ✍️ AI Description
          </Link>
          <Link to="/image-generator" className="px-4 py-3 font-bold text-center transition shadow-lg bg-gradient-to-r from-pink-400 to-pink-600 rounded-xl hover:scale-105">
            🎨 AI Image
          </Link>
        </div>

        <div className="max-w-6xl mx-auto mb-14">
          <h3 className="mb-4 text-2xl font-bold text-cyan-200">🏠 Property Listings</h3>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
            {listings.map((listing) => (
              <div key={listing._id} className="p-5 h-full bg-gradient-to-tr from-black to-slate-900 rounded-2xl shadow-xl hover:scale-[1.02] transition flex flex-col justify-between">
                {listing.coverImage && (
                  <img src={`http://localhost:5000${listing.coverImage}`} alt="Cover" className="object-cover w-full h-48 mb-3 rounded-xl" />
                )}
                <div className="flex-grow">
                  <h3 className="text-xl font-bold text-cyan-300">{listing.title}</h3>
                  <p className="font-semibold text-green-300">R {listing.price}</p>
                  <p className="text-sm text-white/80">📍 {listing.location}</p>
                  <div className="mt-2 space-y-1 text-sm">
                    {listing.bedrooms && <p>🛏️ Bedrooms: {listing.bedrooms}</p>}
                    {listing.bathrooms && <p>🛁 Bathrooms: {listing.bathrooms}</p>}
                    {listing.garageOrParking && <p>🚗 {listing.garageOrParking}</p>}
                  </div>
                </div>
                <div className="mt-4">
                  <button
                    onClick={() => handleGenerateFlyer(listing._id)}
                    className="w-full py-2 font-semibold text-white bg-green-600 rounded hover:bg-green-700"
                  >
                    🖨️ Generate Flyer
                  </button>
                  <div className="flex flex-col justify-between gap-2 mt-3 sm:flex-row">
                    <button onClick={() => handleEdit(listing._id)} className="w-full py-2 font-medium text-white bg-blue-500 rounded hover:bg-blue-600">
                      ✏️ Edit
                    </button>
                    <button onClick={() => handleDelete(listing._id)} className="w-full py-2 font-medium text-white bg-red-500 rounded hover:bg-red-600">
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {savedImages.length > 0 && (
          <div className="max-w-6xl mx-auto mb-14">
            <h3 className="mb-4 text-2xl font-bold text-cyan-200">🎨 Saved AI Images</h3>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
              {savedImages.map((url, index) => (
                <div key={index} className="relative flex flex-col h-full p-2 bg-gradient-to-tr from-black to-slate-900 rounded-xl">
                  <img src={url} alt={`AI ${index}`} className="object-cover w-full h-48 rounded-md" />
                  <div className="flex items-center justify-between mt-2">
                    <button onClick={() => handleDownloadImage(url)} className="flex-1 px-3 py-1 mr-1 text-xs text-white bg-blue-600 rounded hover:bg-blue-700">
                      ⬇ Save
                    </button>
                    <button onClick={() => handleDeleteImage(index)} className="flex-1 px-3 py-1 ml-1 text-xs text-white bg-red-600 rounded hover:bg-red-700">
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="max-w-6xl mx-auto mb-14">
          <h3 className="mb-4 text-2xl font-bold text-cyan-200">🎞️ Uploaded Agent Videos</h3>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
            {videos.map((video) => (
              <div key={video._id} className="p-4 shadow-lg bg-slate-800 rounded-xl">
                <video controls className="w-full rounded-md">
                  <source src={`http://localhost:5000/uploads/videos/${video.filename}`} type="video/mp4" />
                </video>
                <div className="mt-4 space-y-2">
                  <a href={`http://localhost:5000/uploads/videos/${video.filename}`} download className="block w-full px-4 py-2 text-center text-white bg-green-500 rounded hover:bg-green-600">
                    ⬇ Download Video
                  </a>
                  <button onClick={() => handleDeleteVideo(video._id)} className="block w-full px-4 py-2 text-center text-white bg-red-500 rounded hover:bg-red-600">
                    🗑️ Delete Video
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <canvas ref={canvasRef} className="hidden"></canvas>
      </div>
    </div>
  );
};

export default Dashboard;
