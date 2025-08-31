import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { FaTrash, FaShoppingCart } from "react-icons/fa";
import { BACKEND_BASE_URL } from "../utils/api";

function Wishlist() {
    const [wishlist, setWishlist] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const fetchWishlist = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${BACKEND_BASE_URL}/api/user/wishlist`, { credentials: 'include' });
            if (res.ok) {
                const data = await res.json();
                setWishlist(data.wishlist);
            } else {
                throw new Error('Failed to fetch wishlist');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWishlist();
    }, []);

    const handleRemove = async (itemId) => {
        try {
            await fetch(`${BACKEND_BASE_URL}/api/user/wishlist/toggle`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ itemId }),
            });
            setWishlist(wishlist.filter(item => item._id !== itemId));
        } catch (err) {
            console.error("Error removing from wishlist:", err);
        }
    };

    const handleMoveToCart = async (itemId) => {
        try {
            await fetch(`${BACKEND_BASE_URL}/api/cart/add`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ itemId, quantity: 1 }),
            });
            // After moving to cart, remove from wishlist
            handleRemove(itemId);
        } catch (err) {
            console.error("Error moving to cart:", err);
        }
    };

    return (
        <div className="bg-gradient-to-r from-black via-blue-950 to-cyan-700 min-h-screen flex flex-col">
            <div className="container mx-auto px-4 text-white flex-grow">
                <Navbar />
                <h1 className="text-3xl font-bold text-cyan-400 my-8">My Wishlist</h1>
                {loading && <p className="text-center">Loading your wishlist...</p>}
                {error && <p className="text-center text-red-500">{error}</p>}
                {!loading && !error && wishlist.length === 0 && (
                    <div className="text-center py-20">
                        <p className="text-xl text-gray-400">Your wishlist is empty.</p>
                        <button 
                            onClick={() => navigate('/')} 
                            className="mt-6 bg-transparent text-white px-6 py-2 border border-white rounded-lg font-semibold transition duration-300
                            hover:bg-black hover:cursor-pointer hover:text-cyan-400 hover:shadow-[0_0_10px_2px_rgba(34,211,238,0.7)]"
                        >
                            Discover Items
                        </button>
                    </div>
                )}
                {wishlist.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {wishlist.map(item => (
                            <div key={item._id} className="bg-black bg-opacity-60 rounded-lg p-4 flex flex-col justify-between transform hover:-translate-y-2 transition-transform duration-300">
                                <img src={item.image.url} alt={item.name} className="w-full h-48 object-cover rounded-t-lg" />
                                <div className="pt-4 flex-grow">
                                    <h3 className="text-lg font-semibold text-white">{item.name}</h3>
                                    <p className="text-lg text-cyan-400 font-bold my-2">₹{item.price}</p>
                                </div>
                                <div className="flex justify-between items-center mt-4">
                                    <button 
                                        onClick={() => handleMoveToCart(item._id)} 
                                        className="flex-1 bg-transparent text-white px-4 py-2 border border-white rounded-lg font-semibold transition duration-300 cursor-pointer
                                        hover:bg-black hover:text-green-400 hover:shadow-[0_0_10px_2px_rgba(74,222,128,0.7)]"
                                    >
                                        Move to Cart
                                    </button>
                                    <button 
                                        onClick={() => handleRemove(item._id)} 
                                        className="ml-2 p-3 rounded-full transition duration-300 hover:cursor-pointer group"
                                    >
                                        <FaTrash className="text-white group-hover:text-red-500 transition-colors duration-300" size={20} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <Footer />
        </div>
    );
}

export default Wishlist; 