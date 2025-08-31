import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import { FaTrash } from 'react-icons/fa';
import { BACKEND_BASE_URL } from "../utils/api";

function Cart() {
    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [quantityErrors, setQuantityErrors] = useState({});
    const navigate = useNavigate();

    const fetchCart = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${BACKEND_BASE_URL}/api/cart`, { credentials: 'include' });
            if (res.ok) {
                const data = await res.json();
                setCart(data.cart);
            } else {
                throw new Error('Failed to fetch cart');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCart();
    }, []);

    const handleUpdateQuantity = async (itemId, newValue) => {
        const newErrors = { ...quantityErrors };
        delete newErrors[itemId]; // Clear previous error for this item

        if (newValue === '') {
            setCart(prevCart => ({
                ...prevCart,
                items: prevCart.items.map(item =>
                    item.itemId._id === itemId ? { ...item, quantity: '' } : item
                )
            }));
            setQuantityErrors(newErrors);
            return;
        }

        const quantity = Number(newValue);

        if (isNaN(quantity) || !Number.isInteger(quantity)) {
            setQuantityErrors(newErrors);
            return;
        }

        if (quantity < 1) {
            setQuantityErrors(newErrors);
            return handleRemoveItem(itemId);
        }

        const cartItem = cart.items.find(p => p.itemId._id === itemId);
        if (cartItem && quantity > cartItem.itemId.count) {
            newErrors[itemId] = `Only ${cartItem.itemId.count} in stock`;
            setCart(prevCart => ({
                ...prevCart,
                items: prevCart.items.map(item =>
                    item.itemId._id === itemId ? { ...item, quantity: cartItem.itemId.count } : item
                )
            }));
            setQuantityErrors(newErrors);
            // Still make the API call to update the backend to the max value
            newValue = cartItem.itemId.count;
        } else {
             setQuantityErrors(newErrors);
        }

        try {
            const res = await fetch(`${BACKEND_BASE_URL}/api/cart/update/${itemId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ quantity: Number(newValue) }),
            });
            const data = await res.json();
            if (res.ok) {
                setCart(data.cart);
            } else {
                alert(data.error);
                fetchCart(); // Re-sync with server on failure
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleRemoveItem = async (itemId) => {
        try {
            const res = await fetch(`${BACKEND_BASE_URL}/api/cart/remove/${itemId}`, {
                method: 'DELETE',
                credentials: 'include',
            });
             const data = await res.json();
            if (res.ok) {
                setCart(data.cart);
            } else {
                alert(data.error);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleCheckout = () => {
        navigate('/billing-address');
    };

    const subtotal = cart?.items.reduce((acc, item) => acc + item.itemId.price * (Number(item.quantity) || 0), 0) || 0;
    // const isCheckoutDisabled = Object.keys(quantityErrors).length > 0 || cart?.items.some(item => item.quantity === '' || item.quantity < 1);

    if (loading) return <div className="text-center text-white py-10">Loading Cart...</div>;

    return (
        <div className="bg-gradient-to-r from-black via-blue-950 to-cyan-700 min-h-screen flex flex-col">
            <div className="container mx-auto px-4 text-white flex-grow">
                <Navbar />
                <h1 className="text-3xl font-bold text-cyan-400 my-8">Shopping Cart</h1>
                {loading && <p className="text-center">Loading your cart...</p>}
                {error && <p className="text-center text-red-500">{error}</p>}
                
                {!loading && !error && (!cart || cart.items.length === 0) && (
                    <div className="text-center py-20">
                        <p className="text-xl text-gray-400">Your cart is empty.</p>
                        <button 
                            onClick={() => navigate('/')} 
                            className="mt-6 bg-transparent text-white px-6 py-2 border border-white rounded-lg font-semibold transition duration-300
                            hover:bg-black hover:text-cyan-400 hover:shadow-[0_0_10px_2px_rgba(34,211,238,0.7)]"
                        >
                            Continue Shopping
                        </button>
                    </div>
                )}
                
                {cart && cart.items.length > 0 && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-4">
                            {cart.items.map(({ itemId: item, quantity }) => (
                                <div key={item._id} className="bg-black bg-opacity-60 rounded-lg p-4 flex flex-col sm:flex-row items-center justify-between">
                                    <div className="flex items-center gap-4 mb-4 sm:mb-0">
                                        <img src={item.image.url} alt={item.name} className="w-24 h-24 object-cover rounded-lg"/>
                                        <div className="flex-grow">
                                            <h3 className="text-lg font-semibold text-cyan-300">{item.name}</h3>
                                            <p className="text-white">₹{item.price.toFixed(2)}</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-center">
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => handleUpdateQuantity(item._id, quantity - 1)} disabled={(quantity <= 1 && quantity !== '') || item.count === 0} className="bg-gray-700 w-8 h-8 rounded font-bold text-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed">-</button>
                                            <input
                                                type="text"
                                                inputMode="numeric"
                                                value={quantity}
                                                onChange={(e) => handleUpdateQuantity(item._id, e.target.value.replace(/[^0-9]/g, ''))}
                                                onBlur={(e) => { if (e.target.value === '') handleUpdateQuantity(item._id, 1); }}
                                                className={`w-16 bg-gray-800 text-white text-center rounded h-8 focus:outline-none focus:ring-2 ${quantityErrors[item._id] ? 'ring-red-500' : 'ring-cyan-400'}`}
                                            />
                                            <button onClick={() => handleUpdateQuantity(item._id, (Number(quantity) || 0) + 1)} disabled={quantity >= item.count} className="bg-gray-700 w-8 h-8 rounded font-bold text-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed">+</button>
                                            <button onClick={() => handleRemoveItem(item._id)} className="ml-2 p-3 rounded-full transition duration-300 hover:cursor-pointer group">
                                                <FaTrash size={20} className="text-white group-hover:text-red-500 transition-colors duration-300" />
                                            </button>
                                        </div>
                                        {quantityErrors[item._id] && <p className="text-red-400 text-xs mt-1">{quantityErrors[item._id]}</p>}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="lg:col-span-1 bg-black bg-opacity-60 rounded-lg p-6 h-fit">
                            <h2 className="text-2xl font-semibold mb-6 border-b border-gray-700 pb-4">Order Summary</h2>
                            <div className="space-y-4 mb-6">
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Subtotal</span>
                                    <span>₹{subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between font-bold text-xl pt-4 border-t border-gray-700">
                                    <span>Total</span>
                                    <span>₹{subtotal.toFixed(2)}</span>
                                </div>
                            </div>
                            <button 
                                onClick={handleCheckout} 
                                className="w-full bg-transparent text-white px-4 py-3 border border-white rounded-lg font-semibold transition duration-300 cursor-pointer
                                hover:bg-black hover:text-cyan-400 hover:shadow-[0_0_10px_2px_rgba(34,211,238,0.7)]"
                            >
                                Proceed to Checkout
                            </button>
                        </div>
                    </div>
                )}
            </div>
            <Footer />
        </div>
    );
}

export default Cart; 