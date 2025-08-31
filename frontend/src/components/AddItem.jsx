import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { BACKEND_BASE_URL } from "../utils/api";

function AddItem() {
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    count: "",
    image: null,
  });

  // Predefined categories from item model
  const categories = [
    'Electronics',
    'Fashion',
    'Home',
    'Sports',
    'Books',
    'Beauty',
    'Toys',
    'Health'
  ];

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image") {
      setForm({ ...form, image: files[0] });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");
    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("description", form.description);
      formData.append("price", form.price);
      formData.append("category", form.category);
      formData.append("count", form.count);
      if (form.image) formData.append("image", form.image);

      const res = await fetch(`${BACKEND_BASE_URL}/api/item/create`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to add item");
      } else {
        setMessage("Item added successfully!");
        setForm({ name: "", description: "", price: "", category: "", count: "", image: null });
        // setTimeout(() => navigate("/my-listed-items"), 1500);
      }
    } catch (err) {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-r from-black via-blue-950 to-cyan-700 min-h-screen">
      <div className="text-white container mx-auto">
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-[80vh]">
          <form
            onSubmit={handleSubmit}
            className="bg-black bg-opacity-60 p-8 rounded-lg shadow-lg w-full max-w-md"
            encType="multipart/form-data"
          >
            <h2 className="text-2xl font-bold text-cyan-400 mb-6 text-center">
              Add New Item
            </h2>
            <div className="space-y-4">
              <div className="relative">
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="peer w-full px-4 py-2 rounded bg-gray-900 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400 placeholder-transparent"
                  required
                  placeholder=" "
                />
                <label className={`absolute left-4 transition-all duration-200 pointer-events-none ${form.name ? "-top-4 text-xs bg-black text-gray-400 px-1" : "top-2 text-base text-gray-400"} peer-focus:-top-4 peer-focus:text-xs peer-focus:bg-black peer-focus:px-1`}>
                  Name
                </label>
              </div>
              <div className="relative">
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  className="peer w-full px-4 py-2 rounded bg-gray-900 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400 placeholder-transparent resize-none"
                  required
                  placeholder=" "
                  rows={3}
                />
                <label className={`absolute left-4 transition-all duration-200 pointer-events-none ${form.description ? "-top-4 text-xs bg-black text-gray-400 px-1" : "top-2 text-base text-gray-400"} peer-focus:-top-4 peer-focus:text-xs peer-focus:bg-black peer-focus:px-1`}>
                  Description
                </label>
              </div>
              <div className="relative">
                <input
                  type="number"
                  name="price"
                  value={form.price}
                  onChange={handleChange}
                  className="peer w-full px-4 py-2 rounded bg-gray-900 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400 placeholder-transparent"
                  required
                  min="0"
                  step="0.01"
                  placeholder=" "
                />
                <label className={`absolute left-4 transition-all duration-200 pointer-events-none ${form.price ? "-top-4 text-xs bg-black text-gray-400 px-1" : "top-2 text-base text-gray-400"} peer-focus:-top-4 peer-focus:text-xs peer-focus:bg-black peer-focus:px-1`}>
                  Price
                </label>
              </div>
              <div className="relative">
                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  className="peer w-full px-4 py-2 rounded bg-gray-900 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
                <label className="absolute left-4 -top-4 text-xs bg-black text-gray-400 px-1">
                  Category
                </label>
              </div>
              <div className="relative">
                <input
                  type="number"
                  name="count"
                  value={form.count}
                  onChange={handleChange}
                  className="peer w-full px-4 py-2 rounded bg-gray-900 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400 placeholder-transparent"
                  required
                  min="0"
                  placeholder=" "
                />
                <label className={`absolute left-4 transition-all duration-200 pointer-events-none ${form.count ? "-top-4 text-xs bg-black text-gray-400 px-1" : "top-2 text-base text-gray-400"} peer-focus:-top-4 peer-focus:text-xs peer-focus:bg-black peer-focus:px-1`}>
                  Stock Count
                </label>
              </div>
              <div className="relative">
                <input
                  type="file"
                  name="image"
                  accept="image/png, image/jpeg, image/jpg"
                  onChange={handleChange}
                  className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-cyan-400 file:text-black hover:file:bg-cyan-300"
                  required
                />
                <label className="absolute left-4 -top-4 text-xs bg-black text-gray-400 px-1">
                  Image
                </label>
              </div>
              {error && <div className="text-red-400 text-center">{error}</div>}
              {message && <div className="text-cyan-400 text-center">{message}</div>}
              <div className="relative">
                <button
                  type="submit"
                  className="w-full py-2 bg-cyan-400 text-black font-bold rounded hover:bg-cyan-300 transition cursor-pointer disabled:opacity-60"
                  disabled={loading}
                >
                  {loading ? "Adding..." : "Add Item"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default AddItem;
