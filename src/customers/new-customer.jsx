import React, { useState, lazy, Suspense } from "react";
import Sidebar from "../component/sidebar";
import { Link } from "react-router-dom";

const MapComponent = lazy(() => import("../component/map"));

const NewCustomerPage = () => {
  const [formData, setFormData] = useState({
    title: "",
    address: "",
    phone: "",
    fax: "",
    email: "",
    website: "",
    latitude: "24.8566",
    longitude: "67.0228",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          {/* Header */}
          <div className="mb-8 flex items-center gap-4">
            <Link to="/customers" className="text-green-700 hover:text-green-900">
              ← Back
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Add Customer</h1>
          </div>

          {/* Form and Map */}
          <div className="grid grid-cols-3 gap-8">
            {/* Left - Form */}
            <div className="col-span-2">
              <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                {/* Row 1 */}
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Title
                    </label>
                    <input
                      type="text"
                      name="title"
                      placeholder="Company name"
                      value={formData.title}
                      onChange={handleInputChange}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-green-700 focus:outline-none focus:ring-1 focus:ring-green-700"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fax
                    </label>
                    <input
                      type="text"
                      name="fax"
                      placeholder="Fax number"
                      value={formData.fax}
                      onChange={handleInputChange}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-green-700 focus:outline-none focus:ring-1 focus:ring-green-700"
                    />
                  </div>
                </div>

                {/* Row 2 */}
                <div className="mt-6 grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address
                    </label>
                    <input
                      type="text"
                      name="address"
                      placeholder="Street address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-green-700 focus:outline-none focus:ring-1 focus:ring-green-700"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      placeholder="Email address"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-green-700 focus:outline-none focus:ring-1 focus:ring-green-700"
                    />
                  </div>
                </div>

                {/* Row 3 */}
                <div className="mt-6 grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone
                    </label>
                    <input
                      type="text"
                      name="phone"
                      placeholder="Phone number"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-green-700 focus:outline-none focus:ring-1 focus:ring-green-700"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Website
                    </label>
                    <input
                      type="text"
                      name="website"
                      placeholder="Website URL"
                      value={formData.website}
                      onChange={handleInputChange}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-green-700 focus:outline-none focus:ring-1 focus:ring-green-700"
                    />
                  </div>
                </div>

                {/* Row 4 */}
                <div className="mt-6 grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Latitude
                    </label>
                    <input
                      type="text"
                      name="latitude"
                      placeholder="Latitude"
                      value={formData.latitude}
                      onChange={handleInputChange}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-green-700 focus:outline-none focus:ring-1 focus:ring-green-700"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Longitude
                    </label>
                    <input
                      type="text"
                      name="longitude"
                      placeholder="Longitude"
                      value={formData.longitude}
                      onChange={handleInputChange}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-green-700 focus:outline-none focus:ring-1 focus:ring-green-700"
                    />
                  </div>
                </div>

                {/* Buttons */}
                <div className="mt-8 flex gap-4">
                  <button className="rounded-lg bg-green-700 px-6 py-2 text-sm font-medium text-white hover:bg-green-800 transition-colors">
                    Add Customer
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

            {/* Right - Map */}
            <div className="col-span-1">
              <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm h-96">
                <Suspense fallback={<div>Loading map...</div>}>
                  <MapComponent
                    lat={parseFloat(formData.latitude)}
                    lng={parseFloat(formData.longitude)}
                  />
                </Suspense>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default NewCustomerPage;
