import React, { useEffect, useState } from "react";
import { data, useNavigate } from "react-router-dom";
import { FaCubes, FaSpinner } from "react-icons/fa";
import { apiClient } from "../../lib/api-client";
import CustomerSidebar from "./customer-sidebar";

const CustomerAssets = () => {
  const navigate = useNavigate();
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const customer = JSON.parse(localStorage.getItem("User"))?.customer;

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        setLoading(true);
        setError("");
        if (!customer?._id) {
          setError("Customer information not found");
          setLoading(false);
          return;
        }
        const allAssets = await apiClient.getAssets();
        const customerAssets = Array.isArray(allAssets)
          ? allAssets.filter((asset) => asset.customer?._id === customer._id)
          : [];
        setAssets(customerAssets);
      } catch (err) {
        setError(err.message || "Failed to fetch assets");
      } finally {
        setLoading(false);
      }
    };

    fetchAssets();
  }, [customer?._id]);


//   const handleSignOut = () => {
//     try {
//       localStorage.removeItem("User");
//     } catch (e) {
//       // ignore
//     }
//     navigate("/login", { replace: true });
//   };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-50">
      <CustomerSidebar />
      <main className="flex-1 overflow-y-auto pt-16 md:pt-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {/* Header With Logout */}
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-gray-800">Customer Assets</h2>
            {/* <button
              onClick={handleSignOut}
              className="px-4 py-2 bg-red-600 text-white rounded-lg shadow hover:bg-red-700 transition"
            >
              Logout
            </button> */}
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-20">
              <FaSpinner className="text-4xl text-blue-600 animate-spin" />
              <span className="ml-4 text-lg text-gray-600">Loading assets...</span>
            </div>
          )}

          {/* Assets List */}
          {!loading && !error && (
            <>
              {assets.length === 0 ? (
                <div className="text-center py-20">
                  <FaCubes className="text-6xl text-gray-300 mx-auto mb-4" />
                  <p className="text-xl text-gray-500">No assets found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {assets.map((asset) => (
                    <div
                      key={asset._id}
                      className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Title */}
                        <div>
                          <p className="text-xs uppercase tracking-wide text-gray-500 font-semibold">
                            Asset Title
                          </p>
                          <p className="mt-1 text-lg font-bold text-gray-900">
                            {asset.title}
                          </p>
                        </div>

                        {/* Serial Number */}
                        <div>
                          <p className="text-xs uppercase tracking-wide text-gray-500 font-semibold">
                            Serial Number
                          </p>
                          <p className="mt-1 text-gray-700">
                            {asset.serial_number || "N/A"}
                          </p>
                        </div>

                        {/* Barcode */}
                        <div>
                          <p className="text-xs uppercase tracking-wide text-gray-500 font-semibold">
                            Barcode
                          </p>
                          <p className="mt-1 text-gray-700">
                            {asset.barcode || "N/A"}
                          </p>
                        </div>

                        {/* Model */}
                        <div>
                          <p className="text-xs uppercase tracking-wide text-gray-500 font-semibold">
                            Model
                          </p>
                          <p className="mt-1 text-gray-700">
                            {asset.model || "N/A"}
                          </p>
                        </div>

                        {/* Category */}
                        <div>
                          <p className="text-xs uppercase tracking-wide text-gray-500 font-semibold">
                            Category
                          </p>
                          <p className="mt-1 text-gray-700">
                            {asset.category || "N/A"}
                          </p>
                        </div>

                        {/* Manufacturer */}
                        <div>
                          <p className="text-xs uppercase tracking-wide text-gray-500 font-semibold">
                            Manufacturer
                          </p>
                          <p className="mt-1 text-gray-700">
                            {asset.manufacturer || "N/A"}
                          </p>
                        </div>

                        {/* Project */}
                        <div>
                          <p className="text-xs uppercase tracking-wide text-gray-500 font-semibold">
                            Project
                          </p>
                          <p className="mt-1 text-gray-700">
                            {asset.project?.name || "N/A"}
                          </p>
                        </div>

                        {/* Order */}
                        <div>
                          <p className="text-xs uppercase tracking-wide text-gray-500 font-semibold">
                            Order
                          </p>
                          <p className="mt-1 text-gray-700">
                            {asset.order?.order_number || "N/A"}
                          </p>
                        </div>

                        {/* Description */}
                        <div className="md:col-span-2 lg:col-span-3">
                          <p className="text-xs uppercase tracking-wide text-gray-500 font-semibold">
                            Description
                          </p>
                          <p className="mt-1 text-gray-700">
                            {asset.description || "No description provided"}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default CustomerAssets;
