import React, { useState, useEffect } from "react"
import Sidebar from "../component/sidebar"
import { Link, useNavigate } from "react-router-dom"
import { apiClient } from "../lib/api-client"

const NewEmployeePage = () => {
  const [formData, setFormData] = useState({
    name: "",
    designation: "",
    email: "",
    phone: "",
    role: "employee",
    customerId: "",
    customerName: "",
  })

  const [customers, setCustomers] = useState([])
  const [loadingCustomers, setLoadingCustomers] = useState(false)

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [showModal, setShowModal] = useState(false)
  const [employeeData, setEmployeeData] = useState(null)

  const navigate = useNavigate()

  // Fetch customers on component mount
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setLoadingCustomers(true)
        const response = await apiClient.getCustomers()
        const customersList = Array.isArray(response)
          ? response
          : response.customers || []
        setCustomers(customersList)
      } catch (err) {
        console.error("Failed to fetch customers:", err)
      } finally {
        setLoadingCustomers(false)
      }
    }

    fetchCustomers()
  }, [])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    
    // If changing customer, auto-populate customer ID and name
    if (name === "customerName") {
      const selectedCustomer = customers.find((c) => c._id === value)
      if (selectedCustomer) {
        setFormData((prev) => ({
          ...prev,
          customerName: selectedCustomer.name,
          customerId: selectedCustomer._id,
        }))
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault()
    setError("")
    setSubmitting(true)

    const emailRe = /^[\w.-]+@[\w.-]+\.\w+$/

    if (!formData.name.trim()) {
      setError("Please provide a User name")
      setSubmitting(false)
      return
    }
    if (!emailRe.test(formData.email)) {
      setError("Please provide a valid email")
      setSubmitting(false)
      return
    }
    if (!formData.designation.trim()) {
      setError("Please provide a designation")
      setSubmitting(false)
      return
    }
    if (!formData.role) {
      setError("Please provide a role")
      setSubmitting(false)
      return
    }
    if (formData.role === "employee" && !formData.customerId) {
      setError("Please select a customer for employee role")
      setSubmitting(false)
      return
    }

    try {
      const payload = { 
        ...formData, 
        role: String(formData.role).toLowerCase(),
        customer: formData.role === "employee" && formData.customerId ? {
          id: formData.customerId,
          name: formData.customerName,
        } : undefined
      }

      // Backend should auto-generate password
      const response = await apiClient.createUser(payload)

      // Set employee data and show modal
      setEmployeeData(response)
      setShowModal(true)
    } catch (err) {
      console.error("createUser error:", err)
      setError(err.message || "Failed to add employee")
    } finally {
      setSubmitting(false)
    }
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEmployeeData(null)
    navigate("/employees")
  }

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-50">
      <Sidebar className={showModal ? "blur-sm" : ""} />
      <main className={`flex-1 overflow-y-auto pt-16 md:pt-0 ${showModal ? "blur-sm" : ""}`}>
        <div className="p-4 sm:p-6 md:p-8">
          <div className="mb-6 flex flex-wrap items-center gap-4">
            <Link to="/employees" className="text-green-700 hover:text-green-900">
              ← Back
            </Link>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Add User</h1>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm max-w-3xl">
            {/* Form Rows */}
            {[
              ["name", "Employee name", "designation", "Job designation"],
              ["email", "Email address", "phone", "Phone number"],
            ].map(([name1, placeholder1, name2, placeholder2], i) => (
              <div key={i} className={`mt-${i === 0 ? "0" : "6"} grid grid-cols-1 sm:grid-cols-2 gap-6`}>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">{name1}</label>
                  <input
                    type={name1 === "email" ? "email" : "text"}
                    name={name1}
                    placeholder={placeholder1}
                    value={formData[name1]}
                    onChange={handleInputChange}
                    required={name1 === "name"}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-green-700 focus:outline-none focus:ring-1 focus:ring-green-700"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">{name2}</label>
                  <input
                    type="text"
                    name={name2}
                    placeholder={placeholder2}
                    value={formData[name2]}
                    onChange={handleInputChange}
                    required={name2 === "designation"}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-green-700 focus:outline-none focus:ring-1 focus:ring-green-700"
                  />
                </div>
              </div>
            ))}

            {/* Role selection */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-green-700 focus:outline-none focus:ring-1 focus:ring-green-700"
                >
                  <option value="admin">Admin</option>
                  <option value="manager">Manager</option>
                  <option value="supervisor">Supervisor</option>
                  <option value="technician">Technician</option>
                  <option value="employee">Customer Employee</option>
                </select>
              </div>

              {/* Customer selection - only show for employees */}
              {formData.role === "employee" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Customer</label>
                  <select
                    name="customerName"
                    value={formData.customerId}
                    onChange={handleInputChange}
                    disabled={loadingCustomers}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-green-700 focus:outline-none focus:ring-1 focus:ring-green-700 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="">Select a customer</option>
                    {customers.map((customer) => (
                      <option key={customer._id} value={customer._id}>
                        {customer.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="mt-8 flex flex-wrap gap-4">
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="rounded-lg bg-green-700 px-6 py-2 text-sm font-medium text-white hover:bg-green-800 transition-colors disabled:opacity-60"
              >
                {submitting ? "Adding..." : "Add Employee"}
              </button>

              {error && <div className="text-sm text-red-600 mt-2">{error}</div>}

              <Link
                to="/employees"
                className="rounded-lg border border-gray-300 px-6 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Back
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Modal */}
      {showModal && employeeData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          {/* Background overlay */}
          <div className="absolute inset-0 backdrop-blur-sm z-40"></div>

          {/* Modal content */}
          <div className="relative bg-white rounded-lg shadow-xl p-6 w-full max-w-sm mx-2 z-50">
            <h2 className="text-lg font-semibold mb-4">Employee Added Successfully</h2>

            <p className="mb-4 text-gray-700">
              The employee has been added successfully. Here are the login credentials:
            </p>

            <p className="mb-2">
              <strong>Email:</strong> {employeeData?.user?.email}
            </p>
            <p className="mb-4">
              <strong>Password:</strong> {employeeData?.password}
            </p>

            <div className="flex justify-end">
              <button
                onClick={handleCloseModal}
                className="px-4 py-2 rounded bg-green-700 text-white hover:bg-green-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default NewEmployeePage
