import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiClient } from "../lib/api-client"; // <-- update path if needed

const Login = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await apiClient.loginUser(email, password);

      // Store customer data in localStorage
      const customerData = {
        ...response,
        email,
        loggedInAt: Date.now(),
      };

      localStorage.setItem("User", JSON.stringify(customerData));

      // Redirect to dashboard
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.message || "Invalid email or password");
    } finally {
      setLoading(false);
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
          <div className="bg-red-100 text-red-600 text-sm p-2 rounded mb-4 text-center border border-red-300">
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
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-lg transition"
          >
            {loading ? "Logging in..." : "Login"}
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
