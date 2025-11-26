import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import CustomerSidebar from "./customer-sidebar";
import { apiClient } from "../../lib/api-client";
import { FaExternalLinkAlt } from "react-icons/fa";

const CustomerProjects = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Get customer ID from localStorage
  const getCustomerId = () => {
    try {
      const user = JSON.parse(localStorage.getItem("User"));
      const customerId = user?.customer?._id;
      return customerId || null;
    } catch (e) {
      console.error("Error parsing User from localStorage:", e);
      return null;
    }
  };

  useEffect(() => {
    const fetchProjects = async () => {
      const customerId = getCustomerId();
      if (!customerId) {
        setError("Customer ID not found");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await apiClient.getProjectByCustomerId(customerId);
        setProjects(Array.isArray(data.projects) ? data.projects : data || []);
        console.log("Customer Projects:", data);
      } catch (err) {
        setError(err.message || "Failed to load projects");
        console.error("Error fetching projects:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const filteredProjects = projects.filter(
    (project) =>
      project.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.status?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-50">
      {/* Sidebar */}
      <CustomerSidebar />

      {/* Main content */}
      <main className="flex-1 overflow-y-auto pt-16 md:pt-0">
        <div className="p-4 sm:p-6 md:p-8">
          {/* Header */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Projects
            </h1>
            {/* <Link
              to="/projects/new"
              className="rounded-lg bg-green-700 px-4 py-2 text-sm font-medium text-white hover:bg-green-800 transition-colors"
            >
              + Add Project
            </Link> */}
          </div>

          {/* Search box */}
          <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-200 p-4 sm:p-6">
              <input
                type="text"
                placeholder="Search projects by name, description or status..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm sm:text-base focus:border-green-700 focus:outline-none focus:ring-1 focus:ring-green-700"
              />
            </div>

            {/* Loading State */}
            {loading && (
              <p className="text-center py-6 text-gray-500">Loading projects...</p>
            )}

            {/* Error State */}
            {error && (
              <p className="text-center py-6 text-red-600">{error}</p>
            )}

            {/* Table Wrapper */}
            {!loading && !error && (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px] text-sm sm:text-base">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-medium text-gray-700 uppercase">
                        Project Name
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-medium text-gray-700 uppercase">
                        Description
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-medium text-gray-700 uppercase">
                        Status
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-medium text-gray-700 uppercase">
                        Start Date
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-medium text-gray-700 uppercase">
                        End Date
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-medium text-gray-700 uppercase">
                        Assets
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-medium text-gray-700 uppercase">
                        Orders
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
                          {project.name}
                        </td>
                        <td className="px-4 sm:px-6 py-3 text-gray-600 max-w-xs truncate">
                          {project.description || "--"}
                        </td>
                        <td className="px-4 sm:px-6 py-3">
                          <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                            project.status === 'completed' ? 'bg-green-100 text-green-800' :
                            project.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                            project.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {project.status || "N/A"}
                          </span>
                        </td>
                        <td className="px-4 sm:px-6 py-3 text-gray-600">
                          {project.startDate ? new Date(project.startDate).toLocaleDateString() : "--"}
                        </td>
                        <td className="px-4 sm:px-6 py-3 text-gray-600">
                          {project.endDate ? new Date(project.endDate).toLocaleDateString() : "--"}
                        </td>
                        <td className="px-4 sm:px-6 py-3 text-gray-900 font-medium">
                          {project.assets?.length || 0}
                        </td>
                        <td className="px-4 sm:px-6 py-3 text-gray-900 font-medium">
                          {project.orders?.length || 0}
                        </td>
                        <td className="px-4 sm:px-6 py-3">
                          <button
                            onClick={() => navigate(`/project/${project._id}`)}
                            className="w-8 h-8 flex items-center justify-center rounded-md bg-blue-400 hover:bg-blue-500 text-white text-sm"
                            title="Open project details"
                          >
                            <FaExternalLinkAlt size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Empty State */}
            {!loading && !error && filteredProjects.length === 0 && (
              <p className="text-center text-gray-500 py-6 text-sm sm:text-base">
                No projects found.
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default CustomerProjects;
