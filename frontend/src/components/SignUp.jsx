import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import Otp from "./Otp";

function SignUp() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    mobile: "",
  });
  const [passwordShown, setPasswordShown] = useState(false);
  const [confirmPasswordShown, setConfirmPasswordShown] = useState(false);
  const [isSeller, setIsSeller] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const navigate = useNavigate();

  const togglePassword = () => {
    setPasswordShown(!passwordShown);
  };

  const toggleConfirmPassword = () => {
    setConfirmPasswordShown(!confirmPasswordShown);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSendOtp = () => {
    if (!form.email || !form.firstName || !form.mobile) {
      alert("Please fill in first name, email, and mobile before sending OTP.");
      return;
    }
    setShowOtpModal(true);
  };

  const handleOtpVerified = () => {
    setOtpVerified(true);
    setShowOtpModal(false);
    alert("Email verified successfully! Now you can complete signup.");
  };

  const handleOtpCancel = () => {
    setShowOtpModal(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!otpVerified) {
      alert("Please verify your email with OTP before signing up.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    // Validate mobile number
    const mobileNumber = parseInt(form.mobile);
    if (isNaN(mobileNumber)) {
      alert("Please enter a valid mobile number");
      return;
    }
    const userData = {
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      password: form.password,
      mobile: mobileNumber,
      isSeller: isSeller
    };
    try {
      const res = await fetch("http://localhost:5000/api/user/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) {
        alert(
          typeof data.error === "string"
            ? data.error
            : JSON.stringify(data.error || data || "Signup failed")
        );
        return;
      }
      // Store token and user in localStorage (optional, for frontend state)
      if (data.token) {
        localStorage.setItem("token", data.token);
      }
      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
      }
      alert("Signup successful! You are now logged in.");
      window.dispatchEvent(new Event("storage"));
      navigate("/");
    } catch (err) {
      alert("Network error");
    }
  };

  return (
    <div className="bg-gradient-to-r from-black via-blue-950 to-cyan-700 min-h-screen">
      <div className="text-white container mx-auto">
        <Navbar />
      </div>
      <div className="flex flex-col items-center justify-center min-h-[80vh]">
        <form
          onSubmit={handleSubmit}
          className="bg-black bg-opacity-60 p-8 rounded-lg shadow-lg w-full max-w-md"
        >
          <h2 className="text-2xl font-bold text-cyan-400 mb-2 text-center">
            Sign Up
          </h2>

          {/* Account Type Selection */}
          <div className="mb-4 flex justify-center gap-6">
            <label className="flex items-center gap-2 text-white">
              <input
                type="radio"
                name="accountType"
                checked={!isSeller}
                onChange={() => setIsSeller(false)}
                className="accent-cyan-400"
              />
              Buyer
            </label>
            <label className="flex items-center gap-2 text-white">
              <input
                type="radio"
                name="accountType"
                checked={isSeller}
                onChange={() => setIsSeller(true)}
                className="accent-cyan-400"
              />
              Seller
            </label>
          </div>

          {/* First Name */}
          <div className="relative mb-4">
            <input
              type="text"
              name="firstName"
              id="firstName"
              value={form.firstName}
              onChange={handleChange}
              className="peer w-full px-4 py-2 rounded bg-gray-900 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400 placeholder-transparent"
              required
              autoComplete="off"
              placeholder=" "
            />
            <label
              htmlFor="firstName"
              className={`absolute left-4 transition-all duration-200 pointer-events-none
              ${
                form.firstName
                  ? "-top-4 text-xs bg-black text-gray-400 px-1"
                  : "top-2 text-base text-gray-400"
              }
              peer-focus:-top-4 peer-focus:text-xs peer-focus:bg-black peer-focus:px-1`}
            >
              First Name
            </label>
          </div>

          {/* Last Name */}
          <div className="relative mb-4">
            <input
              type="text"
              name="lastName"
              id="lastName"
              value={form.lastName}
              onChange={handleChange}
              className="peer w-full px-4 py-2 rounded bg-gray-900 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400 placeholder-transparent"
              autoComplete="off"
              placeholder=" "
            />
            <label
              htmlFor="lastName"
              className={`absolute left-4 transition-all duration-200 pointer-events-none
    ${
      form.lastName
        ? "-top-4 text-xs bg-black text-gray-400 px-1"
        : "top-2 text-base text-gray-400"
    }
    peer-focus:-top-4 peer-focus:text-xs peer-focus:bg-black peer-focus:px-1`}
            >
              Last Name (optional)
            </label>
          </div>

          {/* Mobile */}
          <div className="relative mb-4">
            <input
              type="text"
              name="mobile"
              id="mobile"
              value={form.mobile}
              onChange={handleChange}
              className="peer w-full px-4 py-2 rounded bg-gray-900 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400 placeholder-transparent"
              required
              autoComplete="off"
              placeholder=" "
            />
            <label
              htmlFor="mobile"
              className={`absolute left-4 transition-all duration-200 pointer-events-none
    ${
      form.mobile
        ? "-top-4 text-xs bg-black text-gray-400 px-1"
        : "top-2 text-base text-gray-400"
    }
    peer-focus:-top-4 peer-focus:text-xs peer-focus:bg-black peer-focus:px-1`}
            >
              Mobile
            </label>
          </div>

          {/* Email */}
          <div className="relative mb-4 flex items-center gap-2">
            <input
              type="email"
              name="email"
              id="email"
              value={form.email}
              onChange={handleChange}
              className="peer w-full px-4 py-2 rounded bg-gray-900 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400 placeholder-transparent"
              required
              autoComplete="on"
              placeholder=" "
              disabled={otpVerified}
            />
            <label
              htmlFor="email"
              className={`absolute left-4 transition-all duration-200 pointer-events-none
              ${form.email ? "-top-4 text-xs bg-black text-gray-400 px-1" : "top-2 text-base text-gray-400"}
              peer-focus:-top-4 peer-focus:text-xs peer-focus:bg-black peer-focus:px-1`}
            >
              Email
            </label>
            <button
              type="button"
              className="py-2 px-3 bg-cyan-400 text-black font-bold rounded hover:bg-cyan-300 transition cursor-pointer text-xs"
              onClick={handleSendOtp}
              disabled={otpVerified}
            >
              {otpVerified ? "Verified" : "Send OTP"}
            </button>
          </div>

          {/* Password */}
          <div className="relative mb-4">
            <input
              type={passwordShown ? "text" : "password"}
              name="password"
              id="password"
              value={form.password}
              onChange={handleChange}
              className="peer w-full px-4 py-2 rounded bg-gray-900 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400 placeholder-transparent"
              required
              autoComplete="off"
              placeholder=" "
            />
            <label
              htmlFor="password"
              className={`absolute left-4 transition-all duration-200 pointer-events-none
    ${
      form.password
        ? "-top-4 text-xs bg-black text-gray-400 px-1"
        : "top-2 text-base text-gray-400"
    }
    peer-focus:-top-4 peer-focus:text-xs peer-focus:bg-black peer-focus:px-1`}
            >
              Password
            </label>
            <div
              className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
              onClick={togglePassword}
            >
              {passwordShown ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6 text-gray-500"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.183a1.002 1.002 0 010 .639c-1.389 4.813-5.326 7.82-9.963 7.82-4.638 0-8.573-3.007-9.963-7.183z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6 text-gray-500"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c4.756 0 8.773-3.162 10.065-7.777a10.42 10.42 0 00-2.028-3.722c-1.792.35-3.709.552-5.74.652a9.974 9.974 0 00-4.79-1.064l-1.382-.229m-2.42.294L4.86 6.324m5.875 8.207l-3.98 2.286m-2.48 6.161c3.172 2.28 6.75 3.421 10.383 3.421 3.633 0 7.21-1.141 10.383-3.421m-10.383-3.421l3.98-2.286m2.48-6.161L19.14 6.324m-5.875 8.207l3.98 2.286"
                  />
                </svg>
              )}
            </div>
          </div>

          {/* Confirm Password */}
          <div className="relative mb-6">
            <input
              type={confirmPasswordShown ? "text" : "password"}
              name="confirmPassword"
              id="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              className="peer w-full px-4 py-2 rounded bg-gray-900 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400 placeholder-transparent"
              required
              autoComplete="off"
              placeholder=" "
            />
            <label
              htmlFor="confirmPassword"
              className={`absolute left-4 transition-all duration-200 pointer-events-none
    ${
      form.confirmPassword
        ? "-top-4 text-xs bg-black text-gray-400 px-1"
        : "top-2 text-base text-gray-400"
    }
    peer-focus:-top-4 peer-focus:text-xs peer-focus:bg-black peer-focus:px-1`}
            >
              Confirm Password
            </label>
            <div
              className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
              onClick={toggleConfirmPassword}
            >
              {confirmPasswordShown ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6 text-gray-500"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.183a1.002 1.002 0 010 .639c-1.389 4.813-5.326 7.82-9.963 7.82-4.638 0-8.573-3.007-9.963-7.183z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6 text-gray-500"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c4.756 0 8.773-3.162 10.065-7.777a10.42 10.42 0 00-2.028-3.722c-1.792.35-3.709.552-5.74.652a9.974 9.974 0 00-4.79-1.064l-1.382-.229m-2.42.294L4.86 6.324m5.875 8.207l-3.98 2.286m-2.48 6.161c3.172 2.28 6.75 3.421 10.383 3.421 3.633 0 7.21-1.141 10.383-3.421m-10.383-3.421l3.98-2.286m2.48-6.161L19.14 6.324m-5.875 8.207l3.98 2.286"
                  />
                </svg>
              )}
            </div>
          </div>

          <div className="relative">
            <button
              type="submit"
              className="w-full py-2 bg-cyan-400 text-black font-bold rounded hover:bg-cyan-300 transition cursor-pointer"
              disabled={!otpVerified}
            >
              Sign Up as {isSeller ? "Seller" : "Buyer"}
            </button>
          </div>

          {/* Existing User Section */}
          <div className="mt-6 text-center">
            <p className="text-gray-400">Already have an account?</p>
            <Link
              to="/login"
              className="text-cyan-400 hover:text-cyan-300 transition duration-300 inline-block mt-2"
            >
              Sign in here
            </Link>
          </div>
        </form>
      </div>

      {/* OTP Modal */}
      {showOtpModal && (
        <Otp
          email={form.email}
          onOtpVerified={handleOtpVerified}
          onCancel={handleOtpCancel}
          title="Verify Email for Signup"
          description="Please verify your email address to complete your registration."
        />
      )}

      <Footer />
    </div>
  );
}

export default SignUp;
