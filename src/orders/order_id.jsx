import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { orders as mockOrders } from "../lib/mock-data";
import Sidebar from "../component/sidebar";

const EditOrderPage = () => {
  const { id } = useParams();
  const order = mockOrders.find((o) => String(o.id) === String(id));
  const [formData, setFormData] = useState(order || {});

  if (!order) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <main className="flex-1 p-8">
          <p className="text-gray-600">Order not found</p>
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
            <Link to="/orders" className="text-green-700 hover:text-green-900">
              ← Back
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Edit Order</h1>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm max-w-2xl">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Order Number
                </label>
                <input
                  type="text"
                  name="orderNumber"
                  value={formData.orderNumber || ""}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-green-700 focus:outline-none focus:ring-1 focus:ring-green-700"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ERP Number
                </label>
                <input
                  type="text"
                  name="erpNumber"
                  value={formData.erpNumber || ""}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-green-700 focus:outline-none focus:ring-1 focus:ring-green-700"
                />
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Customer
                </label>
                <input
                  type="text"
                  name="customer"
                  value={formData.customer || ""}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-green-700 focus:outline-none focus:ring-1 focus:ring-green-700"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project
                </label>
                <input
                  type="text"
                  name="project"
                  value={formData.project || ""}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-green-700 focus:outline-none focus:ring-1 focus:ring-green-700"
                />
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount
                </label>
                <input
                  type="text"
                  name="amount"
                  value={formData.amount || ""}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-green-700 focus:outline-none focus:ring-1 focus:ring-green-700"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Created Date
                </label>
                <input
                  type="text"
                  name="created"
                  value={formData.created || ""}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-green-700 focus:outline-none focus:ring-1 focus:ring-green-700"
                />
              </div>
            </div>

            <div className="mt-8 flex gap-4">
              <button className="rounded-lg bg-green-700 px-6 py-2 text-sm font-medium text-white hover:bg-green-800 transition-colors">
                Update
              </button>
              <Link
                to="/orders"
                className="rounded-lg border border-gray-300 px-6 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Back
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default EditOrderPage;
