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
    const localImages = JSON.parse(localStorage.getItem("savedImages")) || [];
    setSavedImages(localImages);
    fetchListings();
    fetchVideos();
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
    <div className="relative min-h-screen px-4 py-10 overflow-hidden text-white bg-gradient-to-br from-black via-slate-900 to-slate-800">
      {/* ✨ Starry background animation layer */}
      <div className="absolute top-0 left-0 w-full h-full -z-10 stars" />

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

      <section className="mb-16">
        <h2 className="pb-2 mb-6 text-3xl font-bold border-b text-cyan-300 border-cyan-700">🏠 Property Listings</h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
          {listings.map((listing) => (
            <div key={listing._id} className="p-5 h-full bg-gradient-to-tr from-slate-800 to-slate-900 rounded-2xl shadow-xl hover:scale-[1.02] transition flex flex-col justify-between">
              {listing.coverImage && (
                <img src={`https://aah-backend.onrender.com${listing.coverImage}`} alt="Cover" className="object-cover w-full h-48 mb-3 rounded-xl" />
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
                  disabled={generatingFlyerId === listing._id}
                  className={`w-full py-2 font-semibold text-white ${
                    generatingFlyerId === listing._id ? "bg-gray-500" : "bg-green-600 hover:bg-green-700"
                  } rounded`}
                >
                  {generatingFlyerId === listing._id ? "⏳ Generating..." : "🖨️ Generate Flyer"}
                </button>
                <div className="flex flex-col justify-between gap-2 mt-3 sm:flex-row">
                  <button onClick={() => handleEdit(listing._id)} className="w-full py-2 font-medium text-white bg-blue-500 rounded hover:bg-blue-600">✏️ Edit</button>
                  <button onClick={() => handleDelete(listing._id)} className="w-full py-2 font-medium text-white bg-red-500 rounded hover:bg-red-600">🗑️ Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {savedImages.length > 0 && (
        <section className="mb-16">
          <h2 className="pb-2 mb-6 text-3xl font-bold border-b text-cyan-300 border-cyan-700">🎨 Saved AI Images</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
            {savedImages.map((url, index) => (
              <div key={index} className="relative flex flex-col h-full p-2 bg-gradient-to-tr from-slate-800 to-slate-900 rounded-xl">
                <img src={url} alt={`AI ${index}`} className="object-cover w-full h-48 rounded-md" />
                <div className="flex items-center justify-between mt-2">
                  <button onClick={() => handleDownloadImage(url)} className="flex-1 px-3 py-1 mr-1 text-xs text-white bg-blue-600 rounded hover:bg-blue-700">⬇ Save</button>
                  <button onClick={() => handleDeleteImage(index)} className="flex-1 px-3 py-1 ml-1 text-xs text-white bg-red-600 rounded hover:bg-red-700">🗑️ Delete</button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="mb-16">
        <h2 className="pb-2 mb-6 text-3xl font-bold border-b text-cyan-300 border-cyan-700">🎞️ Uploaded Agent Videos</h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
          {videos.map((video) => (
            <div key={video._id} className="p-4 shadow-lg bg-slate-800 rounded-xl">
              <video controls className="w-full rounded-md">
                <source src={`https://aah-backend.onrender.com/uploads/videos/${video.filename}`} type="video/mp4" />
              </video>
              <div className="mt-4 space-y-2">
                <a href={`https://aah-backend.onrender.com/uploads/videos/${video.filename}`} download className="block w-full px-4 py-2 text-center text-white bg-green-500 rounded hover:bg-green-600">⬇ Download Video</a>
                <button onClick={() => handleDeleteVideo(video._id)} className="block w-full px-4 py-2 text-center text-white bg-red-500 rounded hover:bg-red-600">🗑️ Delete Video</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <canvas ref={canvasRef} className="hidden"></canvas>
    </div>
  );
};

export default Dashboard;
