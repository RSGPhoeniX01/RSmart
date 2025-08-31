import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import { BACKEND_BASE_URL } from "../utils/api";

const loadScript = (src) => {
    return new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
};

function BillingAddress() {
    const [formData, setFormData] = useState({
        fullName: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'India',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const loadRazorpay = async () => {
            const res = await loadScript('https://checkout.razorpay.com/v1/checkout.js');
            if (!res) {
                setError('Razorpay SDK failed to load. Are you online?');
            }
        };
        loadRazorpay();
    }, []);
    
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        for (const key in formData) {
            if (!formData[key]) {
                setError(`Please fill out the ${key.replace(/([A-Z])/g, ' $1').toLowerCase()} field.`);
                setLoading(false);
                return;
            }
        }
        
        try {
            const orderRes = await fetch(`${BACKEND_BASE_URL}/api/payment/create-order`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
            });
            const orderData = await orderRes.json();
            if (!orderRes.ok) throw new Error(orderData.error || 'Failed to create order');

            const { order } = orderData;

            const keyRes = await fetch(`${BACKEND_BASE_URL}/api/payment/get-key`, { credentials: 'include' });
            const { key } = await keyRes.json();
            
            const userRes = await fetch(`${BACKEND_BASE_URL}/api/user/me`, { credentials: 'include' });
            const userData = userRes.ok ? (await userRes.json()).user : {};

            const options = {
                key,
                amount: order.amount,
                currency: order.currency,
                name: 'RSmart',
                description: 'Purchase Transaction',
                order_id: order.id,
                handler: async function (response) {
                    setLoading(true);
                    const verifyRes = await fetch(`${BACKEND_BASE_URL}/api/payment/verify-payment`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        credentials: 'include',
                        body: JSON.stringify({
                            ...response,
                            shippingAddress: formData,
                        }),
                    });

                    const verifyData = await verifyRes.json();
                    if (verifyRes.ok) {
                        alert('Purchase successful!');
                        navigate('/purchase-history');
                    } else {
                        throw new Error(verifyData.error || 'Payment verification failed');
                    }
                },
                prefill: {
                    name: userData.lastName ? `${userData.firstName} ${userData.lastName}` : userData.firstName,
                    email: userData.email,
                    contact: userData.mobile,
                },
                notes: {
                    address: `${formData.address}, ${formData.city}, ${formData.state}, ${formData.zipCode}`,
                },
                theme: {
                    color: '#0891b2', // a shade of cyan
                },
            };

            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', (response) => {
                setError(`Payment failed: ${response.error.description}`);
                console.error(response.error);
            });
            rzp.open();
            
        } catch (err) {
            setError(err.message);
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-gradient-to-r from-black via-blue-950 to-cyan-700 min-h-screen flex flex-col">
            <div className="container mx-auto px-4 text-white flex-grow">
                <Navbar />
                <div className="flex items-center justify-center py-8">
                    <div className="bg-black bg-opacity-60 p-8 rounded-lg shadow-lg w-full max-w-md">
                        <h1 className="text-3xl font-bold text-cyan-400 mb-8 text-center">Billing Information</h1>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <input type="text" name="fullName" placeholder="Full Name" onChange={handleChange} value={formData.fullName} className="w-full px-4 py-2 rounded bg-gray-900 focus:outline-none focus:ring-2 focus:ring-cyan-400" required />
                            <input type="text" name="address" placeholder="Street Address" onChange={handleChange} value={formData.address} className="w-full px-4 py-2 rounded bg-gray-900 focus:outline-none focus:ring-2 focus:ring-cyan-400" required />
                            <input type="text" name="city" placeholder="City" onChange={handleChange} value={formData.city} className="w-full px-4 py-2 rounded bg-gray-900 focus:outline-none focus:ring-2 focus:ring-cyan-400" required />
                            <div className="flex gap-4">
                                <input type="text" name="state" placeholder="State / Province" onChange={handleChange} value={formData.state} className="w-1/2 px-4 py-2 rounded bg-gray-900 focus:outline-none focus:ring-2 focus:ring-cyan-400" required />
                                <input type="text" name="zipCode" placeholder="ZIP / Postal Code" onChange={handleChange} value={formData.zipCode} className="w-1/2 px-4 py-2 rounded bg-gray-900 focus:outline-none focus:ring-2 focus:ring-cyan-400" required />
                            </div>
                            <select name="country" value={formData.country} onChange={handleChange} className="w-full px-4 py-2 rounded bg-gray-900 focus:outline-none focus:ring-2 focus:ring-cyan-400" required>
                                <option value="India">India</option>
                                <option value="USA">United States</option>
                                <option value="Canada">Canada</option>
                            </select>
                            
                            {error && <p className="text-red-400 text-center">{error}</p>}

                            <button type="submit" disabled={loading} className="w-full bg-transparent text-white px-4 py-3 mt-4 border border-white rounded-lg font-semibold transition duration-300
                            hover:bg-black hover:text-cyan-400 hover:shadow-[0_0_10px_2px_rgba(34,211,238,0.7)] disabled:opacity-50">
                                {loading ? 'Processing...' : 'Proceed to Payment'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}

export default BillingAddress; 