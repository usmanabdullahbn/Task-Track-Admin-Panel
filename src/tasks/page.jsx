import React, { useState, useMemo } from "react"
import { Link } from "react-router-dom"
import Sidebar from "../component/sidebar"
import { tasks as mockTasks } from "../lib/mock-data"
import { FaEdit, FaTrash } from "react-icons/fa"

const TasksPage = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const [showMore, setShowMore] = useState(false)
  const [filters, setFilters] = useState({
    asset: "",
    employee: "",
    status: "",
    project: "",
    order: "",
    planStart: "",
    planEnd: "",
    actualStart: "",
    actualEnd: "",
  })

  const [tasks] = useState(mockTasks)

  // Extract unique dropdown values
  const uniqueValues = useMemo(() => {
    const assets = [...new Set(tasks.map((t) => t.asset))]
    const employees = [...new Set(tasks.map((t) => t.employee))]
    const statuses = [...new Set(tasks.map((t) => t.completed))]
    const projects = [...new Set(tasks.map((t) => t.project))]
    const orders = [...new Set(tasks.map((t) => t.order))]
    return { assets, employees, statuses, projects, orders }
  }, [tasks])

  // Filter logic
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.customer.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesAsset = !filters.asset || task.asset === filters.asset
    const matchesEmployee = !filters.employee || task.employee === filters.employee
    const matchesStatus = !filters.status || task.completed === filters.status
    const matchesProject = !filters.project || task.project === filters.project
    const matchesOrder = !filters.order || task.order === filters.order

    const matchesPlanStart = !filters.planStart || new Date(task.planStart) >= new Date(filters.planStart)
    const matchesPlanEnd = !filters.planEnd || new Date(task.planEnd) <= new Date(filters.planEnd)
    const matchesActualStart = !filters.actualStart || new Date(task.actualStart) >= new Date(filters.actualStart)
    const matchesActualEnd = !filters.actualEnd || new Date(task.actualEnd) <= new Date(filters.actualEnd)

    return (
      matchesSearch &&
      matchesAsset &&
      matchesEmployee &&
      matchesStatus &&
      matchesProject &&
      matchesOrder &&
      matchesPlanStart &&
      matchesPlanEnd &&
      matchesActualStart &&
      matchesActualEnd
    )
  })

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters((prev) => ({ ...prev, [name]: value }))
  }

  const resetFilters = () => {
    setFilters({
      asset: "",
      employee: "",
      status: "",
      project: "",
      order: "",
      planStart: "",
      planEnd: "",
      actualStart: "",
      actualEnd: "",
    })
    setSearchTerm("")
  }

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <main className="flex-1 overflow-y-auto pt-16 md:pt-0">
        <div className="p-4 sm:p-6 md:p-8">
          {/* Header */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Task Management</h1>
            <Link
              to="/tasks/new"
              className="rounded-lg bg-green-700 px-4 py-2 text-sm font-medium text-white hover:bg-green-800 transition-colors"
            >
              + Add Task
            </Link>
          </div>

          {/* Filters */}
          <div className="rounded-lg border border-gray-200 bg-white shadow-sm mb-6 p-4 sm:p-6 space-y-4">
            {/* Basic Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Search Field */}
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-1">Search</label>
                <input
                  type="text"
                  placeholder="Search by title or customer..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-1 focus:ring-green-700 focus:outline-none"
                />
              </div>

              {/* Asset */}
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-1">Asset</label>
                <select
                  name="asset"
                  value={filters.asset}
                  onChange={handleFilterChange}
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-green-700 focus:outline-none"
                >
                  <option value="">All Assets</option>
                  {uniqueValues.assets.map((a) => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </select>
              </div>

              {/* Employee */}
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-1">Employee</label>
                <select
                  name="employee"
                  value={filters.employee}
                  onChange={handleFilterChange}
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-green-700 focus:outline-none"
                >
                  <option value="">All Employees</option>
                  {uniqueValues.employees.map((e) => (
                    <option key={e} value={e}>{e}</option>
                  ))}
                </select>
              </div>

              {/* Status */}
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  name="status"
                  value={filters.status}
                  onChange={handleFilterChange}
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-green-700 focus:outline-none"
                >
                  <option value="">All Statuses</option>
                  {uniqueValues.statuses.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Collapsible Filters */}
            <div>
              <button
                onClick={() => setShowMore((prev) => !prev)}
                className="text-sm font-medium text-green-700 hover:text-green-900 flex items-center gap-1"
              >
                {showMore ? "− Hide Advanced Filters" : "+ Show Advanced Filters"}
              </button>

              {showMore && (
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Project */}
                  <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-700 mb-1">Project</label>
                    <select
                      name="project"
                      value={filters.project}
                      onChange={handleFilterChange}
                      className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-green-700 focus:outline-none"
                    >
                      <option value="">All Projects</option>
                      {uniqueValues.projects.map((p) => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>

                  {/* Order */}
                  <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-700 mb-1">Order</label>
                    <select
                      name="order"
                      value={filters.order}
                      onChange={handleFilterChange}
                      className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-green-700 focus:outline-none"
                    >
                      <option value="">All Orders</option>
                      {uniqueValues.orders.map((o) => (
                        <option key={o} value={o}>{o}</option>
                      ))}
                    </select>
                  </div>

                  {/* Plan Start */}
                  <div className="flex flex-col">
                    <label htmlFor="planStart" className="text-sm font-medium text-gray-700 mb-1">Plan Start</label>
                    <input
                      id="planStart"
                      type="date"
                      name="planStart"
                      value={filters.planStart}
                      onChange={handleFilterChange}
                      className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-1 focus:ring-green-700 focus:outline-none"
                    />
                  </div>

                  {/* Plan End */}
                  <div className="flex flex-col">
                    <label htmlFor="planEnd" className="text-sm font-medium text-gray-700 mb-1">Plan End</label>
                    <input
                      id="planEnd"
                      type="date"
                      name="planEnd"
                      value={filters.planEnd}
                      onChange={handleFilterChange}
                      className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-1 focus:ring-green-700 focus:outline-none"
                    />
                  </div>

                  {/* Actual Start */}
                  <div className="flex flex-col">
                    <label htmlFor="actualStart" className="text-sm font-medium text-gray-700 mb-1">Actual Start</label>
                    <input
                      id="actualStart"
                      type="date"
                      name="actualStart"
                      value={filters.actualStart}
                      onChange={handleFilterChange}
                      className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-1 focus:ring-green-700 focus:outline-none"
                    />
                  </div>

                  {/* Actual End */}
                  <div className="flex flex-col">
                    <label htmlFor="actualEnd" className="text-sm font-medium text-gray-700 mb-1">Actual End</label>
                    <input
                      id="actualEnd"
                      type="date"
                      name="actualEnd"
                      value={filters.actualEnd}
                      onChange={handleFilterChange}
                      className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-1 focus:ring-green-700 focus:outline-none"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Reset Button */}
            <div className="flex justify-end">
              <button
                onClick={resetFilters}
                className="text-sm font-medium text-gray-700 hover:text-green-700 underline"
              >
                Reset Filters
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-sm sm:text-base">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Title</th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Customer</th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Project</th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Order</th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Asset</th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Employee</th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Duration</th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Completed</th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Created</th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTasks.map((task) => (
                    <tr key={task.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="px-4 sm:px-6 py-3 font-medium text-gray-900">{task.title}</td>
                      <td className="px-4 sm:px-6 py-3 text-gray-600">{task.customer}</td>
                      <td className="px-4 sm:px-6 py-3 text-gray-600">{task.project}</td>
                      <td className="px-4 sm:px-6 py-3 text-gray-600">{task.order}</td>
                      <td className="px-4 sm:px-6 py-3 text-gray-600">{task.asset}</td>
                      <td className="px-4 sm:px-6 py-3 text-gray-600">{task.employee}</td>
                      <td className="px-4 sm:px-6 py-3 text-gray-600">{task.duration}</td>
                      <td className="px-4 sm:px-6 py-3">
                        <span
                          className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${
                            task.completed === "Yes"
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {task.completed}
                        </span>
                      </td>
                      <td className="px-4 sm:px-6 py-3 text-gray-600">{task.created}</td>
<td className="px-4 sm:px-6 py-3">
                        <div className="flex items-center gap-2">
                          {/* Edit Button */}
                          <Link
                            // to={`/customers/${customer._id}`}
                            className="w-8 h-8 flex items-center justify-center rounded-md bg-teal-400 hover:bg-teal-500 text-white text-sm" // brighter teal
                          >
                            <FaEdit size={14} />
                          </Link>

                          {/* Delete Button */}
                          <button
                            onClick={() => handleDelete(customer._id)}
                            className="w-8 h-8 flex items-center justify-center rounded-md bg-red-400 hover:bg-red-500 text-white text-sm" // brighter red
                          >
                            <FaTrash size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Empty State */}
            {filteredTasks.length === 0 && (
              <p className="text-center text-gray-500 py-6">No tasks found.</p>
            )}

            {/* Footer */}
            <div className="border-t border-gray-200 px-4 sm:px-6 py-4 flex justify-between text-sm text-gray-600">
              <p>
                Showing {filteredTasks.length} of {tasks.length} entries
              </p>
              <div className="flex gap-2">
                <button className="text-green-700 hover:text-green-900">Previous</button>
                <button className="text-green-700 hover:text-green-900">1</button>
                <button className="text-green-700 hover:text-green-900">Next</button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default TasksPage
