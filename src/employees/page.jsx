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
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="mb-8 flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">Employees</h1>
            <Link
              to="/employees/new"
              className="rounded-lg bg-green-700 px-4 py-2 text-sm font-medium text-white hover:bg-green-800 transition-colors"
            >
              + Add Employee
            </Link>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-200 p-6">
              <input
                type="text"
                placeholder="Search employees by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-green-700 focus:outline-none focus:ring-1 focus:ring-green-700"
              />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Position</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Phone</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEmployees.map((employee) => (
                    <tr key={employee.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{employee.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{employee.position}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{employee.email}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{employee.phone}</td>
                      <td className="px-6 py-4 text-sm">
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
          </div>
        </div>
      </main>
    </div>
  )
}

export default EmployeesPage
