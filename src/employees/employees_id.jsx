import React, { useState } from "react"
import { useParams, Link } from "react-router-dom"
import Sidebar from "../component/sidebar"
import EmployeeTimeline from "../component/employee-timeline"

// Dummy data for testing
const dummyEmployees = [
  {
    _id: "1",
    name: "John Doe",
    email: "john@bitsberg.com",
    phone: "0300-1234567",
    position: "Field Technician",
  },
  {
    _id: "2",
    name: "Jane Smith",
    email: "jane@bitsberg.com",
    phone: "0321-9876543",
    position: "Project Manager",
  },
  {
    _id: "3",
    name: "Ahmed Khan",
    email: "ahmed@bitsberg.com",
    phone: "0312-4567890",
    position: "Software Engineer",
  },
  {
    _id: "4",
    name: "Sara Ali",
    email: "sara@bitsberg.com",
    phone: "0333-1234567",
    position: "UI/UX Designer",
  },
  {
    _id: "5",
    name: "Muhammad Rizwan",
    email: "rizwan@bitsberg.com",
    phone: "0345-9876543",
    position: "System Administrator",
  },
]

const dummyEmployeeTimeline = [
  {
    id: "1",
    employeeId: "1", // John Doe
    date: "2025-10-01",
    task: "Install Equipment",
    customer: "ABC Traders",
    project: "Retail Expansion",
    startTime: "09:00",
    endTime: "13:00",
    status: "Completed",
  },
  {
    id: "2",
    employeeId: "1",
    date: "2025-10-02",
    task: "System Configuration",
    customer: "ABC Traders",
    project: "Retail Expansion",
    startTime: "10:00",
    endTime: "13:00",
    status: "Completed",
  },
  {
    id: "3",
    employeeId: "2", // Jane Smith
    date: "2025-10-03",
    task: "Project Planning",
    customer: "XYZ Corporation",
    project: "Warehouse Setup",
    startTime: "09:00",
    endTime: "12:00",
    status: "Completed",
  },
  {
    id: "4",
    employeeId: "3", // Ahmed Khan
    date: "2025-10-04",
    task: "Software Development",
    customer: "Iota Beverages",
    project: "Beverage Bottling SCADA",
    startTime: "10:00",
    endTime: "17:00",
    status: "In Progress",
  },
  {
    id: "5",
    employeeId: "4", // Sara Ali
    date: "2025-10-05",
    task: "UI Design Review",
    customer: "ABC Traders",
    project: "Retail Expansion",
    startTime: "11:00",
    endTime: "15:00",
    status: "Pending",
  },
  {
    id: "6",
    employeeId: "5", // Muhammad Rizwan
    date: "2025-10-06",
    task: "Server Maintenance",
    customer: "XYZ Corporation",
    project: "Warehouse Setup",
    startTime: "08:00",
    endTime: "12:00",
    status: "Completed",
  },
]


const EmployeeTimelinePage = () => {
  const { id } = useParams() // <-- useParams hook to get the "id" from the URL
  const employee = dummyEmployees.find((e) => e._id === id)
  const [selectedCustomer, setSelectedCustomer] = useState("ABC Traders")
  const [selectedTask, setSelectedTask] = useState("Install Equipment")
  const [selectedDate, setSelectedDate] = useState("2025-10-09")

  // Get timeline entries for this employee
  const timelineEntries = dummyEmployeeTimeline.filter(entry => entry.employeeId === id)

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
          <div className="rounded-lg border border-gray-200 bg-white p-4 sm:p-6 shadow-sm mb-6">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Timeline Map</h2>
              <button className="rounded-lg bg-green-700 px-4 py-2 text-sm font-medium text-white hover:bg-green-800 transition-colors">
                Show Timeline
              </button>
            </div>
            <EmployeeTimeline employee={employee.name} date={selectedDate} />
          </div>

          {/* Timeline Entries */}
          <div className="rounded-lg border border-gray-200 bg-white p-4 sm:p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Timeline Entries</h2>

            {timelineEntries.length === 0 ? (
              <p className="text-gray-500">No timeline entries found for this employee.</p>
            ) : (
              <div className="space-y-4">
                {timelineEntries.map((entry) => (
                  <div key={entry.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium text-gray-900">{entry.task}</h3>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        entry.status === 'Completed' ? 'bg-green-100 text-green-800' :
                        entry.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {entry.status}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p><strong>Customer:</strong> {entry.customer}</p>
                      <p><strong>Project:</strong> {entry.project}</p>
                      <p><strong>Date:</strong> {entry.date}</p>
                      <p><strong>Time:</strong> {entry.startTime} - {entry.endTime}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

export default EmployeeTimelinePage
