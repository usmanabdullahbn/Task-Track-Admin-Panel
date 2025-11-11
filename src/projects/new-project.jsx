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
    <div className="flex flex-col md:flex-row h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-y-auto pt-16 md:pt-0">
        <div className="p-4 sm:p-6 md:p-8">
          {/* Header */}
          <div className="mb-6 flex flex-wrap items-center gap-4">
            <button
              onClick={() => window.history.back()}
              className="text-green-700 hover:text-green-900"
            >
              ← Back
            </button>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Add Project</h1>
          </div>

          {/* Form and Map */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form Section */}
            <div className="lg:col-span-2">
              <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                {[
                  ["customer", "Customer name", "title", "Project name"],
                  ["contactName", "Contact person", "contactPhone", "Phone number"],
                  ["contactEmail", "Email address", "location", "Project location"],
                  ["latitude", "Latitude", "longitude", "Longitude"],
                ].map(([name1, placeholder1, name2, placeholder2], i) => (
                  <div key={i} className={`mt-${i === 0 ? "0" : "6"} grid grid-cols-1 sm:grid-cols-2 gap-6`}>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">{name1}</label>
                      <input
                        type={name1 === "contactEmail" ? "email" : "text"}
                        name={name1}
                        placeholder={placeholder1}
                        value={formData[name1]}
                        onChange={handleInputChange}
                        className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-green-700 focus:outline-none focus:ring-1 focus:ring-green-700"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">{name2}</label>
                      <input
                        type={name2 === "contactEmail" ? "email" : "text"}
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

            {/* Map Section */}
            <div className="lg:col-span-1">
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