import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const AddListing = () => {
  const [form, setForm] = useState({
    title: "",
    price: "",
    location: "",
    bedrooms: "",
    bathrooms: "",
    garageOrParking: "",
    loungeOrFlatlet: "",
    kitchenOrSolar: "",
    gardenPoolView: "",
    template: "",
  });
  const [image, setImage] = useState(null);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      formData.append(key, value);
    });
    if (image) formData.append("coverImage", image);

    try {
      const token = localStorage.getItem("token");
      await axios.post("https://aah-backend.onrender.com/api/listings", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      navigate("/dashboard");
    } catch (err) {
      console.error("Error saving listing:", err);
      setMessage("❌ Failed to save listing.");
    }
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen px-4 py-10 text-white bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#0a0a23] via-[#1c1c3c] to-black overflow-hidden">
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
        className="relative z-10 w-full max-w-lg p-8 shadow-xl bg-gradient-to-tr from-slate-800 to-slate-700 rounded-2xl"
      >
        <h2 className="mb-6 text-3xl font-bold text-center text-cyan-300">Add New Listing</h2>

        {["title", "price", "location", "bedrooms", "bathrooms"].map((field) => (
          <input
            key={field}
            type="text"
            name={field}
            value={form[field]}
            onChange={handleChange}
            placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
            className="w-full px-4 py-3 mb-4 text-white placeholder-gray-300 border border-gray-600 bg-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-400"
          />
        ))}

        {/* Proper dropdowns */}
        <label className="block mb-1 font-medium text-white">Garage / Parking</label>
        <select
          name="garageOrParking"
          value={form.garageOrParking}
          onChange={handleChange}
          className="w-full px-4 py-3 mb-4 text-white border border-gray-600 bg-slate-800 rounded-xl"
        >
          <option value="">Select</option>
          <option value="Garage">Garage</option>
          <option value="Parking">Parking</option>
        </select>

        <label className="block mb-1 font-medium text-white">Lounge / Flatlet</label>
        <select
          name="loungeOrFlatlet"
          value={form.loungeOrFlatlet}
          onChange={handleChange}
          className="w-full px-4 py-3 mb-4 text-white border border-gray-600 bg-slate-800 rounded-xl"
        >
          <option value="">Select</option>
          <option value="Lounge">Lounge</option>
          <option value="Flatlet">Flatlet</option>
        </select>

        <label className="block mb-1 font-medium text-white">Kitchen / Solar</label>
        <select
          name="kitchenOrSolar"
          value={form.kitchenOrSolar}
          onChange={handleChange}
          className="w-full px-4 py-3 mb-4 text-white border border-gray-600 bg-slate-800 rounded-xl"
        >
          <option value="">Select</option>
          <option value="Kitchen">Kitchen</option>
          <option value="Solar">Solar</option>
        </select>

        <label className="block mb-1 font-medium text-white">Garden / Pool / View</label>
        <select
          name="gardenPoolView"
          value={form.gardenPoolView}
          onChange={handleChange}
          className="w-full px-4 py-3 mb-4 text-white border border-gray-600 bg-slate-800 rounded-xl"
        >
          <option value="">Select</option>
          <option value="Garden">Garden</option>
          <option value="Pool">Pool</option>
          <option value="View">View</option>
        </select>

        <label className="block mb-2 font-medium text-white">Cover Image</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="w-full px-4 py-2 mb-4 text-white border border-gray-600 cursor-pointer bg-slate-800 rounded-xl"
        />

        <label className="block mb-2 font-medium text-white">Select Template</label>
        <select
          name="template"
          value={form.template}
          onChange={handleChange}
          required
          className="w-full px-4 py-3 mb-6 text-white border border-gray-600 bg-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-400"
        >
          <option value="" disabled>Choose an Agent Template</option>
          <option value="paula.png">Paula</option>
          <option value="jaco.png">Jaco</option>
          <option value="richard.png">Richard</option>
          <option value="jlee.png">Juan-Lee</option>
          <option value="cidreck.png">Cidreck</option>
          <option value="victoria.png">Victoria</option>
        </select>

        <button
          type="submit"
          className="w-full px-6 py-3 font-bold text-white transition duration-200 bg-green-500 rounded-xl hover:bg-green-600"
        >
          Save Listing
        </button>

        {message && (
          <p className="mt-4 font-medium text-center text-red-400">{message}</p>
        )}
      </form>
    </div>
  );
};

export default AddListing;
