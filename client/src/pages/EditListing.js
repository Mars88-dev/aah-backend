import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const EditListing = () => {
  const { id } = useParams();
  const navigate = useNavigate();
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
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`https://aah-backend.onrender.com/api/listings/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Safety: some APIs might return { listing: {...} }, others directly {...}
        const listingData = res.data.listing || res.data;
        setForm(listingData);
      } catch (err) {
        console.error("Error fetching listing:", err);
        setMessage("❌ Failed to load listing.");
      }
    };
    fetchListing();
  }, [id]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios.put(`https://aah-backend.onrender.com/api/listings/${id}`, form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      navigate("/dashboard");
    } catch (err) {
      console.error("Error updating listing:", err);
      setMessage("❌ Failed to update listing.");
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
        className="relative z-10 w-full max-w-lg p-8 text-white shadow-xl bg-gradient-to-tr from-slate-800 to-slate-700 rounded-2xl"
      >
        <h2 className="mb-6 text-3xl font-bold text-center text-cyan-300">Edit Listing</h2>

        {["title", "price", "location", "bedrooms", "bathrooms"].map((field) => (
          <input
            key={field}
            type="text"
            name={field}
            value={form[field]}
            onChange={handleChange}
            placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
            className="w-full px-4 py-3 mb-4 text-white placeholder-gray-400 border bg-slate-900 border-slate-600 rounded-xl focus:outline-none"
          />
        ))}

        <select
          name="garageOrParking"
          value={form.garageOrParking}
          onChange={handleChange}
          className="w-full px-4 py-3 mb-4 text-white border bg-slate-900 border-slate-600 rounded-xl"
        >
          <option value="">Garage / Parking</option>
          <option value="Garage">Garage</option>
          <option value="Parking">Parking</option>
        </select>

        <select
          name="loungeOrFlatlet"
          value={form.loungeOrFlatlet}
          onChange={handleChange}
          className="w-full px-4 py-3 mb-4 text-white border bg-slate-900 border-slate-600 rounded-xl"
        >
          <option value="">Lounge / Flatlet</option>
          <option value="Lounge">Lounge</option>
          <option value="Flatlet">Flatlet</option>
        </select>

        <select
          name="kitchenOrSolar"
          value={form.kitchenOrSolar}
          onChange={handleChange}
          className="w-full px-4 py-3 mb-4 text-white border bg-slate-900 border-slate-600 rounded-xl"
        >
          <option value="">Kitchen / Solar</option>
          <option value="Kitchen">Kitchen</option>
          <option value="Solar">Solar</option>
        </select>

        <select
          name="gardenPoolView"
          value={form.gardenPoolView}
          onChange={handleChange}
          className="w-full px-4 py-3 mb-4 text-white border bg-slate-900 border-slate-600 rounded-xl"
        >
          <option value="">Garden / Pool / View</option>
          <option value="Garden">Garden</option>
          <option value="Pool">Pool</option>
          <option value="View">View</option>
        </select>

        <select
          name="template"
          value={form.template}
          onChange={handleChange}
          className="w-full px-4 py-3 mb-6 text-white border bg-slate-900 border-slate-600 rounded-xl"
        >
          <option value="">Agent Template</option>
          <option value="paula.png">Paula</option>
          <option value="mignon.png">Mignon</option>
          <option value="richard.png">Richard</option>
          <option value="jlee.png">Juan-Lee</option>
          <option value="cidreck.png">Cidreck</option>
          <option value="victoria.png">Victoria</option>
        </select>

        <button
          type="submit"
          className="w-full py-3 font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700"
        >
          Update Listing
        </button>

        {message && <p className="mt-4 text-center text-red-400">{message}</p>}
      </form>
    </div>
  );
};

export default EditListing;
