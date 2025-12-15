import React, { useState } from "react"
import { MapContainer, TileLayer, Marker, Polyline, Popup } from "react-leaflet"
import L from "leaflet"
import Sidebar from "../component/sidebar"
import { Link } from "react-router-dom"
import "leaflet/dist/leaflet.css"

/* Fix default marker icon issue */
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
})

/**
 * DUMMY DATA
 * Backend will later return:
 * {
 *   office: { lat, lng },
 *   tasks: [{ lat, lng, title }]
 * }
 */
const dummyEmployees = [
  {
    id: 1,
    name: "John Doe",
    date: "2025-10-09",
    office: {
      lat: 24.8607,
      lng: 67.0011,
      title: "Head Office",
    },
    tasks: [
      {
        lat: 24.8719,
        lng: 67.0569,
        title: "Install Equipment – ABC Traders",
      },
      {
        lat: 24.8934,
        lng: 67.0286,
        title: "System Configuration – XYZ Corp",
      },
      {
        lat: 24.9051,
        lng: 67.0822,
        title: "Maintenance – Iota Beverages",
      },
    ],
  },
  {
    id: 2,
    name: "Jane Smith",
    date: "2025-10-09",
    office: {
      lat: 24.8607,
      lng: 67.0011,
      title: "Head Office",
    },
    tasks: [
      {
        lat: 24.8800,
        lng: 67.0500,
        title: "Network Setup – Tech Solutions",
      },
      {
        lat: 24.8900,
        lng: 67.0300,
        title: "Software Update – Global Inc",
      },
    ],
  },
  {
    id: 3,
    name: "Bob Johnson",
    date: "2025-10-09",
    office: {
      lat: 24.8607,
      lng: 67.0011,
      title: "Head Office",
    },
    tasks: [
      {
        lat: 24.8700,
        lng: 67.0600,
        title: "Hardware Repair – Quick Fix",
      },
      {
        lat: 24.9000,
        lng: 67.0400,
        title: "Training Session – EduCorp",
      },
      {
        lat: 24.9100,
        lng: 67.0700,
        title: "Audit Check – Secure Ltd",
      },
    ],
  },
]

const EmployeeDayTimelinePage = () => {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(1)
  const [selectedDate, setSelectedDate] = useState("2025-10-09")
  const selectedEmployee = dummyEmployees.find(emp => emp.id === selectedEmployeeId)

  const routePath = [
    [selectedEmployee.office.lat, selectedEmployee.office.lng],
    ...selectedEmployee.tasks.map((t) => [t.lat, t.lng]),
  ]

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />

      <main className="flex-1 overflow-y-auto pt-16 md:pt-0">
        <div className="p-4 sm:p-6 md:p-8">

          {/* Header */}
          <div className="mb-6 flex items-center gap-4">
            <Link to="/employees" className="text-green-700 hover:text-green-900">
              ← Back
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Day Wise Timeline
              </h1>
              <p className="text-sm text-gray-600">
                {selectedEmployee.name} — {selectedDate}
              </p>
            </div>
            <div className="ml-auto flex items-center gap-4">
              <div className="flex items-center gap-2">
                <label htmlFor="date-filter" className="text-sm font-medium text-gray-700">
                  Date:
                </label>
                <input
                  id="date-filter"
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
              <select
                value={selectedEmployeeId}
                onChange={(e) => setSelectedEmployeeId(Number(e.target.value))}
                className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                {dummyEmployees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Map */}
          <div className="rounded-lg border bg-white p-4 shadow-sm mb-6">
            <MapContainer
              center={[
                selectedEmployee.office.lat,
                selectedEmployee.office.lng,
              ]}
              zoom={12}
              style={{ height: "500px", width: "100%" }}
            >
              <TileLayer
                attribution='&copy; OpenStreetMap contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {/* Office Marker */}
              <Marker
                position={[
                  selectedEmployee.office.lat,
                  selectedEmployee.office.lng,
                ]}
              >
                <Popup>
                  <strong>Office</strong>
                </Popup>
              </Marker>

              {/* Task Markers */}
              {selectedEmployee.tasks.map((task, index) => (
                <Marker key={index} position={[task.lat, task.lng]}>
                  <Popup>
                    <strong>Task {index + 1}</strong>
                    <br />
                    {task.title}
                  </Popup>
                </Marker>
              ))}

              {/* Route Line */}
              <Polyline
                positions={routePath}
                pathOptions={{
                  color: "#15803d",
                  weight: 4,
                }}
              />
            </MapContainer>
          </div>

          {/* Task Route List */}
          <div className="rounded-lg border bg-white p-4 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Task Route
            </h2>

            <ol className="space-y-3">
              <li className="flex items-center gap-3">
                <span className="h-6 w-6 rounded-full bg-green-700 text-white flex items-center justify-center text-xs">
                  O
                </span>
                <span className="text-sm text-gray-700">
                  Office (Start Point)
                </span>
              </li>

              {selectedEmployee.tasks.map((task, index) => (
                <li key={index} className="flex items-center gap-3">
                  <span className="h-6 w-6 rounded-full bg-gray-900 text-white flex items-center justify-center text-xs">
                    {index + 1}
                  </span>
                  <span className="text-sm text-gray-700">
                    {task.title}
                  </span>
                </li>
              ))}
            </ol>
          </div>

        </div>
      </main>
    </div>
  )
}

export default EmployeeDayTimelinePage
