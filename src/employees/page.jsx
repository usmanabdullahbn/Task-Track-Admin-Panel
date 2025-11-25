import React, { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import Sidebar from "../component/sidebar"
import { apiClient } from "../lib/api-client"

const EmployeesPage = () => {
  const [employees, setEmployees] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  // Fetch employees (users) from API
useEffect(() => {
  const fetchEmployees = async () => {
    try {
      const response = await apiClient.getUsers()
      console.log("API RESPONSE:", response)

      // Use the correct key from API response
      const usersArray = Array.isArray(response)
        ? response
        : response.Users || []

      setEmployees(usersArray)
    } catch (err) {
      setError(err.message || "Failed to fetch employees")
    } finally {
      setLoading(false)
    }
  }

  fetchEmployees()
}, [])


  const filteredEmployees = employees.filter(
    (employee) =>
      employee.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email?.toLowerCase().includes(searchTerm.toLowerCase())
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

          {/* Error Message */}
          {error && (
            <div className="bg-red-100 border border-red-300 text-red-600 p-3 rounded mb-6">
              {error}
            </div>
          )}

          {/* Search + Table */}
          <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
            
            {/* Search Box */}
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
              {loading ? (
                <div className="text-center py-12">Loading...</div>
              ) : filteredEmployees.length === 0 ? (
                <p className="text-center text-gray-500 py-6 text-sm sm:text-base">
                  No employees found.
                </p>
              ) : (
                <table className="w-full min-w-[600px] text-sm sm:text-base">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="px-4 sm:px-6 py-3 text-left font-medium text-gray-700 uppercase text-xs sm:text-sm">
                        Name
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-left font-medium text-gray-700 uppercase text-xs sm:text-sm">
                        Position
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-left font-medium text-gray-700 uppercase text-xs sm:text-sm">
                        Email
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-left font-medium text-gray-700 uppercase text-xs sm:text-sm">
                        Phone
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-left font-medium text-gray-700 uppercase text-xs sm:text-sm">
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredEmployees.map((employee) => (
                      <tr
                        key={employee._id}
                        className="border-b border-gray-200 hover:bg-gray-50"
                      >
                        <td className="px-4 sm:px-6 py-3 text-gray-900 font-medium">
                          {employee.name}
                        </td>
                        <td className="px-4 sm:px-6 py-3 text-gray-600">
                          {employee.designation || "—"}
                        </td>
                        <td className="px-4 sm:px-6 py-3 text-gray-600">
                          {employee.email}
                        </td>
                        <td className="px-4 sm:px-6 py-3 text-gray-600">
                          {employee.phone || "—"}
                        </td>
                        <td className="px-4 sm:px-6 py-3">
                          <Link
                            to={`/employees/${employee._id}`}
                            className="text-green-700 hover:text-green-900 font-medium"
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

          </div>
        </div>
      </main>
    </div>
  )
}

export default EmployeesPage
