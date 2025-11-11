import React, { useState } from "react"
import { customers as mockCustomers } from "../lib/mock-data"
import Sidebar from "../component/sidebar"
import { Link } from "react-router-dom"

const CustomersPage = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const [customers] = useState(mockCustomers)

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase())
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
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Customers</h1>

            <Link
              to="/customers/new"
              className="rounded-lg bg-green-700 px-4 py-2 text-sm font-medium text-white hover:bg-green-800 transition-colors"
            >
              + Add Customer
            </Link>
          </div>

          {/* Search box */}
          <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-200 p-4 sm:p-6">
              <input
                type="text"
                placeholder="Search customers by name or email..."
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
                    <th className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-medium text-gray-700 uppercase">
                      Title
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-medium text-gray-700 uppercase">
                      Email
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-medium text-gray-700 uppercase">
                      Phone
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-medium text-gray-700 uppercase">
                      Address
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-medium text-gray-700 uppercase">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCustomers.map((customer) => (
                    <tr key={customer.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="px-4 sm:px-6 py-3 text-gray-900 font-medium">{customer.title}</td>
                      <td className="px-4 sm:px-6 py-3 text-gray-600">{customer.email}</td>
                      <td className="px-4 sm:px-6 py-3 text-gray-600">{customer.phone}</td>
                      <td className="px-4 sm:px-6 py-3 text-gray-600">{customer.address}</td>
                      <td className="px-4 sm:px-6 py-3">
                        <Link
                          to={`/customers/${customer.id}`}
                          className="text-green-700 hover:text-green-900 font-medium"
                        >
                          Edit
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Empty State */}
            {filteredCustomers.length === 0 && (
              <p className="text-center text-gray-500 py-6 text-sm sm:text-base">
                No customers found.
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

export default CustomersPage
