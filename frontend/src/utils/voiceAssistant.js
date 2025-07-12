// utils/voiceAssistant.js
export function createVoiceAssistant({ navigate, speakFunction, userToken, setListening }) {
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
    } else if (cmd.startsWith("add") && (cmd.includes("in my cart") || cmd.includes("to cart"))) {
      const productName = cmd.replace("add", "").replace("in my cart", "").replace("to cart", "").trim();
      try {
        // Get all items first
        const searchRes = await fetch(`http://localhost:5000/api/items/allitems`);
        const searchData = await searchRes.json();
        
        if (!searchData.items || searchData.items.length === 0) {
          speak("No products available.");
          return;
        }
        
        // Find the best match by comparing lowercase names
        const searchTerm = productName.toLowerCase();
        console.log("Searching for:", searchTerm);
        
        // First try exact match
        let bestMatch = searchData.items.find(item => 
          item.name.toLowerCase() === searchTerm
        );
        
        // If no exact match, try partial match
        if (!bestMatch) {
          bestMatch = searchData.items.find(item => 
            item.name.toLowerCase().includes(searchTerm) || 
            searchTerm.includes(item.name.toLowerCase())
          );
        }
        
        // If still no match, try word-by-word matching
        if (!bestMatch) {
          const searchWords = searchTerm.split(' ').filter(word => word.length > 2);
          bestMatch = searchData.items.find(item => {
            const itemName = item.name.toLowerCase();
            return searchWords.some(word => itemName.includes(word));
          });
        }
        
        console.log("Best match:", bestMatch);
        
        if (!bestMatch) {
          speak(`${productName} is not available.`);
          return;
        }
        
        const product = bestMatch;
        
        // Now add the item to cart using the item ID
        const cartRes = await fetch("http://localhost:5000/api/cart/add", {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            ...(userToken ? { Authorization: `Bearer ${userToken}` } : {})
          },
          body: JSON.stringify({ itemId: product._id, quantity: 1 })
        });
        
        if (cartRes.ok) {
          speak(`${product.name} has been added to your cart.`);
          window.dispatchEvent(new Event("cartUpdated"));
        } else {
          speak("Failed to add the product to cart.");
        }
      } catch (err) {
        console.error(err);
        speak("Something went wrong while adding the product.");
      }
    } else if (cmd.startsWith("add") && cmd.includes("in my wishlist")) {
      const productName = cmd.replace("add", "").replace("in my wishlist", "").trim();
      try {
        // Get all items first
        const searchRes = await fetch(`http://localhost:5000/api/item/allitems`);
        const searchData = await searchRes.json();
        
        if (!searchData.items || searchData.items.length === 0) {
          speak("No products available.");
          return;
        }
        
        // Find the best match by comparing lowercase names
        const searchTerm = productName.toLowerCase();
        console.log("Searching for wishlist:", searchTerm);
        
        // First try exact match
        let bestMatch = searchData.items.find(item => 
          item.name.toLowerCase() === searchTerm
        );
        
        // If no exact match, try partial match
        if (!bestMatch) {
          bestMatch = searchData.items.find(item => 
            item.name.toLowerCase().includes(searchTerm) || 
            searchTerm.includes(item.name.toLowerCase())
          );
        }
        
        // If still no match, try word-by-word matching
        if (!bestMatch) {
          const searchWords = searchTerm.split(' ').filter(word => word.length > 2);
          bestMatch = searchData.items.find(item => {
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
        
        // Add to wishlist using the toggle endpoint
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
    } else {
      speak("Sorry, I did not understand.");
    }
  };
  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      speak("Speech recognition is not supported in your browser.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onstart = () => setListening?.(true);
    recognition.onend = () => setListening?.(false);
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      console.log("🗣️ Voice Input:", transcript);
      handleCommand(transcript);
    };
    recognition.start();
  };
  return {
    speak,
    start: startListening,
  };
}
