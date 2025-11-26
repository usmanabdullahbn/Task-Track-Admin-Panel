import React, { useState } from "react"
import Sidebar from "../component/sidebar"
import { Link, useNavigate } from "react-router-dom"
import { apiClient } from "../lib/api-client"

const NewEmployeePage = () => {
  const [formData, setFormData] = useState({
    name: "",
    designation: "",
    email: "",
    phone: "",
    password: "",
    role: "worker",
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const navigate = useNavigate()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault()
    setError("")
    setSubmitting(true)
    // Basic client-side validation matching API requirements
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
    if (!formData.password) {
      setError("Please provide a password")
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
    try {
      // Call API client to create user (employee)
      // Ensure role is sent lowercase (API expects lowercased roles)
      const payload = { ...formData, role: String(formData.role).toLowerCase() }
      await apiClient.createUser(payload)
      // On success navigate back to employees list
      navigate("/employees")
    } catch (err) {
      console.error("createUser error:", err)
      setError(err.message || "Failed to add employee")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-y-auto pt-16 md:pt-0">
        <div className="p-4 sm:p-6 md:p-8">
          <div className="mb-6 flex flex-wrap items-center gap-4">
            <Link to="/employees" className="text-green-700 hover:text-green-900">
              ← Back
            </Link>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Add Employee</h1>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm max-w-3xl">
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
                    type={name2 === "email" ? "email" : "text"}
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

            {/* Role selection required by API */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-green-700 focus:outline-none focus:ring-1 focus:ring-green-700"
                />
              </div>

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
                  <option value="worker">Worker</option>
                </select>
              </div>
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
    </div>
  )
}

export default NewEmployeePage