export function createVoiceAssistant({ navigate, speakFunction, userToken, setListening, setSpokenText }) {
  // Ensure setSpokenText is included in the destructuring

  const synth = window.speechSynthesis;

  const speak = (message) => {
    const getFemaleVoice = () => {
      const voices = synth.getVoices();
      return (
        voices.find(v =>
          v.name.toLowerCase().includes("female") ||
          (v.name.toLowerCase().includes("google") &&
            v.name.toLowerCase().includes("english") &&
            !v.name.toLowerCase().includes("male"))
        ) ||
        voices.find(v => v.lang === "en-US" && v.name.toLowerCase().includes("english")) ||
        voices[0]
      );
    };

    const utter = new SpeechSynthesisUtterance(message);
    utter.lang = "en-US";
    utter.voice = getFemaleVoice();
    if (synth.getVoices().length === 0) {
      synth.onvoiceschanged = () => synth.speak(utter);
    } else {
      synth.speak(utter);
    }
    if (typeof speakFunction === "function") {
      speakFunction(message);
    }
  };

  const handleCommand = async (text) => {
    const cmd = text.toLowerCase();

    if (cmd.includes("home")) {
      speak("Opening home page");
      navigate("/");
    } else if (cmd.includes(" open cart")) {
      speak("Opening cart");
      navigate("/cart");
    } else if (cmd.includes("open wishlist")) {
      speak("Opening wishlist");
      navigate("/wishlist");
    } else if (cmd.includes("profile")) {
      speak("Opening profile");
      navigate("/profile");
    } else if (cmd.includes("refresh") || cmd.includes("reload")) {
      speak("Refreshing the page");
      window.location.reload();
    }

    // Add to cart
    else if (cmd.startsWith("add") && (cmd.includes("in my cart") || cmd.includes("to cart"))) {
      const productName = cmd
        .replace(/^add\s+/i, "")
        .replace(/\s+in my cart$/i, "")
        .replace(/\s+to cart$/i, "")
        .trim();

      try {
        const searchRes = await fetch("http://localhost:5000/api/item/allitems"); // ✅ Correct endpoint
        const searchData = await searchRes.json();

        const items = searchData.items || [];

        if (items.length === 0) {
          speak("No products are available at this time.");
          return;
        }

        // Sort items by name length (shorter names first) for better matching
        const sortedItems = items.sort((a, b) => a.name.length - b.name.length);

        const searchTerm = productName.toLowerCase();
        console.log("🟡 Searching for:", searchTerm);

        // Step 1: Exact match
        let bestMatch = sortedItems.find(item =>
          item.name.toLowerCase() === searchTerm
        );

        // Step 2: Partial match
        if (!bestMatch) {
          bestMatch = sortedItems.find(item =>
            item.name.toLowerCase().includes(searchTerm) ||
            searchTerm.includes(item.name.toLowerCase())
          );
        }

        // Step 3: Word-level match
        if (!bestMatch) {
          const searchWords = searchTerm.split(' ').filter(word => word.length > 2);
          bestMatch = sortedItems.find(item => {
            const itemName = item.name.toLowerCase();
            return searchWords.some(word => itemName.includes(word));
          });
        }

        console.log("🟢 Best match found:", bestMatch);

        if (!bestMatch) {
          speak(`${productName} is not available.`);
          return;
        }

        const product = bestMatch;

        const cartRes = await fetch("http://localhost:5000/api/cart/add", {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            ...(userToken ? { Authorization: `Bearer ${userToken}` } : {})
          },
          body: JSON.stringify({
            itemId: product._id, // ✅ Use _id (not product.id)
            quantity: 1
          })
        });

        if (cartRes.ok) {
          speak(`${product.name} has been added to your cart.`);
          window.dispatchEvent(new Event("cartUpdated"));
        } else {
          speak("Failed to add the product to cart.");
        }
      } catch (err) {
        console.error("❌ Error:", err);
        speak("Something went wrong while adding the product.");
      }
    }

    // Remove from cart
    else if (cmd.startsWith("remove") && cmd.includes("from my cart")) {
      const productName = cmd.replace("remove", "").replace("from my cart", "").trim();
      try {
        const searchRes = await fetch("http://localhost:5000/api/item/allitems");
        const searchData = await searchRes.json();

        if (!searchData.items || searchData.items.length === 0) {
          speak("No products available.");
          return;
        }

        // Sort items by name length (shorter names first) for better matching
        const sortedItems = searchData.items.sort((a, b) => a.name.length - b.name.length);

        const searchTerm = productName.toLowerCase();
        console.log("Searching for cart removal:", searchTerm);

        let bestMatch = sortedItems.find(item => item.name.toLowerCase() === searchTerm);

        if (!bestMatch) {
          bestMatch = sortedItems.find(item =>
            item.name.toLowerCase().includes(searchTerm) || searchTerm.includes(item.name.toLowerCase())
          );
        }

        if (!bestMatch) {
          const searchWords = searchTerm.split(' ').filter(word => word.length > 2);
          bestMatch = sortedItems.find(item => {
            const itemName = item.name.toLowerCase();
            return searchWords.some(word => itemName.includes(word));
          });
        }

        console.log("Best match for cart removal:", bestMatch);

        if (!bestMatch) {
          speak(`${productName} is not available.`);
          return;
        }

        const product = bestMatch;

        // Check if product is in cart before removing
        const cartCheckRes = await fetch("http://localhost:5000/api/cart", {
          credentials: "include",
          headers: {
            ...(userToken ? { Authorization: `Bearer ${userToken}` } : {})
          }
        });

        if (cartCheckRes.ok) {
          const cartData = await cartCheckRes.json();
          const isInCart = cartData.cart.items.some(item => item.itemId._id === product._id);

          if (!isInCart) {
            speak(`${product.name} is not in your cart.`);
            return;
          }
        }

        const cartRes = await fetch(`http://localhost:5000/api/cart/remove/${product._id}`, {
          method: "DELETE",
          credentials: "include",
          headers: {
            ...(userToken ? { Authorization: `Bearer ${userToken}` } : {})
          }
        });

        if (cartRes.ok) {
          speak(`${product.name} has been removed from your cart.`);
          window.dispatchEvent(new Event("cartUpdated"));
        } else {
          speak("Failed to remove the product from cart.");
        }
      } catch (err) {
        console.error(err);
        speak("Something went wrong while removing from cart.");
      }
    }

    // Add to wishlist
    else if (cmd.startsWith("add") && cmd.includes("in my wishlist")) {
      const productName = cmd.replace("add", "").replace("in my wishlist", "").trim();
      try {
        const searchRes = await fetch("http://localhost:5000/api/item/allitems");
        const searchData = await searchRes.json();

        if (!searchData.items || searchData.items.length === 0) {
          speak("No products available.");
          return;
        }

        // Sort items by name length (shorter names first) for better matching
        const sortedItems = searchData.items.sort((a, b) => a.name.length - b.name.length);

        const searchTerm = productName.toLowerCase();
        console.log("Searching for wishlist:", searchTerm);

        let bestMatch = sortedItems.find(item => item.name.toLowerCase() === searchTerm);

        if (!bestMatch) {
          bestMatch = sortedItems.find(item =>
            item.name.toLowerCase().includes(searchTerm) || searchTerm.includes(item.name.toLowerCase())
          );
        }

        if (!bestMatch) {
          const searchWords = searchTerm.split(' ').filter(word => word.length > 2);
          bestMatch = sortedItems.find(item => {
            const itemName = item.name.toLowerCase();
            return searchWords.some(word => itemName.includes(word));
          });
        }

        console.log("Best match for wishlist:", bestMatch);

        if (!bestMatch) {
          speak(`${productName} is not available.`);
          return;
        }

        const product = bestMatch;

        // Check if product is already in wishlist
        const wishlistCheckRes = await fetch("http://localhost:5000/api/user/wishlist", {
          credentials: "include",
          headers: {
            ...(userToken ? { Authorization: `Bearer ${userToken}` } : {})
          }
        });

        if (wishlistCheckRes.ok) {
          const wishlistData = await wishlistCheckRes.json();
          const isAlreadyInWishlist = wishlistData.wishlist.some(item => item._id === product._id);

          if (isAlreadyInWishlist) {
            speak(`${product.name} is already in your wishlist.`);
            return;
          }
        }

        const wishlistRes = await fetch("http://localhost:5000/api/user/wishlist/toggle", {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            ...(userToken ? { Authorization: `Bearer ${userToken}` } : {})
          },
          body: JSON.stringify({ itemId: product._id })
        });

        if (wishlistRes.ok) {
          speak(`${product.name} has been added to your wishlist.`);
          window.dispatchEvent(new Event("wishlistUpdated"));
        } else {
          speak("Failed to add the product to wishlist.");
        }
      } catch (err) {
        console.error(err);
        speak("Something went wrong while adding to wishlist.");
      }
    }

    // Remove from wishlist
    else if (cmd.startsWith("remove") && cmd.includes("from my wishlist")) {
      const productName = cmd.replace("remove", "").replace("from my wishlist", "").trim();
      try {
        const searchRes = await fetch("http://localhost:5000/api/item/allitems");
        const searchData = await searchRes.json();

        if (!searchData.items || searchData.items.length === 0) {
          speak("No products available.");
          return;
        }

        // Sort items by name length (shorter names first) for better matching
        const sortedItems = searchData.items.sort((a, b) => a.name.length - b.name.length);

        const searchTerm = productName.toLowerCase();
        console.log("Searching for wishlist removal:", searchTerm);

        let bestMatch = sortedItems.find(item => item.name.toLowerCase() === searchTerm);

        if (!bestMatch) {
          bestMatch = sortedItems.find(item =>
            item.name.toLowerCase().includes(searchTerm) || searchTerm.includes(item.name.toLowerCase())
          );
        }

        if (!bestMatch) {
          const searchWords = searchTerm.split(' ').filter(word => word.length > 2);
          bestMatch = sortedItems.find(item => {
            const itemName = item.name.toLowerCase();
            return searchWords.some(word => itemName.includes(word));
          });
        }

        console.log("Best match for wishlist removal:", bestMatch);

        if (!bestMatch) {
          speak(`${productName} is not available.`);
          return;
        }

        const product = bestMatch;

        // Check if product is in wishlist before removing
        const wishlistCheckRes = await fetch("http://localhost:5000/api/user/wishlist", {
          credentials: "include",
          headers: {
            ...(userToken ? { Authorization: `Bearer ${userToken}` } : {})
          }
        });

        if (wishlistCheckRes.ok) {
          const wishlistData = await wishlistCheckRes.json();
          const isInWishlist = wishlistData.wishlist.some(item => item._id === product._id);

          if (!isInWishlist) {
            speak(`${product.name} is not in your wishlist.`);
            return;
          }
        }

        const wishlistRes = await fetch("http://localhost:5000/api/user/wishlist/toggle", {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            ...(userToken ? { Authorization: `Bearer ${userToken}` } : {})
          },
          body: JSON.stringify({ itemId: product._id })
        });

        if (wishlistRes.ok) {
          speak(`${product.name} has been removed from your wishlist.`);
          window.dispatchEvent(new Event("wishlistUpdated"));
        } else {
          speak("Failed to remove the product from wishlist.");
        }
      } catch (err) {
        console.error(err);
        speak("Something went wrong while removing from wishlist.");
      }
    }

    else {
      speak("Sorry, I did not understand.");
    }
  };

  const recognitionRef = {}; // Use a ref to store the recognition instance

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      speak("Speech recognition is not supported in your browser.");
      return;
    }

    // Stop any existing recognition instance before starting a new one
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition; // Store the instance in the ref

    recognition.lang = "en-US";
    // Set to true to get interim (partial) results as the user speaks
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    // Set to true to allow continuous listening for multiple phrases
    recognition.continuous = true;

    recognition.onstart = () => {
      setListening?.(true);
      setSpokenText(""); // Clear text when starting a new session
      console.log("Speech recognition started.");
    };

    recognition.onend = () => {
      setListening?.(false);
      // You can decide if you want to clear the text immediately on end,
      // or let the last recognized phrase linger for a moment.
      // If you clear it here, consider a slight delay if you want the user to read the final command.
      // For now, it will be cleared when `setListening` becomes false in Navbar's useEffect.
      console.log("Speech recognition ended.");
    };

    recognition.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      // Update spoken text with interim results for real-time display
      // If there's a final transcript, prioritize it, otherwise show interim
      setSpokenText(finalTranscript || interimTranscript); // <--- This is the key line for real-time display

      if (finalTranscript) {
        console.log("🗣️ Final Voice Input:", finalTranscript);
        handleCommand(finalTranscript); // Only execute command on final result
      }
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setListening?.(false);
      // Display error message in the text area for user feedback
      setSpokenText(`Error: ${event.error}`);
      speak(`Error during speech recognition: ${event.error}`);
    };

    recognition.start();
  };

  return {
    speak,
    start: startListening,
  };
}