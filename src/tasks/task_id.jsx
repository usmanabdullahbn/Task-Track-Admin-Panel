import React, { useState } from "react"
import { Link, useParams } from "react-router-dom"
import Sidebar from "../component/sidebar"
import { tasks as mockTasks } from "../lib/mock-data"
import { apiClient } from "../lib/api-client"

const EditTaskPage = () => {
  const { id } = useParams()
  const task = mockTasks.find((t) => String(t.id) === String(id))
  const [formData, setFormData] = useState(task || {})
  const [selectedFiles, setSelectedFiles] = useState([])

  if (!task) {
    return (
      <div className="flex flex-col md:flex-row h-screen bg-gray-50">
        <Sidebar />
        <main className="flex-1 overflow-y-auto pt-16 md:pt-0 p-4 sm:p-6 md:p-8">
          <p className="text-gray-600">Task not found</p>
        </main>
      </div>
    )
  }

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
            <Link to="/tasks" className="text-green-700 hover:text-green-900">
              ← Back
            </Link>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Edit Task</h1>
          </div>

          {/* Form */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm max-w-4xl">
            {/* Form Rows */}
            {[
              ["customer", "Task Title", "title"],
              ["project", "Plan Duration (hours)", "duration"],
              ["startTime", "End Time", "endTime"],
              ["order", "Asset", "asset"],
            ].map(([name1, label2, name2], i) => (
              <div key={i} className={`mt-${i === 0 ? "0" : "6"} grid grid-cols-1 sm:grid-cols-2 gap-6`}>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">{name1}</label>
                  <input
                    type="text"
                    name={name1}
                    value={formData[name1] || ""}
                    onChange={handleInputChange}
                    placeholder={name1 === "startTime" || name1 === "endTime" ? "mm/dd/yyyy --:--" : "Type to search..."}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-green-700 focus:outline-none focus:ring-1 focus:ring-green-700"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{label2}</label>
                  <input
                    type="text"
                    name={name2}
                    value={formData[name2] || ""}
                    onChange={handleInputChange}
                    placeholder={name2 === "startTime" || name2 === "endTime" ? "mm/dd/yyyy --:--" : "Type to search..."}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-green-700 focus:outline-none focus:ring-1 focus:ring-green-700"
                  />
                </div>
              </div>
            ))}

            {/* Completed */}
            <div className="mt-6 grid grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Completed</label>
                <select
                  name="completed"
                  value={formData.completed || "No"}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-green-700 focus:outline-none focus:ring-1 focus:ring-green-700"
                >
                  <option value="No">No</option>
                  <option value="Yes">Yes</option>
                </select>
              </div>
            </div>

            {/* File Upload */}
            <div className="mt-6 grid grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">File Upload</label>
                <input
                  type="file"
                  multiple
                  name="files"
                  onChange={(e) => {
                    const files = Array.from(e.target.files)
                    console.log("Selected files for task update:", files)
                    setSelectedFiles(files)
                  }}
                  className="w-full border-2 border-gray-300 rounded-lg px-4 py-2.5 bg-white text-gray-900 file:bg-green-700 file:text-white file:border-none file:px-4 file:py-2 file:mr-4 file:rounded-md file:cursor-pointer hover:file:bg-green-800 transition cursor-pointer"
                />
                <p className="text-xs text-gray-500 mt-1">You can attach multiple files to the task.</p>
              </div>
            </div>

            {/* Buttons */}
            <div className="mt-8 flex flex-wrap gap-4">
              <button
                onClick={async () => {
                  // Prepare payload similar to create flow. This page uses mock data so this will call API if available.
                  try {
                    const idNum = id
                    const payload = {
                      title: formData.title,
                      description: formData.description,
                      // add more fields as needed
                    }

                    if (selectedFiles && selectedFiles.length > 0) {
                      const fd = new FormData()
                      fd.append('title', payload.title || '')
                      fd.append('description', payload.description || '')
                      selectedFiles.forEach((f) => fd.append('files', f))
                      await apiClient.updateTask(idNum, fd)
                      alert('Task updated with files (server response OK)')
                    } else {
                      await apiClient.updateTask(id, payload)
                      alert('Task updated')
                    }
                  } catch (err) {
                    console.error(err)
                    alert('Failed to update task: ' + (err.message || err))
                  }
                }}
                className="rounded-lg bg-green-700 px-6 py-2 text-sm font-medium text-white hover:bg-green-800 transition-colors"
              >
                Update Task
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

export default EditTaskPage