import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import FlyerPreview from "../components/FlyerPreview";

const BASE_URL = "https://aah-backend.onrender.com";

const Dashboard = () => {
  const [listings, setListings] = useState([]);
  const [videos, setVideos] = useState([]);
  const [savedImages, setSavedImages] = useState([]);
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

  const handleFlyerClick = (listing) => {
    const flyerComponent = document.createElement("div");
    document.body.appendChild(flyerComponent);
    const Component = () => <FlyerPreview listing={listing} onClose={() => flyerComponent.remove()} />;
    import("react-dom").then(ReactDOM => ReactDOM.render(<Component />, flyerComponent));
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
    <div className="relative min-h-screen text-white bg-gradient-to-b from-black via-[#0a0a23] to-[#1c1c3c] overflow-x-hidden">
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
        <h2 className="mb-6 text-3xl font-bold text-center text-cyan-300">🌌 Welcome to Your AI Real Estate Portal 🌌</h2>

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
                  <button onClick={() => handleFlyerClick(listing)} className="w-full py-2 text-white bg-purple-600 rounded hover:bg-purple-700">🖨️ Generate Flyer</button>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <button onClick={() => handleEdit(listing._id)} className="w-full py-2 text-white bg-blue-500 rounded hover:bg-blue-600">✏️ Edit</button>
                    <button onClick={() => handleDelete(listing._id)} className="w-full py-2 text-white bg-red-500 rounded hover:bg-red-600">🗑️ Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Saved AI Images */}
        {savedImages.length > 0 && (
          <section className="mb-12">
            <h3 className="pb-2 mb-4 text-xl font-bold border-b text-cyan-200 border-cyan-600">🎨 Saved AI Images</h3>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
              {savedImages.map((url, index) => (
                <div key={index} className="p-2 rounded-lg bg-slate-800">
                  <img src={url} alt={`AI ${index}`} className="object-cover w-full h-40 rounded-md" />
                  <div className="flex justify-between mt-2">
                    <button onClick={() => handleDownloadImage(url)} className="px-3 py-1 text-xs text-white bg-blue-600 rounded hover:bg-blue-700">⬇ Save</button>
                    <button onClick={() => handleDeleteImage(index)} className="px-3 py-1 text-xs text-white bg-red-600 rounded hover:bg-red-700">🗑️ Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Uploaded Videos */}
        <section className="mb-12">
          <h3 className="pb-2 mb-4 text-xl font-bold border-b text-cyan-200 border-cyan-600">🎞️ Uploaded Agent Videos</h3>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
            {videos.map((video) => (
              <div key={video._id} className="p-4 rounded-lg bg-slate-800">
                <video controls className="w-full rounded">
                  <source src={`${BASE_URL}/uploads/videos/${video.filename}`} type="video/mp4" />
                </video>
                <div className="mt-3 space-y-2">
                  <a href={`${BASE_URL}/uploads/videos/${video.filename}`} download className="block w-full py-2 text-center text-white bg-green-500 rounded hover:bg-green-600">⬇ Download Video</a>
                  <button onClick={() => handleDeleteVideo(video._id)} className="block w-full py-2 text-white bg-red-500 rounded hover:bg-red-600">🗑️ Delete Video</button>
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
