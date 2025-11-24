import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    // Temporary fake login — replace with API later
    if (email === "admin@gmail.com" && password === "admin123") {

      // Create dummy admin details and store in localStorage
      const adminDetails = {
        email,
        name: "Admin User",
        role: "admin",
        token: "dummy-token-12345",
        loggedInAt: Date.now(),
      };

      localStorage.setItem("admin", JSON.stringify(adminDetails));

      // Clear any previous error and redirect to dashboard
      setError("");
      navigate("/", { replace: true });

    } else {
      setError("Invalid email or password");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md bg-white shadow-lg rounded-xl p-8 border border-gray-100">

        {/* Logo / Brand */}
        <h1 className="text-3xl font-bold text-green-600 text-center mb-6">
          TaskTrack Admin
        </h1>

        {/* Title */}
        <h2 className="text-xl font-semibold text-gray-700 text-center mb-6">
          Login to your account
        </h2>

        {/* Error */}
        {error && (
          <div className="bg-red-100 text-red-600 text-sm p-2 rounded mb-4 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              required
              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:outline-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              required
              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
            />
          </div>

          {/* Login Button */}
          <button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-lg transition"
          >
            Login
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-xs text-gray-500 mt-6">
          © 2025 Bitsberg Technologies — All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default Login;
