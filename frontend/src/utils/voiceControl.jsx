// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { createVoiceAssistant } from "./voiceAssistant";

// function VoiceControl({ userToken }) {
//   const navigate = useNavigate();
//   const [listening, setListening] = useState(false);
//   const [voiceInput, setVoiceInput] = useState("");

//   const voiceAssistant = createVoiceAssistant({
//     navigate,
//     speakFunction: console.log,
//     userToken,
//     setListening,
//     setVoiceInput,
//   });

//   return (
//     <div>
//       <button onClick={voiceAssistant.start}>
//         🎙️ {listening ? "Listening..." : "Start Voice Assistant"}
//       </button>

//       {voiceInput && (
//         <p>
//           You said: <strong>{voiceInput}</strong>
//         </p>
//       )}
//     </div>
//   );
// }

// export default VoiceControl;
