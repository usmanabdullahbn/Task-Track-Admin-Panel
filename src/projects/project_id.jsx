import React, { useState } from "react"
import { Link, useParams } from "react-router-dom"
import Sidebar from "../component/sidebar"
import { projects as mockProjects } from "../component/map"
import MapComponent from "../component/map"

const EditProjectPage = () => {
  const { id } = useParams()
  const project = mockProjects.find((p) => String(p.id) === String(id))
  const [formData, setFormData] = useState(project || {})

  if (!project) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <main className="flex-1 p-8">
          <p className="text-gray-600">Project not found</p>
        </main>
      </div>
    )
  }

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
            <Link to="/projects" className="text-green-700 hover:text-green-900">
              ← Back
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Edit Project</h1>
          </div>

          <div className="grid grid-cols-3 gap-8">
            {/* Left side form */}
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
                      value={formData.customer || ""}
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
                      value={formData.title || ""}
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
                      value={formData.contactName || ""}
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
                      value={formData.contactPhone || ""}
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
                      value={formData.contactEmail || ""}
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
                      value={formData.location || ""}
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

                <div className="mt-8 flex gap-4">
                  <button className="rounded-lg bg-green-700 px-6 py-2 text-sm font-medium text-white hover:bg-green-800 transition-colors">
                    Update
                  </button>
                  <Link
                    to="/projects"
                    className="rounded-lg border border-gray-300 px-6 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Back
                  </Link>
                </div>
              </div>
            </div>

            {/* Right side map */}
            <div className="col-span-1">
              <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm h-96">
                <MapComponent
                  lat={parseFloat(formData.latitude || 0)}
                  lng={parseFloat(formData.longitude || 0)}
                />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default EditProjectPage
