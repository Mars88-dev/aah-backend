import React, { useState } from "react";
import axios from "axios";

const DescriptionGenerator = () => {
  const [form, setForm] = useState({
    heading: "",
    bedrooms: "",
    bathrooms: "",
    location: "",
    features: "",
  });
  const [description, setDescription] = useState("");
  const [copied, setCopied] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleGenerate = async () => {
    try {
      const res = await axios.post("https://aah-backend.onrender.com/api/generate-description", form);
      setDescription(res.data.description);
      setCopied(false);
    } catch (err) {
      console.error("❌ Failed to generate description:", err);
      setDescription("❌ Error generating description. Please try again.");
    }
  };

  const handleCopy = () => {
    if (description) {
      navigator.clipboard.writeText(description);
      setCopied(true);
    }
  };

  return (
    <div className="relative flex flex-col items-center min-h-screen px-4 py-10 text-white bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#0a0a23] via-[#1c1c3c] to-black overflow-hidden">
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

      <div className="relative z-10 w-full max-w-2xl p-8 text-white shadow-xl bg-gradient-to-tr from-slate-800 to-slate-700 rounded-2xl">
        <h2 className="mb-6 text-3xl font-bold text-center text-cyan-300">
          AI Property Description Generator
        </h2>

        <input
          type="text"
          name="heading"
          value={form.heading}
          onChange={handleChange}
          placeholder="Property Heading (e.g., Modern Family Home in Pretoria)"
          className="w-full px-4 py-3 mb-4 text-white placeholder-gray-300 border border-gray-600 bg-slate-700 rounded-xl focus:outline-none"
          required
        />
        <input
          type="text"
          name="bedrooms"
          value={form.bedrooms}
          onChange={handleChange}
          placeholder="Number of Bedrooms"
          className="w-full px-4 py-3 mb-4 text-white placeholder-gray-300 border border-gray-600 bg-slate-700 rounded-xl focus:outline-none"
          required
        />
        <input
          type="text"
          name="bathrooms"
          value={form.bathrooms}
          onChange={handleChange}
          placeholder="Number of Bathrooms"
          className="w-full px-4 py-3 mb-4 text-white placeholder-gray-300 border border-gray-600 bg-slate-700 rounded-xl focus:outline-none"
          required
        />
        <input
          type="text"
          name="location"
          value={form.location}
          onChange={handleChange}
          placeholder="Location (e.g., Cape Town, Durban)"
          className="w-full px-4 py-3 mb-4 text-white placeholder-gray-300 border border-gray-600 bg-slate-700 rounded-xl focus:outline-none"
          required
        />
        <textarea
          name="features"
          value={form.features}
          onChange={handleChange}
          placeholder="Key features (e.g., pool, modern kitchen, garden)"
          rows="3"
          className="w-full px-4 py-3 mb-6 text-white placeholder-gray-300 border border-gray-600 bg-slate-700 rounded-xl focus:outline-none"
          required
        ></textarea>

        <button
          onClick={handleGenerate}
          className="w-full px-6 py-3 mb-4 font-bold text-white bg-green-500 rounded-xl hover:bg-green-600"
        >
          🧠 Generate Description
        </button>

        {description && (
          <div className="p-4 mt-4 text-white border border-blue-300 bg-slate-700 rounded-xl">
            <h3 className="mb-2 text-lg font-bold text-blue-400">{form.heading}</h3>
            <p className="mb-4 whitespace-pre-line">{description}</p>
            <button
              onClick={handleCopy}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded hover:bg-blue-600"
            >
              {copied ? "📋 Copied!" : "Copy to Clipboard"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DescriptionGenerator;
