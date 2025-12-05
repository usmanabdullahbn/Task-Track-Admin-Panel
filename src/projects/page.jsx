import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../component/sidebar";
import { FaEdit, FaTrash } from "react-icons/fa";
import { apiClient } from "../lib/api-client";

const ProjectsPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Delete confirmation modal states
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  // Success modal states
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [deletedProjectName, setDeletedProjectName] = useState("");

  // Get logged-in user's role
  const getUserRole = () => {
    try {
      const user = JSON.parse(localStorage.getItem("User"))?.user;
      return (user?.role || "").toLowerCase();
    } catch (err) {
      return "";
    }
  };

  const role = getUserRole();

  // Role Permissions
  const canAdd = role === "admin" || role === "manager";
  const canEdit = role === "admin" || role === "manager";
  const canDelete = role === "admin";

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const data = await apiClient.getProjects();

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

  const handleDeleteClick = (project) => {
    setProjectToDelete(project);
    setDeleteError("");
  };

  const handleConfirmDelete = async () => {
    if (!projectToDelete) return;
    try {
      setDeleting(true);
      await apiClient.deleteProject(projectToDelete._id);
      setProjects((prev) => prev.filter((p) => p._id !== projectToDelete._id));
      
      // Show success modal
      setDeletedProjectName(projectToDelete.title);
      setShowSuccessModal(true);
      setProjectToDelete(null);
    } catch (err) {
      setDeleteError("Failed to delete project");
      console.error("Failed to delete project:", err);
    } finally {
      setDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setProjectToDelete(null);
    setDeleteError("");
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    setDeletedProjectName("");
  };

  // derive status list for the filter
  const statuses = Array.from(new Set(projects.map((p) => p.status).filter(Boolean)));

  const filteredProjects = projects.filter((project) => {
    const q = (searchTerm || "").trim().toLowerCase();
    if (q) {
      const matches =
        project.title?.toLowerCase().includes(q) ||
        project.customer_id?.toLowerCase().includes(q) ||
        project.customer?.name?.toLowerCase().includes(q) ||
        project.contact_name?.toLowerCase().includes(q) ||
        project.contact_email?.toLowerCase().includes(q);
      if (!matches) return false;
    }

    if (statusFilter && project.status !== statusFilter) return false;

    return true;
  });

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-50">
      <Sidebar className={projectToDelete || showSuccessModal ? "blur-sm" : ""} />

      <main className={`flex-1 overflow-y-auto pt-16 md:pt-0 ${projectToDelete || showSuccessModal ? "blur-sm" : ""}`}>
        <div className="p-4 sm:p-6 md:p-8">
          {/* Header */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Projects
            </h1>

            {/* Add Project Button: Admin + Manager */}
            {canAdd && (
              <Link
                to="/projects/new"
                className="rounded-lg bg-green-700 px-4 py-2 text-sm font-medium text-white hover:bg-green-800 transition-colors"
              >
                + Add Project
              </Link>
            )}
          </div>

          {/* Loading / Error */}
          {loading && <p className="text-gray-500">Loading projects...</p>}
          {error && <p className="text-red-500">Error: {error}</p>}

          {/* Search + Table */}
          {!loading && !error && (
            <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
              <div className="border-b border-gray-200 p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4">
                  <input
                    type="text"
                    placeholder="Search projects by title or customer ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full sm:flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm sm:text-base focus:border-green-700 focus:outline-none focus:ring-1 focus:ring-green-700"
                  />

                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="mt-3 sm:mt-0 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-700 focus:outline-none"
                  >
                    <option value="">All Statuses</option>
                    {statuses.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px] text-sm sm:text-base">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="px-4 py-3 text-left">Title</th>
                      <th className="px-4 py-3 text-left">Customer Name</th>
                      <th className="px-4 py-3 text-left">Contact Name</th>
                      <th className="px-4 py-3 text-left">Contact Email</th>
                      <th className="px-4 py-3 text-left">Contact Phone</th>
                      <th className="px-4 py-3 text-left">Status</th>
                      <th className="px-4 py-3 text-left">Created</th>
                      <th className="px-4 py-3 text-left">Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredProjects.map((project) => (
                      <tr
                        key={project._id}
                        className="border-b border-gray-200 hover:bg-gray-50"
                      >
                        <td className="px-4 py-3 font-medium">
                          {project.title}
                        </td>
                        <td className="px-4 py-3">{project.customer.name}</td>
                        <td className="px-4 py-3">{project.contact_name}</td>
                        <td className="px-4 py-3">{project.contact_email}</td>
                        <td className="px-4 py-3">{project.contact_phone}</td>
                        <td className="px-4 py-3">{project.status}</td>
                        <td className="px-4 py-3">
                          {project.created_at
                            ? new Date(project.created_at).toLocaleDateString()
                            : "-"}
                        </td>

                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">

                            {/* Edit: Admin + Manager */}
                            {canEdit && (
                              <Link
                                to={`/projects/${project._id}`}
                                className="w-8 h-8 flex items-center justify-center rounded-md bg-teal-400 hover:bg-teal-500 text-white"
                              >
                                <FaEdit size={14} />
                              </Link>
                            )}

                            {/* Delete: Admin Only */}
                            {canDelete && (
                              <button
                                onClick={() => handleDeleteClick(project)}
                                className="w-8 h-8 flex items-center justify-center rounded-md bg-red-400 hover:bg-red-500 text-white"
                              >
                                <FaTrash size={14} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredProjects.length === 0 && (
                <p className="text-center text-gray-500 py-6">
                  No projects found.
                </p>
              )}
            </div>
          )}
        </div>
      </main>

      {/* DELETE CONFIRMATION MODAL */}
      {projectToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="absolute inset-0 backdrop-blur-sm z-40"></div>

          <div className="relative bg-white rounded-lg shadow-xl p-6 w-full max-w-sm mx-2 z-50">
            <h2 className="text-lg font-semibold mb-4">Confirm Deletion</h2>
            <p className="mb-4 text-gray-700">
              Are you sure you want to delete <span className="font-bold">{projectToDelete.title}</span>?
            </p>
            {deleteError && <div className="text-red-600 text-sm mb-2">{deleteError}</div>}

            <div className="flex justify-end gap-3">
              <button
                onClick={handleCancelDelete}
                disabled={deleting}
                className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-60"
              >
                Cancel
              </button>

              <button
                onClick={handleConfirmDelete}
                disabled={deleting}
                className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-60"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUCCESS MODAL */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="absolute inset-0 backdrop-blur-sm z-40"></div>

          <div className="relative bg-white rounded-lg shadow-xl p-6 w-full max-w-sm mx-2 z-50">
            <h2 className="text-lg font-semibold mb-4 text-green-600">Success</h2>

            <p className="mb-6 text-gray-700">
              Project <span className="font-bold">{deletedProjectName}</span> has been deleted successfully
            </p>

            <div className="flex justify-end">
              <button
                onClick={handleCloseSuccessModal}
                className="px-4 py-2 rounded bg-green-700 text-white hover:bg-green-800"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectsPage;
