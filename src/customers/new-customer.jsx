import React, { useState } from "react";
import Sidebar from "../component/sidebar";
import { Link, useNavigate } from "react-router-dom";
import { apiClient } from "../lib/api-client";

const NewCustomerPage = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    address: "",
    phone: "",
    fax: "",
    email: "",
    website: "",
    latitude: "24.8566",
    longitude: "67.0228",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [customerData, setCustomerData] = useState(null);

  // Handle Input
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Submit Form
  const handleSubmit = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await apiClient.createCustomer(formData);
      // console.log("Customer Created:", res);

      // Set customer data and show modal
      setCustomerData(res);
      setShowModal(true);
    } catch (err) {
      setError(err.message || "Failed to create customer");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-50">
      <Sidebar />

      <main
        className={`flex-1 overflow-y-auto pt-16 md:pt-0 transition-all duration-300 ${
          showModal ? "blur-sm" : ""
        }`}
      >
        <div className="p-4 sm:p-6 md:p-8">
          {/* Header */}
          <div className="mb-6 flex flex-wrap items-center gap-4">
            <Link to="/customers" className="text-green-700 hover:text-green-900">
              ← Back
            </Link>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Add Customer
            </h1>
          </div>

          {/* Form */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                {/* Show error */}
                {error && (
                  <p className="mb-4 text-sm text-red-600">{error}</p>
                )}

                {/* Form Rows */}
                {[
                  ["name", "Customer name", "phone", "Phone number"],
                  ["address", "Street address", "email", "Email address"],
                ].map(([name1, placeholder1, name2, placeholder2], i) => (
                  <div
                    key={i}
                    className={`mt-${i === 0 ? "0" : "6"} grid grid-cols-1 sm:grid-cols-2 gap-6`}
                  >
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
                        {name1}
                      </label>
                      <input
                        type={name1 === "email" ? "email" : "text"}
                        name={name1}
                        placeholder={placeholder1}
                        value={formData[name1]}
                        onChange={handleInputChange}
                        className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-green-700 focus:outline-none focus:ring-1 focus:ring-green-700"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
                        {name2}
                      </label>
                      <input
                        type={name2 === "email" ? "email" : "text"}
                        name={name2}
                        placeholder={placeholder2}
                        value={formData[name2]}
                        onChange={handleInputChange}
                        className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-green-700 focus:outline-none focus:ring-1 focus:ring-green-700"
                      />
                    </div>
                  </div>
                ))}

                {/* Buttons */}
                <div className="mt-8 flex flex-wrap gap-4">
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className={`rounded-lg px-6 py-2 text-sm font-medium text-white transition-colors ${
                      loading
                        ? "bg-green-400 cursor-not-allowed"
                        : "bg-green-700 hover:bg-green-800"
                    }`}
                  >
                    {loading ? "Adding..." : "Add Customer"}
                  </button>

                  <Link
                    to="/customers"
                    className="rounded-lg border border-gray-300 px-6 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Back
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-0">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Customer Added Successfully</h2>
            <p className="mb-2">Login Credentials:</p>
            <p className="mb-1"><strong>Email:</strong> {customerData?.customer?.email}</p>
            <p className="mb-4"><strong>Password:</strong> {customerData?.password}</p>
            <button
              onClick={() => {
                setShowModal(false);
                navigate("/customers");
              }}
              className="bg-green-700 text-white px-4 py-2 rounded hover:bg-green-800"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewCustomerPage;