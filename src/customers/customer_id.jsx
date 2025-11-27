import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Sidebar from "../component/sidebar";
import { apiClient } from "../lib/api-client";

const EditCustomerPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // 🔥 Fetch customer by ID
  const loadCustomer = async () => {
    try {
      const response = await apiClient.getCustomerById(id);
      setFormData(response.customer);
    } catch (err) {
      setError("Failed to load customer");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomer();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async () => {
    try {
      await apiClient.updateCustomer(id, formData);
      navigate("/customers"); // redirect back
    } catch (err) {
      alert("Failed to update customer");
      console.error(err);
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-screen">
      Loading...
    </div>
  );

  if (error || !formData) return (
    <div className="flex justify-center items-center h-screen">
      <p className="text-red-500">{error || "Customer not found"}</p>
    </div>
  );

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-50">
      <Sidebar />

      <main className="flex-1 overflow-y-auto pt-16 md:pt-0">
        <div className="p-4 sm:p-6 md:p-8">

          <div className="mb-6 flex items-center gap-4">
            <Link to="/customers" className="text-green-700">← Back</Link>
            <h1 className="text-2xl font-bold">Edit Customer</h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Form */}
            <div className="lg:col-span-2">
              <div className="rounded-lg border bg-white p-6 shadow-sm">

                {/* Name */}
                <div>
                  <label className="block text-sm font-medium mb-2">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full border px-4 py-2 rounded-lg"
                  />
                </div>

                {/* Email */}
                <div className="mt-4">
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full border px-4 py-2 rounded-lg"
                  />
                </div>

                {/* Address */}
                <div className="mt-4">
                  <label className="block text-sm font-medium mb-2">Address</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full border px-4 py-2 rounded-lg"
                  />
                </div>

                {/* Phone */}
                <div className="mt-4">
                  <label className="block text-sm font-medium mb-2">Phone</label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full border px-4 py-2 rounded-lg"
                  />
                </div>

                {/* Buttons */}
                <div className="mt-6 flex gap-4">
                  <button
                    onClick={handleUpdate}
                    className="bg-green-700 text-white px-6 py-2 rounded-lg hover:bg-green-800"
                  >
                    Update
                  </button>

                  <Link
                    to="/customers"
                    className="border px-6 py-2 rounded-lg"
                  >
                    Cancel
                  </Link>
                </div>

              </div>
            </div>


          </div>
        </div>
      </main>
    </div>
  );
};

export default EditCustomerPage;
