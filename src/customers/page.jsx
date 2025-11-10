import React, { useState } from "react"
import { customers as mockCustomers } from "../lib/mock-data"
import Sidebar from "../component/sidebar"
import { Link } from "react-router-dom"

const CustomersPage = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const [customers, setCustomers] = useState(mockCustomers)

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="mb-8 flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">Customers</h1>
            <Link
              to="/customers/new"
              className="rounded-lg bg-green-700 px-4 py-2 text-sm font-medium text-white hover:bg-green-800 transition-colors"
            >
              + Add Customer
            </Link>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-200 p-6">
              <input
                type="text"
                placeholder="Search customers by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-green-700 focus:outline-none focus:ring-1 focus:ring-green-700"
              />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Title</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Phone</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Address</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCustomers.map((customer) => (
                    <tr key={customer.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{customer.title}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{customer.email}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{customer.phone}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{customer.address}</td>
                      <td className="px-6 py-4 text-sm">
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
          </div>
        </div>
      </main>
    </div>
  )
}

export default CustomersPage
