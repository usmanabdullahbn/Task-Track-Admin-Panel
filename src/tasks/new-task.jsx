import React, { useState } from "react"
import Sidebar from "../component/sidebar"
import { Link } from "react-router-dom"

export default function NewTaskPage() {
  const [formData, setFormData] = useState({
    customer: "",
    title: "",
    project: "",
    duration: "",
    startTime: "",
    endTime: "",
    order: "",
    asset: "",
    completed: "No",
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
            <Link to="/tasks" className="text-green-700 hover:text-green-900">
              ← Back
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Add Task</h1>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm max-w-3xl">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Customer</label>
                <input
                  type="text"
                  name="customer"
                  placeholder="Type to search..."
                  value={formData.customer}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-green-700 focus:outline-none focus:ring-1 focus:ring-green-700"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Task Title</label>
                <input
                  type="text"
                  name="title"
                  placeholder="Task title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-green-700 focus:outline-none focus:ring-1 focus:ring-green-700"
                />
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Project</label>
                <input
                  type="text"
                  name="project"
                  placeholder="Type to search..."
                  value={formData.project}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-green-700 focus:outline-none focus:ring-1 focus:ring-green-700"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Plan Duration (hours)</label>
                <input
                  type="text"
                  name="duration"
                  placeholder="Hours"
                  value={formData.duration}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-green-700 focus:outline-none focus:ring-1 focus:ring-green-700"
                />
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Start Time</label>
                <input
                  type="text"
                  name="startTime"
                  placeholder="mm/dd/yyyy --:--"
                  value={formData.startTime}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-green-700 focus:outline-none focus:ring-1 focus:ring-green-700"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">End Time</label>
                <input
                  type="text"
                  name="endTime"
                  placeholder="mm/dd/yyyy --:--"
                  value={formData.endTime}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-green-700 focus:outline-none focus:ring-1 focus:ring-green-700"
                />
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Order</label>
                <input
                  type="text"
                  name="order"
                  placeholder="Type to search..."
                  value={formData.order}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-green-700 focus:outline-none focus:ring-1 focus:ring-green-700"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Asset</label>
                <input
                  type="text"
                  name="asset"
                  placeholder="Type to search..."
                  value={formData.asset}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-green-700 focus:outline-none focus:ring-1 focus:ring-green-700"
                />
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Completed</label>
                <select
                  name="completed"
                  value={formData.completed}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-green-700 focus:outline-none focus:ring-1 focus:ring-green-700"
                >
                  <option>No</option>
                  <option>Yes</option>
                </select>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">File Upload</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-green-700 transition-colors">
                  <p className="text-sm text-gray-600">
                    Choose File <span className="text-gray-400">No file chosen</span>
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 flex gap-4">
              <button className="rounded-lg bg-green-700 px-6 py-2 text-sm font-medium text-white hover:bg-green-800 transition-colors">
                Add Task
              </button>
              <Link
                to="/tasks"
                className="rounded-lg border border-gray-300 px-6 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Back
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
