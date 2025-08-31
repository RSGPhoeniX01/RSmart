import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { BACKEND_BASE_URL } from "../utils/api";

function MyListedItems() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    count: ""
  });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState("");
  const [editMessage, setEditMessage] = useState("");
  const navigate = useNavigate();

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

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const res = await fetch(`${BACKEND_BASE_URL}/api/item/seller-items`, {
          credentials: "include",
        });
        
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || "Failed to fetch items");
        }

        const data = await res.json();
        setItems(data.items || []);
      } catch (err) {
        setError(err.message || "Failed to load your listed items");
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, []);

  const handleEdit = (item) => {
    setEditingItem(item);
    setEditForm({
      name: item.name,
      description: item.description,
      price: item.price.toString(),
      category: item.category,
      count: item.count.toString()
    });
    setEditError("");
    setEditMessage("");
    setShowEditModal(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    setEditError("");
    setEditMessage("");

    try {
      const res = await fetch(`http://localhost:5000/api/item/update/${editingItem._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          name: editForm.name,
          description: editForm.description,
          price: parseFloat(editForm.price),
          category: editForm.category,
          count: parseInt(editForm.count)
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update item");
      }

      setEditMessage("Item updated successfully!");
      
      // Update the item in the local state
      setItems(prevItems => 
        prevItems.map(item => 
          item._id === editingItem._id ? data.item : item
        )
      );

      // Close modal after a short delay
      setTimeout(() => {
        setShowEditModal(false);
        setEditingItem(null);
        setEditForm({ name: "", description: "", price: "", category: "", count: "" });
        setEditMessage("");
      }, 1500);

    } catch (err) {
      setEditError(err.message || "Failed to update item");
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = async (itemId) => {
    if (!window.confirm("Are you sure you want to delete this item?")) {
      return;
    }

    try {
      const res = await fetch(`${BACKEND_BASE_URL}/api/item/delete/${itemId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Failed to delete item");
      }

      // Remove the item from the list
      setItems(items.filter(item => item._id !== itemId));
    } catch (err) {
      console.error("Error deleting item:", err);
      setError("Failed to delete item");
    }
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-r from-black via-blue-950 to-cyan-700 min-h-screen">
        <div className="text-white container mx-auto">
          <Navbar />
          <div className="flex justify-center items-center min-h-[80vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-400"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-black via-blue-950 to-cyan-700 min-h-screen flex flex-col">
      <div className="text-white container mx-auto flex-1">
        <Navbar />
        <div className="py-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-cyan-400">My Listed Items</h1>
            <button
              onClick={() => navigate("/additem")}
              className="bg-transparent text-white px-6 py-2 border border-white rounded-lg font-semibold transition duration-300
              hover:bg-black hover:cursor-pointer hover:text-cyan-400 hover:shadow-[0_0_10px_2px_rgba(34,211,238,0.7)]"
            >
              Add New Item
            </button>
          </div>

          {error && (
            <div className="bg-red-900 bg-opacity-30 border border-red-400 text-red-400 p-4 rounded-lg mb-6">
              {error}
            </div>
          )}

          {items.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg mb-4">No items listed yet</p>
              <button
                onClick={() => navigate("/additem")}
                className="bg-transparent text-white px-6 py-2 border border-white rounded-lg font-semibold transition duration-300
                hover:bg-black hover:cursor-pointer hover:text-cyan-400 hover:shadow-[0_0_10px_2px_rgba(34,211,238,0.7)]"
              >
                Add Your First Item
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map((item) => (
                <div key={item._id} className="bg-black bg-opacity-60 rounded-lg p-6 border border-gray-700 hover:border-cyan-400 transition">
                  <img
                    src={item.image.url}
                    alt={item.name}
                    className="w-full h-48 object-cover rounded-lg mb-4"
                  />
                  <h3 className="text-xl font-semibold text-cyan-400 mb-2">{item.name}</h3>
                  <p className="text-gray-300 mb-2 line-clamp-2">{item.description}</p>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-lg font-bold text-white">${item.price}</span>
                    <span className={`px-2 py-1 rounded text-sm ${
                      item.count > 0 ? 'bg-green-900 text-green-400' : 'bg-red-900 text-red-400'
                    }`}>
                      Stock: {item.count}
                    </span>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => handleEdit(item)}
                      className="flex-1 bg-transparent text-white py-2 border border-white rounded-lg font-semibold transition duration-300
                      hover:bg-black hover:cursor-pointer hover:text-blue-400 hover:shadow-[0_0_10px_2px_rgba(96,165,250,0.7)]"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(item._id)}
                      className="flex-1 bg-transparent text-white py-2 border border-white rounded-lg font-semibold transition duration-300
                      hover:bg-black hover:cursor-pointer hover:text-red-400 hover:shadow-[0_0_10px_2px_rgba(239,68,68,0.7)]"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Edit Item Modal */}
      {showEditModal && editingItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-cyan-400">Edit Item</h3>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingItem(null);
                    setEditForm({ name: "", description: "", price: "", category: "", count: "" });
                    setEditError("");
                    setEditMessage("");
                  }}
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div className="relative">
                  <input
                    type="text"
                    name="name"
                    value={editForm.name}
                    onChange={handleEditChange}
                    className="w-full px-4 py-2 rounded bg-gray-900 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
                    required
                  />
                  <label className="absolute left-4 -top-4 text-xs bg-gray-800 text-gray-400 px-1">
                    Name
                  </label>
                </div>

                <div className="relative">
                  <textarea
                    name="description"
                    value={editForm.description}
                    onChange={handleEditChange}
                    className="w-full px-4 py-2 rounded bg-gray-900 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400 resize-none"
                    required
                    rows={3}
                  />
                  <label className="absolute left-4 -top-4 text-xs bg-gray-800 text-gray-400 px-1">
                    Description
                  </label>
                </div>

                <div className="relative">
                  <input
                    type="number"
                    name="price"
                    value={editForm.price}
                    onChange={handleEditChange}
                    className="w-full px-4 py-2 rounded bg-gray-900 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
                    required
                    min="0"
                    step="0.01"
                  />
                  <label className="absolute left-4 -top-4 text-xs bg-gray-800 text-gray-400 px-1">
                    Price
                  </label>
                </div>

                <div className="relative">
                  <select
                    name="category"
                    value={editForm.category}
                    onChange={handleEditChange}
                    className="w-full px-4 py-2 rounded bg-gray-900 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                  <label className="absolute left-4 -top-4 text-xs bg-gray-800 text-gray-400 px-1">
                    Category
                  </label>
                </div>

                <div className="relative">
                  <input
                    type="number"
                    name="count"
                    value={editForm.count}
                    onChange={handleEditChange}
                    className="w-full px-4 py-2 rounded bg-gray-900 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
                    required
                    min="0"
                  />
                  <label className="absolute left-4 -top-4 text-xs bg-gray-800 text-gray-400 px-1">
                    Stock Count
                  </label>
                </div>

                {editError && (
                  <div className="text-red-400 text-center text-sm">{editError}</div>
                )}
                {editMessage && (
                  <div className="text-cyan-400 text-center text-sm">{editMessage}</div>
                )}

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      setEditingItem(null);
                      setEditForm({ name: "", description: "", price: "", category: "", count: "" });
                      setEditError("");
                      setEditMessage("");
                    }}
                    className="flex-1 bg-transparent text-white py-2 border border-white rounded-lg font-semibold transition duration-300
                    hover:bg-black hover:text-gray-400 hover:shadow-[0_0_10px_2px_rgba(156,163,175,0.7)]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={editLoading}
                    className="flex-1 bg-transparent text-white py-2 border border-white rounded-lg font-semibold transition duration-300
                    hover:bg-black hover:text-cyan-400 hover:shadow-[0_0_10px_2px_rgba(34,211,238,0.7)] disabled:opacity-50"
                  >
                    {editLoading ? "Updating..." : "Update Item"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default MyListedItems; 