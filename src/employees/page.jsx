import React, { useState } from "react"
import { Link } from "react-router-dom"
import Sidebar from "../component/sidebar"
import { employees as mockEmployees } from "../lib/mock-data"

const EmployeesPage = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const [employees] = useState(mockEmployees)

  const filteredEmployees = employees.filter(
    (employee) =>
      employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <main className="flex-1 overflow-y-auto pt-16 md:pt-0">
        <div className="p-4 sm:p-6 md:p-8">
          {/* Header */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Employees</h1>
            <Link
              to="/employees/new"
              className="rounded-lg bg-green-700 px-4 py-2 text-sm font-medium text-white hover:bg-green-800 transition-colors"
            >
              + Add Employee
            </Link>
          </div>

          {/* Search box */}
          <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-200 p-4 sm:p-6">
              <input
                type="text"
                placeholder="Search employees by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm sm:text-base focus:border-green-700 focus:outline-none focus:ring-1 focus:ring-green-700"
              />
            </div>

            {/* Table Wrapper */}
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px] text-sm sm:text-base">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-medium text-gray-700 uppercase">Name</th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-medium text-gray-700 uppercase">Position</th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-medium text-gray-700 uppercase">Email</th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-medium text-gray-700 uppercase">Phone</th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-medium text-gray-700 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEmployees.map((employee) => (
                    <tr key={employee.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="px-4 sm:px-6 py-3 text-gray-900 font-medium">{employee.name}</td>
                      <td className="px-4 sm:px-6 py-3 text-gray-600">{employee.position}</td>
                      <td className="px-4 sm:px-6 py-3 text-gray-600">{employee.email}</td>
                      <td className="px-4 sm:px-6 py-3 text-gray-600">{employee.phone}</td>
                      <td className="px-4 sm:px-6 py-3">
                        <Link
                          to={`/employees/${employee.id}`}
                          className="text-green-700 hover:text-green-900 font-medium"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Empty State */}
            {filteredEmployees.length === 0 && (
              <p className="text-center text-gray-500 py-6 text-sm sm:text-base">
                No employees found.
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

export default EmployeesPage