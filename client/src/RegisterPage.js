import React, { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

function RegisterPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    agency: "",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleRegister = async () => {
    try {
      const response = await axios.post("https://aah-backend.onrender.com/api/auth/register", formData);
      setMessage("🎉 Registration successful!");
      setError("");
    } catch (err) {
      console.error("❌ Registration error:", err);
      setError("❌ Registration failed. Please try again.");
      setMessage("");
    }
  };

  return (
    <div className="relative min-h-screen text-white bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#0a0a23] via-[#1c1c3c] to-black overflow-hidden flex items-center justify-center">
      {/* Star animation */}
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

      {/* Form card */}
      <div className="relative z-10 w-full max-w-md p-8 border shadow-lg rounded-2xl bg-white/10 backdrop-blur-md border-white/10">
        <h2 className="mb-6 text-3xl font-bold text-center text-cyan-300">🪐 Agent Registration</h2>

        <div className="flex flex-col gap-4">
          <input
            type="text"
            name="fullName"
            placeholder="Full Name"
            value={formData.fullName}
            onChange={handleChange}
            className="p-3 text-white placeholder-gray-400 border rounded bg-black/60 border-white/20"
          />
          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
            className="p-3 text-white placeholder-gray-400 border rounded bg-black/60 border-white/20"
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="p-3 text-white placeholder-gray-400 border rounded bg-black/60 border-white/20"
          />
          <input
            type="text"
            name="agency"
            placeholder="Agency Name"
            value={formData.agency}
            onChange={handleChange}
            className="p-3 text-white placeholder-gray-400 border rounded bg-black/60 border-white/20"
          />

          <button
            onClick={handleRegister}
            className="px-4 py-3 font-semibold text-white transition bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl hover:from-purple-700 hover:to-blue-700"
          >
            Register
          </button>

          {message && <p className="mt-2 text-green-300">{message}</p>}
          {error && <p className="mt-2 text-red-300">{error}</p>}

          <div className="mt-4 text-sm text-center text-white/70">
            Already have an account?{" "}
            <Link to="/" className="text-cyan-300 hover:underline">
              Login here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
