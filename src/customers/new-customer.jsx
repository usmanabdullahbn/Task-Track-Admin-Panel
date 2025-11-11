import React, { useState, lazy, Suspense } from "react"
import Sidebar from "../component/sidebar"
import { Link } from "react-router-dom"

const MapComponent = lazy(() => import("../component/map"))

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
            <Link to="/customers" className="text-green-700 hover:text-green-900">
              ← Back
            </Link>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Add Customer</h1>
          </div>

          {/* Form and Map */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left - Form */}
            <div className="lg:col-span-2">
              <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                {/* Form Rows */}
                {[
                  ["title", "Company name", "fax", "Fax number"],
                  ["address", "Street address", "email", "Email address"],
                  ["phone", "Phone number", "website", "Website URL"],
                  ["latitude", "Latitude", "longitude", "Longitude"],
                ].map(([name1, placeholder1, name2, placeholder2], i) => (
                  <div key={i} className={`mt-${i === 0 ? "0" : "6"} grid grid-cols-1 sm:grid-cols-2 gap-6`}>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">{name1}</label>
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
                      <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">{name2}</label>
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
            <div className="lg:col-span-1">
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
  )
}

export default NewCustomerPage