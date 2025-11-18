import React, { useState } from "react"
import { useParams, Link } from "react-router-dom"
import Sidebar from "../component/sidebar"
import { employees as mockEmployees } from "../lib/mock-data"


const EmployeeTimelinePage = () => {
  const { id } = useParams() // <-- useParams hook to get the "id" from the URL
  const employee = mockEmployees.find((e) => e.id === id)
  const [selectedCustomer, setSelectedCustomer] = useState("ABC Traders")
  const [selectedTask, setSelectedTask] = useState("Install Equipment")
  const [selectedDate, setSelectedDate] = useState("2025-10-09")

  if (!employee) {
    return (
      <div className="flex flex-col md:flex-row h-screen bg-gray-50">
        <Sidebar />
        <main className="flex-1 overflow-y-auto pt-16 md:pt-0 p-4 sm:p-6 md:p-8">
          <p className="text-gray-600">Employee not found</p>
        </main>
      </div>
    )
  }

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-y-auto pt-16 md:pt-0">
        <div className="p-4 sm:p-6 md:p-8">
          {/* Header */}
          <div className="mb-6 flex flex-wrap items-center gap-4">
            <Link to="/employees" className="text-green-700 hover:text-green-900">
              ← Back
            </Link>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Employee Timeline</h1>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="rounded-lg border border-gray-200 bg-white p-4 sm:p-6 shadow-sm">
              <label className="block text-sm font-medium text-gray-700 mb-2">Customer</label>
              <select
                value={selectedCustomer}
                onChange={(e) => setSelectedCustomer(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-green-700 focus:outline-none focus:ring-1 focus:ring-green-700"
              >
                <option>ABC Traders</option>
                <option>XYZ Corporation</option>
                <option>Iota Beverages</option>
              </select>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-4 sm:p-6 shadow-sm">
              <label className="block text-sm font-medium text-gray-700 mb-2">Task</label>
              <select
                value={selectedTask}
                onChange={(e) => setSelectedTask(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-green-700 focus:outline-none focus:ring-1 focus:ring-green-700"
              >
                <option>Install Equipment</option>
                <option>System Configuration</option>
              </select>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-4 sm:p-6 shadow-sm">
              <label className="block text-sm font-medium text-gray-700 mb-2">Employee</label>
              <div className="px-4 py-2 text-sm text-gray-600 bg-gray-50 rounded-lg border border-gray-300">
                {employee.name}
              </div>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-4 sm:p-6 shadow-sm">
              <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-green-700 focus:outline-none focus:ring-1 focus:ring-green-700"
              />
            </div>
          </div>

          {/* Timeline */}
          <div className="rounded-lg border border-gray-200 bg-white p-4 sm:p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Timeline Map</h2>
              <button className="rounded-lg bg-green-700 px-4 py-2 text-sm font-medium text-white hover:bg-green-800 transition-colors">
                Show Timeline
              </button>
            </div>
            {/* <EmployeeTimeline employee={employee.name} date={selectedDate} /> */}
          </div>
        </div>
      </main>
    </div>
  )
}

export default EmployeeTimelinePage
