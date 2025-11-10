import React, { useState } from "react"
import { Link } from "react-router-dom"
import Sidebar from "../component/sidebar"
import { projects as mockProjects } from "../lib/mock-data"

const ProjectsPage = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const [projects] = useState(mockProjects)

  const filteredProjects = projects.filter(
    (project) =>
      project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.customer.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
            <Link
              to="/projects/new"
              className="rounded-lg bg-green-700 px-4 py-2 text-sm font-medium text-white hover:bg-green-800 transition-colors"
            >
              + Add Project
            </Link>
          </div>

          {/* Search Input */}
          <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-200 p-6">
              <input
                type="text"
                placeholder="Search projects by name or customer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-green-700 focus:outline-none focus:ring-1 focus:ring-green-700"
              />
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Title</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Location</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Contact</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProjects.map((project) => (
                    <tr key={project.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{project.title}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{project.customer}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{project.location}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{project.contactName}</td>
                      <td className="px-6 py-4 text-sm">
                        <Link
                          to={`/projects/${project.id}`}
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

export default ProjectsPage
