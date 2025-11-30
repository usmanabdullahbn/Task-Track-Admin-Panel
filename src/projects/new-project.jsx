import React, { useState } from "react";
import Sidebar from "../component/sidebar";
import MapComponent from "../component/map";
import { apiClient } from "../lib/api-client";
import { toast } from "react-toastify";

const NewProjectPage = () => {
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    customerName: "",
    customerId: "",
    employeeName: "",
    employeeId: "",
    title: "",
    map_location: "",
    latitude: "31.3700",
    longitude: "74.2200",
    contact_name: "",
    contact_phone: "",
    contact_email: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.customerName || !formData.customerId) {
      toast.error("Customer ID, Name, and Title are required");
      return;
    }

    const projectPayload = {
      customer: {
        id: formData.customerId,
        name: formData.customerName,
      },
      employee: {
        id: formData.employeeId || "0",
        name: formData.employeeName || "Not Assigned",
      },
      title: formData.title,
      map_location: formData.map_location,
      contact_name: formData.contact_name,
      contact_phone: formData.contact_phone,
      contact_email: formData.contact_email,
      latitude: Number(formData.latitude),
      longitude: Number(formData.longitude),
    };

    try {
      setLoading(true);
      await apiClient.createProject(projectPayload);

      toast.success("Project created successfully!");
      setLoading(false);
      window.location.href = "/projects"; // redirect
    } catch (err) {
      console.log(err);
      setLoading(false);
      toast.error("Failed to create project");
    }
  };


  return (
  <div className="flex flex-col md:flex-row h-screen bg-gray-50">
    <Sidebar />

    <main className="flex-1 overflow-y-auto pt-16 md:pt-0">
      <div className="p-4 sm:p-6 md:p-8">

        {/* Header */}
        <div className="mb-6 flex items-center gap-4">
          <button
            onClick={() => window.history.back()}
            className="text-green-700 hover:text-green-900 font-medium"
          >
            ← Back
          </button>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Add Project
          </h1>
        </div>

        {/* FORM + MAP GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* FORM SECTION */}
          <div className="lg:col-span-2">
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">

              {/* Row 1 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Customer Name
                  </label>
                  <input
                    name="customerName"
                    placeholder="Enter customer name"
                    value={formData.customerName}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:ring-green-700 focus:border-green-700"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Customer ID
                  </label>
                  <input
                    name="customerId"
                    placeholder="Enter customer ID"
                    value={formData.customerId}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:ring-green-700 focus:border-green-700"
                  />
                </div>
              </div>

              {/* Row 2 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Project Title
                  </label>
                  <input
                    name="title"
                    placeholder="Enter project title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:ring-green-700 focus:border-green-700"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Project Location (Text)
                  </label>
                  <input
                    name="map_location"
                    placeholder="Location summary"
                    value={formData.map_location}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:ring-green-700 focus:border-green-700"
                  />
                </div>
              </div>

              {/* Row 3 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Person
                  </label>
                  <input
                    name="contact_name"
                    placeholder="Enter contact name"
                    value={formData.contact_name}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:ring-green-700 focus:border-green-700"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Phone
                  </label>
                  <input
                    name="contact_phone"
                    placeholder="Phone number"
                    value={formData.contact_phone}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:ring-green-700 focus:border-green-700"
                  />
                </div>
              </div>

              {/* Row 4 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Email
                  </label>
                  <input
                    type="email"
                    name="contact_email"
                    placeholder="Email address"
                    value={formData.contact_email}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:ring-green-700 focus:border-green-700"
                  />
                </div>

                <div></div>
              </div>

              {/* Row 5 - Lat/Lng */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Latitude
                  </label>
                  <input
                    name="latitude"
                    value={formData.latitude}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:ring-green-700 focus:border-green-700"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Longitude
                  </label>
                  <input
                    name="longitude"
                    value={formData.longitude}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:ring-green-700 focus:border-green-700"
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="mt-8 flex gap-4">
                <button
                  onClick={handleSubmit}
                  className="rounded-lg bg-green-700 px-6 py-2 text-sm font-medium text-white hover:bg-green-800 transition"
                >
                  Add Project
                </button>

                <button
                  onClick={() => window.history.back()}
                  className="rounded-lg border border-gray-300 px-6 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 transition"
                >
                  Back
                </button>
              </div>
            </div>
          </div>

          {/* MAP SECTION */}
          <div className="lg:col-span-1">
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm h-96">
              <MapComponent
                lat={parseFloat(formData.latitude)}
                lng={parseFloat(formData.longitude)}
              />
            </div>
          </div>

        </div>
      </div>
    </main>
  </div>
);

}

export default NewProjectPage