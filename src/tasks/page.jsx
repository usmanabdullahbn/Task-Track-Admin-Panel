import React, { useState } from "react"
import { Link } from "react-router-dom"
import Sidebar from "../component/sidebar"
import { tasks as mockTasks } from "../lib/mock-data"

const TasksPage = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const [tasks] = useState(mockTasks)

  const filteredTasks = tasks.filter(
    (task) =>
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.customer.toLowerCase().includes(searchTerm.toLowerCase())
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
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Task Management</h1>
            <Link
              to="/tasks/new"
              className="rounded-lg bg-green-700 px-4 py-2 text-sm font-medium text-white hover:bg-green-800 transition-colors"
            >
              + Add Task
            </Link>
          </div>

          {/* Table Wrapper */}
          <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
            {/* Search */}
            <div className="border-b border-gray-200 p-4 sm:p-6">
              <input
                type="text"
                placeholder="Search tasks by title or customer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm sm:text-base focus:border-green-700 focus:outline-none focus:ring-1 focus:ring-green-700"
              />
            </div>

            {/* Table Content */}
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-sm sm:text-base">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-medium text-gray-700 uppercase">Title</th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-medium text-gray-700 uppercase">Customer</th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-medium text-gray-700 uppercase">Project</th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-medium text-gray-700 uppercase">Order</th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-medium text-gray-700 uppercase">Asset</th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-medium text-gray-700 uppercase">Duration</th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-medium text-gray-700 uppercase">Completed</th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-medium text-gray-700 uppercase">Created</th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-medium text-gray-700 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTasks.map((task) => (
                    <tr key={task.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="px-4 sm:px-6 py-3 text-gray-900 font-medium">{task.title}</td>
                      <td className="px-4 sm:px-6 py-3 text-gray-600">{task.customer}</td>
                      <td className="px-4 sm:px-6 py-3 text-gray-600">{task.project}</td>
                      <td className="px-4 sm:px-6 py-3 text-gray-600">{task.order}</td>
                      <td className="px-4 sm:px-6 py-3 text-gray-600">{task.asset}</td>
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
                        <Link
                          to={`/tasks/${task.id}`}
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
            {filteredTasks.length === 0 && (
              <p className="text-center text-gray-500 py-6 text-sm sm:text-base">
                No tasks found.
              </p>
            )}

            {/* Footer */}
            <div className="border-t border-gray-200 px-4 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm text-gray-600">
                Showing 1 to {filteredTasks.length} of {tasks.length} entries
              </p>
              <div className="flex gap-2">
                <button className="text-sm text-green-700 hover:text-green-900 font-medium">Previous</button>
                <button className="text-sm text-green-700 hover:text-green-900 font-medium">1</button>
                <button className="text-sm text-green-700 hover:text-green-900 font-medium">Next</button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default TasksPage