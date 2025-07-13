import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import logo from "../logo/RSmart.png";
import { FaHeart, FaShoppingCart, FaMicrophone, FaMicrophoneSlash } from "react-icons/fa";
import { createVoiceAssistant } from "../utils/voiceAssistant";

function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const [listening, setListening] = useState(false);
  const [spokenText, setSpokenText] = useState(""); // State to hold the spoken text
  const location = useLocation();
  const navigate = useNavigate();

  // Using useRef to store the voiceAssistant instance across renders
  const voiceAssistantRef = useRef(null);

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

  // Initialize voice assistant once and store in ref
  useEffect(() => {
    voiceAssistantRef.current = createVoiceAssistant({
      navigate,
      setListening,
      setSpokenText,
      userToken: userData?.token,
    });
  }, [navigate, userData?.token, setSpokenText]);

  const handleMicClick = () => {
    if (voiceAssistantRef.current) {
      if (listening) {
        voiceAssistantRef.current.stop();
      } else {
        voiceAssistantRef.current.start();
      }
    }
  };

  useEffect(() => {
    // Clear spoken text when listening stops
    if (!listening) {
      setSpokenText("");
    }
  }, [listening]);

  const handleProfileClick = () => navigate("/profile");
  const isHomePage = location.pathname === "/";
  const isAuthPage = ["/login", "/signup"].includes(location.pathname);

  return (
    <header className="flex items-center justify-between py-4">
      {/* Left section: Logo, Cart, and Wishlist */}
      <div className="flex items-center gap-4">
        <Link to="/" className="flex items-center gap-1">
          <img src={logo} alt="RSmart Logo" className="h-15 w-20" />
        </Link>
        {isLoggedIn && userData && !userData.isSeller && (
          <>
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
            <Link
              to="/wishlist"
              className="text-white p-2 rounded-full hover:bg-white/10 hover:text-cyan-400"
            >
              <FaHeart size={24} />
            </Link>
          </>
        )}
      </div>

      {/* Right section: Spoken text area, Microphone, and Login/Profile/Home */}
      <div className="flex items-center gap-4">
        {isLoggedIn && userData && !userData.isSeller && (
          // Group for text area and microphone button
          <div className="flex items-center gap-3">
            <textarea
              value={spokenText}
              readOnly
              placeholder={listening ? "Speak now..." : "Voice command input"}
              className={`w-80 h-12 p-2 text-white bg-gray-700 border border-gray-600 rounded-lg resize-none focus:outline-none ${
                listening ? "border-cyan-400" : ""
              }`}
            />
            <button
              onClick={handleMicClick}
              className={`text-white p-2 rounded-full hover:bg-white/10 hover:text-cyan-400 ${
                listening ? "animate-pulse text-cyan-400" : ""
              }`}
              title={listening ? "Stop Voice Command" : "Start Voice Command"}
            >
              {listening ? <FaMicrophone size={24} /> : <FaMicrophoneSlash size={24} />}
            </button>
          </div>
        )}

        {isAuthPage ? (
          <Link
            to="/"
            className="text-white px-4 py-2 border border-white rounded-lg font-semibold hover:bg-black hover:text-cyan-400"
          >
            Home
          </Link>
        ) : (
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
              isHomePage &&
              !isAuthPage && (
                <Link
                  to="/login"
                  className="text-white px-4 py-2 border border-white rounded-lg font-semibold hover:bg-black hover:text-cyan-400"
                >
                  Login / Register
                </Link>
              )
            )}
          </div>
        )}
      </div>
    </header>
  );
}

export default Navbar;