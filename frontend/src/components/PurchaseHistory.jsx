import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import PurchaseDetailModal from "./PurchaseDetailModal";
import { BACKEND_BASE_URL } from "../utils/api";

function PurchaseHistory() {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [selectedPurchase, setSelectedPurchase] = useState(null);

  useEffect(() => {
    const fetchPurchases = async () => {
      try {
        const res = await fetch(`${BACKEND_BASE_URL}/api/user/purchases`, {
          credentials: "include",
        });
        if (!res.ok) throw new Error("Failed to fetch purchases");
        const data = await res.json();
        setPurchases(data.purchases || []);
      } catch (err) {
        console.error("Error fetching purchases:", err);
        setError("Failed to load your purchase history");
      } finally {
        setLoading(false);
      }
    };
    fetchPurchases();
  }, []);
  
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
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
            <h1 className="text-3xl font-bold text-cyan-400">Purchase History</h1>
            <button
              onClick={() => navigate("/")}
              className="bg-cyan-400 hover:cursor-pointer text-black px-6 py-2 rounded-lg font-semibold hover:bg-cyan-300 transition"
            >
              Continue Shopping
            </button>
          </div>

          {error && <div className="text-red-400 p-4">{error}</div>}

          {purchases.length === 0 && !loading ? (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg mb-4">No purchases yet</p>
              <button
                onClick={() => navigate("/")}
                className="bg-cyan-400 text-black px-6 py-2 rounded-lg font-semibold hover:bg-cyan-300 transition"
              >
                Start Shopping
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {purchases
                .filter(purchase => purchase.itemId)
                .map((purchase) => (
                <div 
                    key={purchase._id} 
                    className="bg-black bg-opacity-60 rounded-lg p-4 flex items-center justify-between hover:border-cyan-400 border-2 border-transparent transition cursor-pointer" 
                    onClick={() => setSelectedPurchase(purchase)}
                >
                  <div className="flex items-center gap-4">
                    <img src={purchase.itemId.image.url} alt={purchase.itemId.name} className="w-16 h-16 object-cover rounded-md"/>
                    <div>
                      <h3 className="text-lg font-semibold text-cyan-300">{purchase.itemId.name}</h3>
                      <p className="text-sm text-gray-400">Purchased on {formatDate(purchase.date)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">₹{purchase.totalPrice.toFixed(2)}</p>
                    <p className="text-sm text-gray-400">View Details &rarr;</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
      <PurchaseDetailModal 
        purchase={selectedPurchase}
        onClose={() => setSelectedPurchase(null)}
      />
    </div>
  );
}

export default PurchaseHistory; 