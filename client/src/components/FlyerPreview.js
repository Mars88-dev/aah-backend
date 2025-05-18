// ✅ FlyerPreview.js — auto-download + cover image fix
import React, { useEffect, useRef, useState } from "react";
import html2canvas from "html2canvas";

const FlyerPreview = ({ listing, onClose }) => {
  const flyerRef = useRef();
  const [base64Cover, setBase64Cover] = useState(null);

  useEffect(() => {
    if (listing.coverImage) {
      fetch(`https://aah-backend.onrender.com${listing.coverImage}`)
        .then((res) => res.blob())
        .then((blob) => {
          const reader = new FileReader();
          reader.onloadend = () => setBase64Cover(reader.result);
          reader.readAsDataURL(blob);
        });
    }
  }, [listing.coverImage]);

  useEffect(() => {
    const generateAndDownload = async () => {
      const flyer = flyerRef.current;
      const canvas = await html2canvas(flyer, {
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
        scale: 2,
        logging: false,
        width: flyer.offsetWidth,
        height: flyer.offsetHeight,
        windowWidth: flyer.scrollWidth,
        windowHeight: flyer.scrollHeight,
      });
      const link = document.createElement("a");
      link.download = `${listing.title}-flyer.jpg`;
      link.href = canvas.toDataURL("image/jpeg", 1.0);
      link.click();
      if (typeof onClose === "function") onClose();
    };

    if (base64Cover || !listing.coverImage) {
      generateAndDownload();
    }
  }, [base64Cover, listing.coverImage, listing.title, onClose]);

  return (
    <div style={{ display: "none" }}>
      <div ref={flyerRef} className="relative w-[1080px] h-[1080px] bg-white overflow-hidden">
        {/* Cover Image */}
        {base64Cover && (
          <img
            src={base64Cover}
            alt="Cover"
            className="absolute object-cover z-[1]"
            style={{ top: "181.2px", left: "0px", width: "1080px", height: "480.3px" }}
          />
        )}

        {/* Template */}
        <img
          src={`/templates/${listing.template || "paula.png"}`}
          alt="Template"
          className="absolute top-0 left-0 object-cover z-[2]"
          style={{ width: "100%", height: "100%" }}
        />

        {/* Title */}
        <div
          className="absolute z-[3] font-bold text-[#002060]"
          style={{ top: "597.5px", left: "3.9px", width: "464.9px", height: "64px", fontSize: "32px" }}
        >
          {listing.title || "New Listing"}
        </div>

        {/* Price */}
        <div
          className="absolute text-[#002060] font-bold z-[3] text-left"
          style={{ top: "445.7px", left: "769.6px", width: "321.7px", height: "54.1px", fontSize: "36px" }}
        >
          R {listing.price}
        </div>

        {/* Location */}
        <div
          className="absolute z-[3] font-semibold text-white"
          style={{ top: "535px", left: "270px", width: "248.5px", height: "38px", fontSize: "32px" }}
        >
          {listing.location}
        </div>

        {/* Features */}
        <div className="absolute z-[3] text-white" style={{ fontSize: "20px" }}>
          <div style={{ position: "absolute", top: "771.8px", left: "88.2px", width: "167.5px", height: "25px" }}>
            {listing.bedrooms} Bedrooms
          </div>
          <div style={{ position: "absolute", top: "846.8px", left: "88.2px", width: "167.5px", height: "25px" }}>
            {listing.bathrooms} Bathrooms
          </div>
          <div style={{ position: "absolute", top: "921.9px", left: "88.2px", width: "167.5px", height: "25px" }}>
            {listing.gardenPoolView}
          </div>
          <div style={{ position: "absolute", top: "846.8px", left: "340.7px", width: "167.5px", height: "25px" }}>
            {listing.kitchenOrSolar}
          </div>
          <div style={{ position: "absolute", top: "771.8px", left: "340.7px", width: "167.5px", height: "25px" }}>
            {listing.loungeOrFlatlet}
          </div>
          <div style={{ position: "absolute", top: "921.9px", left: "340.7px", width: "167.5px", height: "25px" }}>
            {listing.garageOrParking}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlyerPreview;
