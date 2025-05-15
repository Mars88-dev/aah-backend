import React, { useState } from "react";
import { Routes, Route } from "react-router-dom";
import LoginPage from "./LoginPage";
import RegisterPage from "./RegisterPage";
import Dashboard from "./pages/Dashboard";
import AddListing from "./pages/AddListing";
import EditListing from "./pages/EditListing";
import AddVideo from "./pages/AddVideo";
import DescriptionGenerator from "./pages/DescriptionGenerator";
import ImageGenerator from "./pages/ImageGenerator";

function App() {
  const [darkMode, setDarkMode] = useState(false);

  return (
    <div className={darkMode ? "dark" : ""}>
      <div className="min-h-screen text-white transition duration-300 bg-black">
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/add-listing" element={<AddListing />} />
          <Route path="/edit-listing/:id" element={<EditListing />} />
          <Route path="/add-video" element={<AddVideo />} />
          <Route path="/description-generator" element={<DescriptionGenerator />} />
          <Route path="/image-generator" element={<ImageGenerator />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
