import React, { useState } from "react"
import Sidebar from "../component/sidebar"
import MapComponent from "../component/map"

const NewProjectPage = () => {
  const [formData, setFormData] = useState({
    customer: "",
    title: "",
    location: "",
    latitude: "31.3700",
    longitude: "74.2200",
    contactName: "",
    contactPhone: "",
    contactEmail: "",
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="mb-8 flex items-center gap-4">
            <button
              onClick={() => window.history.back()}
              className="text-green-700 hover:text-green-900"
            >
              ← Back
            </button>
            <h1 className="text-3xl font-bold text-gray-900">Add Project</h1>
          </div>

          <div className="grid grid-cols-3 gap-8">
            <div className="col-span-2">
              <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Customer
                    </label>
                    <input
                      type="text"
                      name="customer"
                      placeholder="Customer name"
                      value={formData.customer}
                      onChange={handleInputChange}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-green-700 focus:outline-none focus:ring-1 focus:ring-green-700"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Project Title
                    </label>
                    <input
                      type="text"
                      name="title"
                      placeholder="Project name"
                      value={formData.title}
                      onChange={handleInputChange}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-green-700 focus:outline-none focus:ring-1 focus:ring-green-700"
                    />
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contact Name
                    </label>
                    <input
                      type="text"
                      name="contactName"
                      placeholder="Contact person"
                      value={formData.contactName}
                      onChange={handleInputChange}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-green-700 focus:outline-none focus:ring-1 focus:ring-green-700"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contact Phone
                    </label>
                    <input
                      type="text"
                      name="contactPhone"
                      placeholder="Phone number"
                      value={formData.contactPhone}
                      onChange={handleInputChange}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-green-700 focus:outline-none focus:ring-1 focus:ring-green-700"
                    />
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contact Email
                    </label>
                    <input
                      type="email"
                      name="contactEmail"
                      placeholder="Email address"
                      value={formData.contactEmail}
                      onChange={handleInputChange}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-green-700 focus:outline-none focus:ring-1 focus:ring-green-700"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location
                    </label>
                    <input
                      type="text"
                      name="location"
                      placeholder="Project location"
                      value={formData.location}
                      onChange={handleInputChange}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-green-700 focus:outline-none focus:ring-1 focus:ring-green-700"
                    />
                  </div>
                </div>

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

                <div className="mt-8 flex gap-4">
                  <button className="rounded-lg bg-green-700 px-6 py-2 text-sm font-medium text-white hover:bg-green-800 transition-colors">
                    Add Project
                  </button>
                  <button
                    onClick={() => window.history.back()}
                    className="rounded-lg border border-gray-300 px-6 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Back
                  </button>
                </div>
              </div>
            </div>

            <div className="col-span-1">
              <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm h-96">
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
  )
}

export default NewProjectPage
