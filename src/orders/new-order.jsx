import React, { useState } from "react"
import Sidebar from "../component/sidebar"
import { Link } from "react-router-dom"

const NewOrderPage = () => {
  const [formData, setFormData] = useState({
    orderNumber: "",
    erpNumber: "",
    customer: "",
    project: "",
    amount: "",
    created: new Date().toISOString().split("T")[0],
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-y-auto pt-16 md:pt-0">
        <div className="p-4 sm:p-6 md:p-8">
          <div className="mb-6 flex flex-wrap items-center gap-4">
            <Link to="/orders" className="text-green-700 hover:text-green-900">
              ← Back
            </Link>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Add Order</h1>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm max-w-3xl">
            {[
              ["orderNumber", "Order Number", "erpNumber", "ERP Number"],
              ["customer", "Customer", "project", "Project"],
              ["amount", "Amount", "created", "Created Date"],
            ].map(([name1, label1, name2, label2], i) => (
              <div key={i} className={`mt-${i === 0 ? "0" : "6"} grid grid-cols-1 sm:grid-cols-2 gap-6`}>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{label1}</label>
                  <input
                    type={name1 === "created" ? "date" : "text"}
                    name={name1}
                    placeholder={label1 === "Order Number" ? "e.g., ORD-001" : label1 === "ERP Number" ? "e.g., ERP-9001" : ""}
                    value={formData[name1]}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-green-700 focus:outline-none focus:ring-1 focus:ring-green-700"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{label2}</label>
                  <input
                    type={name2 === "created" ? "date" : "text"}
                    name={name2}
                    placeholder={label2 === "Order Number" ? "e.g., ORD-001" : label2 === "ERP Number" ? "e.g., ERP-9001" : ""}
                    value={formData[name2]}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-green-700 focus:outline-none focus:ring-1 focus:ring-green-700"
                  />
                </div>
              </div>
            ))}

            <div className="mt-8 flex flex-wrap gap-4">
              <button className="rounded-lg bg-green-700 px-6 py-2 text-sm font-medium text-white hover:bg-green-800 transition-colors">
                Add Order
              </button>
              <Link
                to="/orders"
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

export default NewOrderPage