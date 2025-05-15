import React, { useState } from "react";
import axios from "axios";

const ListingForm = () => {
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

    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");
    if (userId) {
      formData.append("agentId", userId);
    }

    try {
      await axios.post("http://localhost:5000/api/listings", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      setMessage("✅ Listing saved successfully.");
      setForm({
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
      setImage(null);
    } catch (err) {
      console.error("Error saving listing:", err);
      setMessage("❌ Failed to save listing.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4 py-10 bg-gradient-to-br from-purple-500 via-pink-500 to-indigo-600">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-lg p-8 bg-white shadow-2xl rounded-2xl"
      >
        <h2 className="mb-6 text-3xl font-bold text-center text-gray-800">
          Add New Listing
        </h2>

        {["title", "price", "location", "bedrooms", "bathrooms"].map((field) => (
          <input
            key={field}
            type="text"
            name={field}
            value={form[field]}
            onChange={handleChange}
            placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
            className="w-full px-4 py-3 mb-4 text-gray-800 placeholder-gray-500 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        ))}

        {/* Dropdown Fields */}
        <label className="block mb-1 font-medium text-gray-700">Garage / Parking</label>
        <select
          name="garageOrParking"
          value={form.garageOrParking}
          onChange={handleChange}
          className="w-full px-4 py-3 mb-4 border border-gray-300 rounded-xl"
        >
          <option value="">Select</option>
          <option value="Garage">Garage</option>
          <option value="Parking">Parking</option>
        </select>

        <label className="block mb-1 font-medium text-gray-700">Lounge / Flatlet</label>
        <select
          name="loungeOrFlatlet"
          value={form.loungeOrFlatlet}
          onChange={handleChange}
          className="w-full px-4 py-3 mb-4 border border-gray-300 rounded-xl"
        >
          <option value="">Select</option>
          <option value="Lounge">Lounge</option>
          <option value="Flatlet">Flatlet</option>
        </select>

        <label className="block mb-1 font-medium text-gray-700">Kitchen / Solar</label>
        <select
          name="kitchenOrSolar"
          value={form.kitchenOrSolar}
          onChange={handleChange}
          className="w-full px-4 py-3 mb-4 border border-gray-300 rounded-xl"
        >
          <option value="">Select</option>
          <option value="Kitchen">Kitchen</option>
          <option value="Solar">Solar</option>
        </select>

        <label className="block mb-1 font-medium text-gray-700">Garden / Pool / View</label>
        <select
          name="gardenPoolView"
          value={form.gardenPoolView}
          onChange={handleChange}
          className="w-full px-4 py-3 mb-4 border border-gray-300 rounded-xl"
        >
          <option value="">Select</option>
          <option value="Garden">Garden</option>
          <option value="Pool">Pool</option>
          <option value="View">View</option>
        </select>

        {/* Image Upload */}
        <label className="block mb-2 font-medium text-gray-700">Cover Image</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="w-full px-4 py-2 mb-4 text-gray-700 bg-white border border-gray-300 cursor-pointer rounded-xl"
        />

        {/* Template Select */}
        <label className="block mb-2 font-medium text-gray-700">Select Template</label>
        <select
          name="template"
          value={form.template}
          onChange={handleChange}
          required
          className="w-full px-4 py-3 mb-6 text-gray-800 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400"
        >
          <option value="" disabled>Choose an Agent Template</option>
          <option value="paula.png">Paula</option>
          <option value="mignon.png">Mignon</option>
          <option value="richard.png">Richard</option>
          <option value="jlee.png">Juan-Lee</option>
          <option value="cidreck.png">Cidreck</option>
          <option value="victoria.png">Victoria</option>
        </select>

        {/* Submit */}
        <button
          type="submit"
          className="w-full px-6 py-3 font-bold text-white transition duration-200 bg-green-500 rounded-xl hover:bg-green-600"
        >
          Save Listing
        </button>

        {message && (
          <p className="mt-4 font-medium text-center text-red-600">{message}</p>
        )}
      </form>
    </div>
  );
};

export default ListingForm;
