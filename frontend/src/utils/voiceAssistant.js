// voiceAssistant.js
export function createVoiceAssistant({ navigate, speakFunction, userToken }) {
  const synth = window.speechSynthesis;
  let listening = false;

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
  };

  const handleCommand = async (text) => {
    const cmd = text.toLowerCase();

    if (cmd.includes("go to home")) {
      speak("Opening home page");
      navigate("/");
    } else if (cmd.includes("go to cart")) {
      speak("Opening cart");
      navigate("/cart");
    } else if (cmd.includes("wishlist")) {
      speak("Opening wishlist");
      navigate("/wishlist");
    } else if (cmd.includes("profile")) {
      speak("Opening profile");
      navigate("/profile");
    } else if (cmd.startsWith("add") && cmd.includes("to cart")) {
      const productName = cmd.replace("add", "").replace("to cart", "").trim();

      try {
        const res = await fetch(`http://localhost:5000/api/items?name=${encodeURIComponent(productName)}`);
        const data = await res.json();

        if (!data || data.length === 0) {
          speak(`${productName} is not available.`);
          return;
        }

        const product = data[0];
        const cartRes = await fetch("http://localhost:5000/api/cart/add", {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            ...(userToken ? { Authorization: `Bearer ${userToken}` } : {})
          },
          body: JSON.stringify({ productId: product._id, quantity: 1 })
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

    recognition.onstart = () => { listening = true; };
    recognition.onend = () => { listening = false; };
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      console.log("🗣️ Voice Input:", transcript);
      handleCommand(transcript);
    };

    recognition.start();
  };

  return {
    speak,
    startListening,
  };
}
