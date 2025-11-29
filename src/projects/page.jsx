import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../component/sidebar";
import { FaEdit, FaTrash } from "react-icons/fa";
import { apiClient } from "../lib/api-client"; // ✅ import apiClient

const ProjectsPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ✅ Fetch projects from API
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const data = await apiClient.getProjects();
        console.log("API response:", data);

        // ✅ extract projects array
        setProjects(Array.isArray(data.projects) ? data.projects : []);
      } catch (err) {
        setError(err.message);
        setProjects([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  // ✅ Delete handler
  const handleDelete = async (id) => {
    try {
      await apiClient.deleteProject(id);
      setProjects((prev) => prev.filter((project) => project._id !== id));
    } catch (err) {
      console.error("Failed to delete project:", err);
    }
  };

  // ✅ Filtering logic
  const filteredProjects = projects.filter(
    (project) =>
      project.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.customer_id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <main className="flex-1 overflow-y-auto pt-16 md:pt-0">
        <div className="p-4 sm:p-6 md:p-8">
          {/* Header */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Projects
            </h1>
            <Link
              to="/projects/new"
              className="rounded-lg bg-green-700 px-4 py-2 text-sm font-medium text-white hover:bg-green-800 transition-colors"
            >
              + Add Project
            </Link>
          </div>

          {/* Loading / Error */}
          {loading && <p className="text-gray-500">Loading projects...</p>}
          {error && <p className="text-red-500">Error: {error}</p>}

          {/* Search + Table */}
          {!loading && !error && (
            <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
              <div className="border-b border-gray-200 p-4 sm:p-6">
                <input
                  type="text"
                  placeholder="Search projects by title or customer ID..."
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
                        Customer ID
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-medium text-gray-700 uppercase">
                        Contact Name
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-medium text-gray-700 uppercase">
                        Contact Email
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-medium text-gray-700 uppercase">
                        Contact Phone
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-medium text-gray-700 uppercase">
                        Status
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-medium text-gray-700 uppercase">
                        Created
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-medium text-gray-700 uppercase">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProjects.map((project) => (
                      <tr
                        key={project._id}
                        className="border-b border-gray-200 hover:bg-gray-50"
                      >
                        <td className="px-4 sm:px-6 py-3 text-gray-900 font-medium">
                          {project.title}
                        </td>
                        <td className="px-4 sm:px-6 py-3 text-gray-600">
                          {project.customer_id}
                        </td>
                        <td className="px-4 sm:px-6 py-3 text-gray-600">
                          {project.contact_name}
                        </td>
                        <td className="px-4 sm:px-6 py-3 text-gray-600">
                          {project.contact_email}
                        </td>
                        <td className="px-4 sm:px-6 py-3 text-gray-600">
                          {project.contact_phone}
                        </td>
                        <td className="px-4 sm:px-6 py-3 text-gray-600">
                          {project.status}
                        </td>
                        <td className="px-4 sm:px-6 py-3 text-gray-600">
                          {project.created_at
                            ? new Date(project.created_at).toLocaleDateString()
                            : "-"}
                        </td>
                        <td className="px-4 sm:px-6 py-3">
                          <div className="flex items-center gap-2">
                            {/* Edit Button */}
                            <Link
                              to={`/projects/${project._id}/edit`}
                              className="w-8 h-8 flex items-center justify-center rounded-md bg-teal-400 hover:bg-teal-500 text-white text-sm"
                            >
                              <FaEdit size={14} />
                            </Link>

                            {/* Delete Button */}
                            <button
                              onClick={() => handleDelete(project._id)}
                              className="w-8 h-8 flex items-center justify-center rounded-md bg-red-400 hover:bg-red-500 text-white text-sm"
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
              {filteredProjects.length === 0 && (
                <p className="text-center text-gray-500 py-6 text-sm sm:text-base">
                  No projects found.
                </p>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ProjectsPage;
