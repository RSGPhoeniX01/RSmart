import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import logo from "../logo/RSmart.png";
import { FaHeart, FaShoppingCart, FaMicrophone } from "react-icons/fa";
import { createVoiceAssistant } from "../utils/voiceAssistant";

function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const [listening, setListening] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/user/me", {
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          setIsLoggedIn(true);
          setUserData(data.user);
          if (!data.user.isSeller) fetchCartCount();
        } else {
          setIsLoggedIn(false);
          setUserData(null);
        }
      } catch {
        setIsLoggedIn(false);
        setUserData(null);
      }
    };

    const fetchCartCount = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/cart", {
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          setCartCount(data.cart?.items?.length || 0);
        }
      } catch {}
    };

    fetchUserData();
    const handleStorageChange = () => fetchUserData();
    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("cartUpdated", fetchCartCount);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("cartUpdated", fetchCartCount);
    };
  }, [location.pathname]);

  // Voice Assistant
  const voiceAssistant = createVoiceAssistant({
  navigate,
  setListening,
  userToken: null, // pass token if needed
});

  // const handleMicClick = () => voiceAssistant.start();
  const handleMicClick = () => voiceAssistant.start(); // changed from startListening()

  const handleProfileClick = () => navigate("/profile");
  const isHomePage = location.pathname === "/";
  const isAuthPage = ["/login", "/signup"].includes(location.pathname);

  return (
    <header className="flex items-center justify-between py-4">
      <Link to="/" className="flex items-center gap-1">
        <img src={logo} alt="RSmart Logo" className="h-15 w-20" />
      </Link>
      <div className="flex items-center gap-4">
        {isAuthPage ? (
          <Link
            to="/"
            className="text-white px-4 py-2 border border-white rounded-lg font-semibold hover:bg-black hover:text-cyan-400"
          >
            Home
          </Link>
        ) : (
          <>
            {isLoggedIn && userData && !userData.isSeller && (
              <>
                <Link
                  to="/wishlist"
                  className="text-white p-2 rounded-full hover:bg-white/10 hover:text-cyan-400"
                >
                  <FaHeart size={24} />
                </Link>
                <Link
                  to="/cart"
                  className="relative text-white p-2 rounded-full hover:bg-white/10 hover:text-cyan-400"
                >
                  <FaShoppingCart size={24} />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                </Link>
                <button
                  onClick={handleMicClick}
                  className={`text-white p-2 rounded-full hover:bg-white/10 hover:text-cyan-400 ${
                    listening ? "animate-pulse text-cyan-400" : ""
                  }`}
                  title="Start Voice Command"
                >
                  <FaMicrophone size={24} />
                </button>
              </>
            )}
            <div>
              {isLoggedIn && userData ? (
                isHomePage ? (
                  <button
                    onClick={handleProfileClick}
                    className="text-white px-4 py-2 border border-white rounded-lg font-semibold hover:bg-black hover:text-cyan-400"
                  >
                    Profile
                  </button>
                ) : (
                  <Link
                    to="/"
                    className="text-white px-4 py-2 border border-white rounded-lg font-semibold hover:bg-black hover:text-cyan-400"
                  >
                    Home
                  </Link>
                )
              ) : (
                isHomePage && !isAuthPage && (
                  <Link
                    to="/login"
                    className="text-white px-4 py-2 border border-white rounded-lg font-semibold hover:bg-black hover:text-cyan-400"
                  >
                    Login / Register
                  </Link>
                )
              )}
            </div>
          </>
        )}
      </div>
    </header>
  );
}

export default Navbar;
