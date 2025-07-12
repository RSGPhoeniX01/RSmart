import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import logo from "../logo/RSmart.png";
import { FaHeart, FaShoppingCart, FaMicrophone } from 'react-icons/fa';

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
      } catch (err) {
        setIsLoggedIn(false);
        setUserData(null);
      }
    };
    const fetchCartCount = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/cart", { credentials: 'include' });
        if(res.ok) {
          const data = await res.json();
          setCartCount(data.cart?.items?.length || 0);
        }
      } catch {}
    };
    fetchUserData();
    const handleStorageChange = () => fetchUserData();
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('cartUpdated', fetchCartCount);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('cartUpdated', fetchCartCount);
    };
  }, [location.pathname]);

  const handleProfileClick = () => navigate("/profile");
  const isHomePage = location.pathname === "/";
  const isAuthPage = location.pathname === "/login" || location.pathname === "/signup";

  // 🎙️ Voice Recognition
  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Your browser does not support Speech Recognition.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript.toLowerCase();
      console.log("🎤 User said:", transcript);
      handleVoiceCommand(transcript);
    };

    recognition.start();
  };

  // 🧠 Basic command handler (you can expand this later)
  const handleVoiceCommand = (text) => {
    if (text.includes("go to cart")) {
      navigate("/cart");
    } else if (text.includes("wishlist")) {
      navigate("/wishlist");
    } else if (text.includes("home")) {
      navigate("/");
    } else if (text.includes("profile")) {
      navigate("/profile");
    } else if (text.includes("add oppo a9 to cart")) {
      alert("🛒 Simulate adding Oppo A9 to cart (backend logic goes here)");
    } else {
      alert(`⚠️ Command not recognized: "${text}"`);
    }
  };

  return (
    <header className="flex items-center justify-between py-4">
      <Link to="/" className="flex items-center gap-1">
        <img src={logo} alt="RSmart Logo" className="h-15 w-20" />
      </Link>
      <div className="flex items-center gap-4">
        {isAuthPage ? (
          <Link
            to="/"
            className="bg-transparent text-white px-4 py-2 border border-white rounded-lg font-semibold transition duration-300 hover:bg-black hover:text-cyan-400 hover:shadow-[0_0_10px_2px_rgba(34,211,238,0.7)]"
          >
            Home
          </Link>
        ) : (
          <>
            {isLoggedIn && userData && !userData.isSeller && (
              <>
                <Link to="/wishlist" className="relative text-white p-2 rounded-full transition duration-300 hover:bg-white/10 hover:text-cyan-400">
                  <FaHeart size={24} />
                </Link>
                <Link to="/cart" className="relative text-white p-2 rounded-full transition duration-300 hover:bg-white/10 hover:text-cyan-400">
                  <FaShoppingCart size={24} />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                </Link>

                {/* 🎤 Mic Button */}
                <button
                  onClick={startListening}
                  className={`text-white p-2 rounded-full transition duration-300 hover:bg-white/10 hover:text-cyan-400 ${
                    listening ? 'animate-pulse text-cyan-400' : ''
                  }`}
                  title="Start Voice Command"
                >
                  <FaMicrophone size={24} />
                </button>
              </>
            )}
            <div>
              {isLoggedIn && userData && (
                isHomePage ? (
                  <button
                    onClick={handleProfileClick}
                    className="bg-transparent text-white px-4 py-2 border border-white rounded-lg font-semibold transition duration-300 hover:bg-black hover:cursor-pointer hover:text-cyan-400 hover:shadow-[0_0_10px_2px_rgba(34,211,238,0.7)]"
                  >
                    Profile
                  </button>
                ) : (
                  <Link
                    to="/"
                    className="bg-transparent text-white px-4 py-2 border border-white rounded-lg font-semibold transition duration-300 hover:bg-black hover:text-cyan-400 hover:shadow-[0_0_10px_2px_rgba(34,211,238,0.7)]"
                  >
                    Home
                  </Link>
                )
              )}
              {!isLoggedIn && isHomePage && !isAuthPage && (
                <Link
                  to="/login"
                  className="bg-transparent text-white px-4 py-2 border border-white rounded-lg font-semibold transition duration-300 hover:bg-black hover:cursor-pointer hover:text-cyan-400 hover:shadow-[0_0_10px_2px_rgba(34,211,238,0.7)]"
                >
                  Login / Register
                </Link>
              )}
            </div>
          </>
        )}
      </div>
    </header>
  );
}

export default Navbar;
