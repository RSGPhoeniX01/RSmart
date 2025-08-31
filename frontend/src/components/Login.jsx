import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { BACKEND_BASE_URL } from "../utils/api";

function Login() {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [passwordShown, setPasswordShown] = useState(false);
  const navigate = useNavigate();

  const togglePassword = () => {
    setPasswordShown(!passwordShown);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`${BACKEND_BASE_URL}/api/user/signin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
        credentials: "include", // <-- Important for cookies!
      });

      if (!res.ok) {
        const errorData = await res.json();
        alert(
          typeof errorData.error === "string"
            ? errorData.error
            : JSON.stringify(errorData.error || errorData || "Login failed")
        );
        return;
      }

      const userData = await res.json();
      // Store both role and isSeller information
      const userInfo = {
        ...userData,
        isSeller: userData.role === 'seller' || userData.isSeller
      };
      localStorage.setItem('user', JSON.stringify(userInfo));
      window.dispatchEvent(new Event("storage"));
      alert("Login successful!");
      navigate("/"); // Redirect to home page
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
          <h2 className="text-2xl font-bold text-cyan-400 mb-6 text-center">
            Login
          </h2>
          <div className="relative mb-4">
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
            />
            <label
              htmlFor="email"
              className={`absolute left-4 transition-all duration-200 pointer-events-none
              ${
                form.email
                  ? "-top-4 text-xs bg-black text-gray-400 px-1"
                  : "top-2 text-base text-gray-400"
              }
              peer-focus:-top-4 peer-focus:text-xs peer-focus:bg-black peer-focus:px-1`}
            >
              Email
            </label>
          </div>
          <div className="relative mb-6">
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
          <div className="relative">
            <button
              type="submit"
              className="w-full py-2 bg-cyan-400 text-black font-bold rounded hover:bg-cyan-300 transition cursor-pointer"
            >
              Login
            </button>
          </div>

          {/* New User Section */}
          <div className="mt-6 text-center">
            <p className="text-gray-400">New user?</p>
            <Link
              to="/signup"
              className="text-cyan-400 hover:text-cyan-300 transition duration-300 inline-block mt-2"
            >
              Register here
            </Link>
          </div>
        </form>
      </div>
      <Footer />
    </div>
  );
}

export default Login;
