import { BACKEND_BASE_URL } from "./api";

export function createVoiceAssistant({ navigate, speakFunction, userToken, setListening, setSpokenText }) {

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
    } else if (cmd.includes("open cart") || cmd.includes("open card")) {
      speak("Opening cart");
      navigate("/cart");
    } else if (cmd.includes("open wishlist") || cmd.includes("open wish list")) {
      speak("Opening wishlist");
      navigate("/wishlist");
    } else if (cmd.includes("profile")) {
      speak("Opening profile");
      navigate("/profile");
    } else if (cmd.includes("refresh") || cmd.includes("reload")) {
      speak("Refreshing the page");
      window.location.reload();
    }

    // Show all items from a specific category
    else if (cmd.startsWith("show all")) {
      const categoryName = cmd
        .replace(/^show all\s+/i, "")
        .trim();

      // Check if user wants to show all categories
      if (categoryName.toLowerCase() === "categories") {
        if (window.setCategoryFilter) {
          window.setCategoryFilter(""); // Clear category filter to show all
          speak("Showing all categories");
        } else {
          speak("Please navigate to the home page to view all categories");
        }
        return;
      }

      // Available categories in lowercase for easier matching
      const availableCategories = [
        'electronics', 'fashion', 'home', 'sports', 
        'books', 'beauty', 'toys', 'health'
      ];

      // Find the best matching category
      const searchTerm = categoryName.toLowerCase();
      let bestMatch = availableCategories.find(cat => 
        cat === searchTerm
      );

      if (!bestMatch) {
        bestMatch = availableCategories.find(cat =>
          cat.includes(searchTerm) ||
          searchTerm.includes(cat)
        );
      }

      if (!bestMatch) {
        speak(`${categoryName} category is not available. Available categories are: ${availableCategories.join(', ')}`);
        return;
      }

      // Convert back to proper case for the filter
      const categoryMap = {
        'electronics': 'Electronics',
        'fashion': 'Fashion', 
        'home': 'Home',
        'sports': 'Sports',
        'books': 'Books',
        'beauty': 'Beauty',
        'toys': 'Toys',
        'health': 'Health'
      };

      const properCategory = categoryMap[bestMatch];

      // Set the category filter using the global function
      if (window.setCategoryFilter) {
        window.setCategoryFilter(properCategory);
        speak(`Showing all ${properCategory} items`);
      } else {
        speak("Please navigate to the home page to filter by category");
      }
    }

    // Add to cart
    else if (cmd.startsWith("add") && (cmd.includes("in my cart") || cmd.includes("to cart") || cmd.includes("in my card") || cmd.includes("to card"))) {
              const productName = cmd
          .replace(/^add\s+/i, "")
          .replace(/\s+in my cart$/i, "")
          .replace(/\s+to cart$/i, "")
          .replace(/\s+in my card$/i, "")
          .replace(/\s+to card$/i, "")
          .trim();

      try {
        const searchRes = await fetch(`${BACKEND_BASE_URL}/api/item/allitems`); // ✅ Correct endpoint
        const searchData = await searchRes.json();

        const items = searchData.items || [];

        if (items.length === 0) {
          speak("No products are available at this time.");
          return;
        }

        // Sort items by name length (shorter names first) for better matching
        const sortedItems = items.sort((a, b) => a.name.length - b.name.length);

        const searchTerm = productName.toLowerCase();

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

        if (!bestMatch) {
          speak(`${productName} is not available.`);
          return;
        }

        const product = bestMatch;

        const cartRes = await fetch(`${BACKEND_BASE_URL}/api/cart/add`, {
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
    else if (cmd.startsWith("remove") && (cmd.includes("from my cart") || cmd.includes("from my card"))) {
      const productName = cmd.replace("remove", "").replace("from my cart", "").replace("from my card", "").trim();
      try {
        const searchRes = await fetch(`${BACKEND_BASE_URL}/api/item/allitems`);
        const searchData = await searchRes.json();

        if (!searchData.items || searchData.items.length === 0) {
          speak("No products available.");
          return;
        }

        // Sort items by name length (shorter names first) for better matching
        const sortedItems = searchData.items.sort((a, b) => a.name.length - b.name.length);

        const searchTerm = productName.toLowerCase();

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

        if (!bestMatch) {
          speak(`${productName} is not available.`);
          return;
        }

        const product = bestMatch;

        // Check if product is in cart before removing
        const cartCheckRes = await fetch(`${BACKEND_BASE_URL}/api/cart`, {
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

        const cartRes = await fetch(`${BACKEND_BASE_URL}/api/cart/remove/${product._id}`, {
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
    else if (cmd.startsWith("add") && (cmd.includes("in my wishlist") || cmd.includes("in my wish list"))) {
      const productName = cmd.replace("add", "").replace("in my wishlist", "").replace("in my wish list", "").trim();
      try {
        const searchRes = await fetch(`${BACKEND_BASE_URL}/api/item/allitems`);
        const searchData = await searchRes.json();

        if (!searchData.items || searchData.items.length === 0) {
          speak("No products available.");
          return;
        }

        // Sort items by name length (shorter names first) for better matching
        const sortedItems = searchData.items.sort((a, b) => a.name.length - b.name.length);

        const searchTerm = productName.toLowerCase();

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

        if (!bestMatch) {
          speak(`${productName} is not available.`);
          return;
        }

        const product = bestMatch;

        // Check if product is already in wishlist
        const wishlistCheckRes = await fetch(`${BACKEND_BASE_URL}/api/user/wishlist`, {
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

        const wishlistRes = await fetch(`${BACKEND_BASE_URL}/api/user/wishlist/toggle`, {
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
    else if (cmd.startsWith("remove") && (cmd.includes("from my wishlist") || cmd.includes("from my wish list"))) {
      const productName = cmd.replace("remove", "").replace("from my wishlist", "").replace("from my wish list", "").trim();
      try {
        const searchRes = await fetch(`${BACKEND_BASE_URL}/api/item/allitems`);
        const searchData = await searchRes.json();

        if (!searchData.items || searchData.items.length === 0) {
          speak("No products available.");
          return;
        }

        // Sort items by name length (shorter names first) for better matching
        const sortedItems = searchData.items.sort((a, b) => a.name.length - b.name.length);

        const searchTerm = productName.toLowerCase();

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

        if (!bestMatch) {
          speak(`${productName} is not available.`);
          return;
        }

        const product = bestMatch;

        // Check if product is in wishlist before removing
        const wishlistCheckRes = await fetch(`${BACKEND_BASE_URL}/api/user/wishlist`, {
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

        const wishlistRes = await fetch(`${BACKEND_BASE_URL}/api/user/wishlist/toggle`, {
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
  let lastProcessedCommand = ''; // Track last processed command to avoid duplicates
  let processingTimeout = null; // Timeout for processing debounce

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
    };

    recognition.onend = () => {
      setListening?.(false);
    };

    recognition.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';

      // Process only the latest results to avoid accumulation issues
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      // Update spoken text with interim results for real-time display
      setSpokenText(finalTranscript || interimTranscript);

      // Only process final transcripts and ensure they're not empty
      if (finalTranscript && finalTranscript.trim()) {
        const command = finalTranscript.trim();
        
        // Prevent duplicate command processing
        if (command === lastProcessedCommand) {
          return;
        }
        
        // Clear any existing processing timeout
        if (processingTimeout) {
          clearTimeout(processingTimeout);
        }
        
        // Set a small delay to prevent rapid-fire commands
        processingTimeout = setTimeout(() => {
          // Clear the spoken text briefly to show command processing
          setSpokenText("");
          
          // Process the command
          handleCommand(command);
          
          // Update last processed command
          lastProcessedCommand = command;
          
          // Clear spoken text after a short delay to prepare for next command
          setTimeout(() => {
            setSpokenText("");
            lastProcessedCommand = ''; // Reset after delay to allow same command again
          }, 1000);
        }, 200);
      }
    };

    recognition.onerror = (event) => {
      setListening?.(false);
      setSpokenText(`Error: ${event.error}`);
      speak(`Error during speech recognition: ${event.error}`);
    };

    recognition.start();
  };

  return {
    speak,
    start: startListening,
    stop: () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        // Clear the ref to prevent auto-restart when manually stopped
        recognitionRef.current = null;
      }
    },
  };
}