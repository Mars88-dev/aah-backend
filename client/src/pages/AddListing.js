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

    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();

      Object.entries(form).forEach(([key, value]) => {
        formData.append(key, value);
      });

      if (image) formData.append("coverImage", image);

      const res = await axios.post("https://aah-backend.onrender.com/api/listings", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      if (res.status === 201) {
        navigate("/dashboard");
      }
    } catch (err) {
      console.error("Error saving listing:", err);
      setMessage("❌ Failed to save listing.");
    }
  };

  return (
    <div className="max-w-xl p-8 mx-auto text-white">
      <h1 className="mb-6 text-3xl font-bold">Add New Listing</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        {["title", "price", "location", "bedrooms", "bathrooms"].map((field) => (
          <input
            key={field}
            type="text"
            name={field}
            value={form[field]}
            onChange={handleChange}
            placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
            className="w-full px-4 py-2 rounded bg-slate-800"
          />
        ))}

        <select name="garageOrParking" onChange={handleChange} className="w-full px-4 py-2 rounded bg-slate-800">
          <option value="">Garage / Parking</option>
          <option value="Garage">Garage</option>
          <option value="Parking">Parking</option>
        </select>

        <select name="loungeOrFlatlet" onChange={handleChange} className="w-full px-4 py-2 rounded bg-slate-800">
          <option value="">Lounge / Flatlet</option>
          <option value="Lounge">Lounge</option>
          <option value="Flatlet">Flatlet</option>
        </select>

        <select name="kitchenOrSolar" onChange={handleChange} className="w-full px-4 py-2 rounded bg-slate-800">
          <option value="">Kitchen / Solar</option>
          <option value="Kitchen">Kitchen</option>
          <option value="Solar">Solar</option>
        </select>

        <select name="gardenPoolView" onChange={handleChange} className="w-full px-4 py-2 rounded bg-slate-800">
          <option value="">Garden / Pool / View</option>
          <option value="Garden">Garden</option>
          <option value="Pool">Pool</option>
          <option value="View">View</option>
        </select>

        <input type="file" accept="image/*" onChange={handleFileChange} className="block w-full" />

        <select name="template" onChange={handleChange} className="w-full px-4 py-2 rounded bg-slate-800">
          <option value="">Select Template</option>
          <option value="adri.png">Adri</option>
          <option value="charlene.png">Charlene</option>
          <option value="cidreck.png">Cidreck</option>
          <option value="dean.png">Dean</option>
          <option value="erika.png">Erika</option>
          <option value="florence.png">Florence</option>
          <option value="given.png">Given</option>
          <option value="griselda.png">Griselda</option>
          <option value="henry.png">Henry</option>
          <option value="ilona.png">Ilona</option>
          <option value="ilse.png">Ilse</option>
          <option value="jaco.png">Jaco</option>
          <option value="jacolien.png">Jacolien</option>
          <option value="jacques.png">Jacques</option>
          <option value="jeanette.png">Jeanette</option>
          <option value="jlee.png">Jlee</option>
          <option value="kwanele.png">Kwanele</option>
          <option value="lapo.png">Lapo</option>
          <option value="lizzy.png">Lizzy</option>
          <option value="maki.png">Maki</option>
          <option value="martha.png">Martha</option>
          <option value="mignon.png">Mignon</option>
          <option value="oupa.png">Oupa</option>
          <option value="paula.png">Paula</option>
          <option value="richard.png">Richard</option>
          <option value="rudoplh.png">Rudolph</option>
          <option value="shirley.png">Shirley</option>
          <option value="solly.png">Solly</option>
          <option value="sylvia.png">Sylvia</option>
          <option value="theuns.png">Theuns</option>
          <option value="veronika.png">Veronika</option>
          <option value="victoria.png">Victoria</option>
          <option value="wesley.png">Wesley</option>
          <option value="zach.png">Zach</option>
        </select>

        <button type="submit" className="w-full py-3 font-bold text-white bg-green-500 rounded hover:bg-green-600">
          Save Listing
        </button>

        {message && <p className="text-red-400">{message}</p>}
      </form>
    </div>
  );
};

export default AddListing;
