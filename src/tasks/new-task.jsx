import React, { useState, useEffect } from "react"
import Sidebar from "../component/sidebar"
import { Link } from "react-router-dom"

const NewTaskPage = () => {
  const [formData, setFormData] = useState({
    customer: "",
    project: "",
    order: "",
    asset: "",
    title: "",
    duration: "",
    startTime: "",
    endTime: "",
    completed: "No",
    file: null,
  })

  const [customers, setCustomers] = useState([])
  const [projects, setProjects] = useState([])
  const [orders, setOrders] = useState([])
  const [assets, setAssets] = useState([])

  // Fetch data from APIs
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [customersRes, projectsRes, ordersRes, assetsRes] = await Promise.all([
          fetch("/api/customers"),
          fetch("/api/projects"),
          fetch("/api/orders"),
          fetch("/api/assets"),
        ])

        const customersData = await customersRes.json()
        const projectsData = await projectsRes.json()
        const ordersData = await ordersRes.json()
        const assetsData = await assetsRes.json()

        setCustomers(customersData)
        setProjects(projectsData)
        setOrders(ordersData)
        setAssets(assetsData)
      } catch (error) {
        console.error("Error fetching data:", error)
      }
    }

    fetchData()
  }, [])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (e) => {
    setFormData((prev) => ({ ...prev, file: e.target.files[0] }))
  }

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-y-auto pt-16 md:pt-0">
        <div className="p-4 sm:p-6 md:p-8">
          <div className="mb-6 flex flex-wrap items-center gap-4">
            <Link to="/tasks" className="text-green-700 hover:text-green-900">
              ← Back
            </Link>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Add Task</h1>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm max-w-4x2">
            {/* Customer Dropdown */}
            <div className="grid grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Customer</label>
                <select
                  name="customer"
                  value={formData.customer}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-green-700 focus:outline-none focus:ring-1 focus:ring-green-700"
                >
                  <option value="">Select Customer</option>
                  {customers.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Project Dropdown */}
            <div className="mt-3 grid grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Project</label>
                <select
                  name="project"
                  value={formData.project}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-green-700 focus:outline-none focus:ring-1 focus:ring-green-700"
                >
                  <option value="">Select Project</option>
                  {projects.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Order Dropdown */}
            <div className="mt-6 grid grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Order</label>
                <select
                  name="order"
                  value={formData.order}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-green-700 focus:outline-none focus:ring-1 focus:ring-green-700"
                >
                  <option value="">Select Order</option>
                  {orders.map((o) => (
                    <option key={o._id} value={o._id}>
                      {o.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Asset Dropdown */}
            <div className="mt-6 grid grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Asset</label>
                <select
                  name="asset"
                  value={formData.asset}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-green-700 focus:outline-none focus:ring-1 focus:ring-green-700"
                >
                  <option value="">Select Asset</option>
                  {assets.map((a) => (
                    <option key={a._id} value={a._id}>
                      {a.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Task Title */}
            <div className="mt-6 grid grid-cols-1 gap-6">
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

            {/* Task Duration */}
            <div className="mt-6 grid grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Duration (Hours)</label>
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

            {/* Start Time */}
            <div className="mt-6 grid grid-cols-1 gap-6">
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
            </div>

            {/* End Time */}
            <div className="mt-6 grid grid-cols-1 gap-6">
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

            {/* Completed */}
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

            {/* File Upload */}
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

            {/* Buttons */}
            <div className="mt-8 flex flex-wrap gap-4">
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

export default NewTaskPage