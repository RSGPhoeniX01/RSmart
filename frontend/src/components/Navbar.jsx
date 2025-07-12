import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import logo from "../logo/RSmart.png";
import { FaHeart, FaShoppingCart, FaMicrophone } from "react-icons/fa";

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

  const handleProfileClick = () => navigate("/profile");
  const isHomePage = location.pathname === "/";
  const isAuthPage = ["/login", "/signup"].includes(location.pathname);

  const speak = (message) => {
    const synth = window.speechSynthesis;
    const getFemaleVoice = () => {
      const voices = synth.getVoices();
      return (
        voices.find(
          (v) =>
            v.name.toLowerCase().includes("female") ||
            (v.name.toLowerCase().includes("google") &&
              v.name.toLowerCase().includes("english") &&
              !v.name.toLowerCase().includes("male"))
        ) ||
        voices.find((v) => v.lang === "en-US" && v.name.toLowerCase().includes("english")) ||
        voices[0]
      );
    };
    const speakNow = () => {
      const utter = new SpeechSynthesisUtterance(message);
      utter.lang = "en-US";
      utter.voice = getFemaleVoice();
      synth.speak(utter);
    };
    if (synth.getVoices().length === 0) synth.onvoiceschanged = speakNow;
    else speakNow();
  };

  const handleVoiceCommand = async (text) => {
    const command = text.toLowerCase();
    if (command.includes("go to cart")) {
      speak("Navigating to cart");
      navigate("/cart");
    } else if (command.includes("wishlist")) {
      speak("Opening wishlist");
      navigate("/wishlist");
    } else if (command.includes("home")) {
      speak("Going to home");
      navigate("/");
    } else if (command.includes("profile")) {
      speak("Opening profile");
      navigate("/profile");
    } else if (command.startsWith("add") && command.includes("to cart")) {
      const productName = command.replace("add", "").replace("to cart", "").trim();
      if (!productName) return speak("Sorry, I could not understand the product name");

      try {
        const res = await fetch(`http://localhost:5000/api/items?name=${encodeURIComponent(productName)}`);
        const data = await res.json();
        if (!data || data.length === 0) return speak(`Sorry, ${productName} is not available`);

        const product = data[0];
        const addRes = await fetch("http://localhost:5000/api/cart/add", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId: product._id, quantity: 1 }),
        });

        if (addRes.ok) {
          speak(`Added ${product.name} to your cart`);
          window.dispatchEvent(new Event("cartUpdated"));
        } else speak("Something went wrong while adding to cart");
      } catch (err) {
        console.error(err);
        speak("Failed to add the item. Please try again");
      }
    } else speak("Sorry, you were not clear");
  };

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return alert("Your browser does not support Speech Recognition.");

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);
    recognition.onresult = (event) => handleVoiceCommand(event.results[0][0].transcript);
    recognition.start();
  };

  return (
    <header className="flex items-center justify-between py-4">
      <Link to="/" className="flex items-center gap-1">
        <img src={logo} alt="RSmart Logo" className="h-15 w-20" />
      </Link>
      <div className="flex items-center gap-4">
        {isAuthPage ? (
          <Link to="/" className="text-white px-4 py-2 border border-white rounded-lg font-semibold hover:bg-black hover:text-cyan-400">
            Home
          </Link>
        ) : (
          <>
            {isLoggedIn && userData && !userData.isSeller && (
              <>
                <Link to="/wishlist" className="text-white p-2 rounded-full hover:bg-white/10 hover:text-cyan-400">
                  <FaHeart size={24} />
                </Link>
                <Link to="/cart" className="text-white p-2 rounded-full hover:bg-white/10 hover:text-cyan-400">
                  <FaShoppingCart size={24} />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                </Link>
                <button onClick={startListening} className={`text-white p-2 rounded-full hover:bg-white/10 hover:text-cyan-400 ${listening ? "animate-pulse text-cyan-400" : ""}`} title="Start Voice Command">
                  <FaMicrophone size={24} />
                </button>
              </>
            )}
            <div>
              {isLoggedIn && userData ? (
                isHomePage ? (
                  <button onClick={handleProfileClick} className="text-white px-4 py-2 border border-white rounded-lg font-semibold hover:bg-black hover:text-cyan-400">
                    Profile
                  </button>
                ) : (
                  <Link to="/" className="text-white px-4 py-2 border border-white rounded-lg font-semibold hover:bg-black hover:text-cyan-400">
                    Home
                  </Link>
                )
              ) : (
                isHomePage && !isAuthPage && (
                  <Link to="/login" className="text-white px-4 py-2 border border-white rounded-lg font-semibold hover:bg-black hover:text-cyan-400">
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
