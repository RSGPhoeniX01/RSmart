import React, { useState, useRef, useEffect } from "react";
import { BACKEND_BASE_URL } from "../utils/api";

function Otp({ email, onOtpVerified, onCancel, title = "Verify Email", description = "Please verify your email address." }) {
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [loadingOtp, setLoadingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [timer, setTimer] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    if (timer > 0) {
      timerRef.current = setTimeout(() => setTimer(timer - 1), 1000);
    } else {
      clearTimeout(timerRef.current);
    }
    return () => clearTimeout(timerRef.current);
  }, [timer]);

  const handleSendOtp = async () => {
    if (!email) {
      setOtpError("Email is required");
      return;
    }
    
    setLoadingOtp(true);
    setOtpError("");
    setOtp("");
    setOtpSent(false);
    setTimer(30);
    
    try {
      const res = await fetch(`${BACKEND_BASE_URL}/api/user/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email,
          firstName: "User", // Default value for profile verification
          mobile: 1234567890 // Default value for profile verification
        }),
        credentials: "include",
      });
      const data = await res.json();
      
      // Handle both success and "email already exists" cases
      if (res.ok || data.error === "Email already exists") {
        setOtpSent(true);
        // If it's an existing user, we'll still proceed with OTP verification
        // The backend will have sent the OTP even if user exists
      } else {
        throw new Error(data.error || "Failed to send OTP");
      }
    } catch (err) {
      setOtpError(err.message);
    } finally {
      setLoadingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp.trim()) {
      setOtpError("Please enter the OTP");
      return;
    }
    
    setVerifyingOtp(true);
    setOtpError("");
    
    try {
      const res = await fetch(`${BACKEND_BASE_URL}/api/user/verify-email-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Invalid OTP");
      }
      
      // OTP verified successfully
      if (onOtpVerified) {
        onOtpVerified();
      }
    } catch (err) {
      setOtpError(err.message);
    } finally {
      setVerifyingOtp(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-transparent bg-opacity-20 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md mx-4">
        <h3 className="text-xl font-bold text-cyan-400 mb-4">{title}</h3>
        <p className="text-gray-300 mb-4">{description}</p>
        
        {!otpSent ? (
          <button
            onClick={handleSendOtp}
            disabled={loadingOtp || timer > 0}
            className={`w-full py-2 px-4 rounded-lg font-semibold transition duration-300 ${
              loadingOtp || timer > 0 
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed opacity-50' 
                : 'bg-cyan-600 text-white hover:bg-cyan-700'
            }`}
          >
            {loadingOtp ? "Sending..." : timer > 0 ? `Send OTP in ${timer}s` : "Send OTP"}
          </button>
        ) : (
          <div>
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={e => setOtp(e.target.value)}
              maxLength={6}
              className="w-full px-4 py-2 rounded bg-gray-900 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400 mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={onCancel}
                className="flex-1 bg-transparent text-white py-2 border border-white rounded-lg font-semibold transition duration-300
                hover:bg-black hover:text-gray-400 hover:shadow-[0_0_10px_2px_rgba(156,163,175,0.7)]"
              >
                Cancel
              </button>
              <button
                onClick={handleVerifyOtp}
                disabled={verifyingOtp || !otp.trim()}
                className="flex-1 bg-transparent text-white py-2 border border-white rounded-lg font-semibold transition duration-300
                hover:bg-black hover:text-green-400 hover:shadow-[0_0_10px_2px_rgba(74,222,128,0.7)] disabled:opacity-50"
              >
                {verifyingOtp ? "Verifying..." : "Verify OTP"}
              </button>
            </div>
            {timer > 0 ? (
              <div className="text-center mt-3">
                <span className="text-gray-400 text-sm">Resend OTP in {timer}s</span>
              </div>
            ) : (
              <button
                onClick={handleSendOtp}
                className="w-full mt-3 py-2 px-4 bg-cyan-600 text-white rounded-lg font-semibold transition duration-300 hover:bg-cyan-700"
              >
                Resend OTP
              </button>
            )}
          </div>
        )}
        {otpError && <div className="text-red-400 text-sm mt-2">{otpError}</div>}
      </div>
    </div>
  );
}

export default Otp; 