import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import Sidebar from "../component/sidebar";
import { customers as mockCustomers } from "../lib/mock-data";
import MapComponent from "../component/map";

const EditCustomerPage = () => {
  const { id } = useParams();
  const customer = mockCustomers.find((c) => c.id === id);
  const [formData, setFormData] = useState(customer || {});

  if (!customer) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <main className="flex-1 p-8">
          <p className="text-gray-600">Customer not found</p>
        </main>
      </div>
    );
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="mb-8 flex items-center gap-4">
            <Link to="/customers" className="text-green-700 hover:text-green-900">
              ← Back
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Edit Customer</h1>
          </div>

          <div className="grid grid-cols-3 gap-8">
            <div className="col-span-2">
              <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                {/* Title & Fax */}
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Title
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title || ""}
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
                      value={formData.fax || ""}
                      onChange={handleInputChange}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-green-700 focus:outline-none focus:ring-1 focus:ring-green-700"
                    />
                  </div>
                </div>

                {/* Address & Email */}
                <div className="mt-6 grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address || ""}
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
                      value={formData.email || ""}
                      onChange={handleInputChange}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-green-700 focus:outline-none focus:ring-1 focus:ring-green-700"
                    />
                  </div>
                </div>

                {/* Phone & Website */}
                <div className="mt-6 grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone
                    </label>
                    <input
                      type="text"
                      name="phone"
                      value={formData.phone || ""}
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
                      value={formData.website || ""}
                      onChange={handleInputChange}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-green-700 focus:outline-none focus:ring-1 focus:ring-green-700"
                    />
                  </div>
                </div>

                {/* Latitude & Longitude */}
                <div className="mt-6 grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Latitude
                    </label>
                    <input
                      type="text"
                      name="latitude"
                      value={formData.latitude || ""}
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
                      value={formData.longitude || ""}
                      onChange={handleInputChange}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-green-700 focus:outline-none focus:ring-1 focus:ring-green-700"
                    />
                  </div>
                </div>

                {/* Buttons */}
                <div className="mt-8 flex gap-4">
                  <button className="rounded-lg bg-green-700 px-6 py-2 text-sm font-medium text-white hover:bg-green-800 transition-colors">
                    Update
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

            {/* Map Component */}
            <div className="col-span-1">
              <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm h-96">
                <MapComponent lat={formData.latitude} lng={formData.longitude} />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default EditCustomerPage;
