import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiClient } from "../lib/api-client"; // <-- update path if needed

const Login = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [inactiveUser, setInactiveUser] = useState(null); // Store inactive user info for modal

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    setInactiveUser(null);

    try {
      // Always use admin login
      const response = await apiClient.loginUser(email, password);

      // Check if user is active
      const user = response.user || response.customer || response;
      if (user.is_active === false) {
        // User is inactive, show modal instead of logging in
        setInactiveUser({
          name: user.name || email,
        });
        setLoading(false);
        return;
      }

      // Store user data
      const userData = {
        ...response,
        email,
        role: user.role || "admin", // Use actual user role from response, default to admin
        loggedInAt: Date.now(),
      };

      localStorage.setItem("User", JSON.stringify(userData));

      // Redirect based on actual user role
      if (user.role === "employee" || user.role === "customer") {
        navigate("/customer-dashboard", { replace: true });
      } else {
        navigate("/", { replace: true });
      }
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

      {/* Inactive User Modal */}
      {inactiveUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 backdrop-blur-sm bg-black/30 z-40" />
          <div className="relative bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md mx-2 z-50">
            <div className="text-center">
              <div className="mb-4 flex justify-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4v2m0 0a9 9 0 110-18 9 9 0 010 18z" />
                  </svg>
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Account Inactive</h2>
              <p className="text-gray-600 mb-6">
                The account <span className="font-semibold text-gray-900">{inactiveUser.name}</span> is currently inactive. Please contact the admin to activate your account.
              </p>
              <button
                onClick={() => setInactiveUser(null)}
                className="w-full px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
