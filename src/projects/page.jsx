import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../component/sidebar";
import { FaEdit, FaTrash } from "react-icons/fa";
import { FaPrint } from "react-icons/fa";
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

  // --- PRINT STATES (per-project) ---
  const [printData, setPrintData] = useState(null);
  const [showPrintPreview, setShowPrintPreview] = useState(false);

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

  // --- PRINT HELPERS ---
  const handlePrintClick = (project) => {
    setPrintData(project);
    setShowPrintPreview(true);
  };

  const closePrintPreview = () => {
    setShowPrintPreview(false);
    setPrintData(null);
  };

  const generatePrintDocument = (p) => {
    if (!p) return "";
    const now = new Date();
    const generatedAt = now.toLocaleString();
    const created = p.created_at ? new Date(p.created_at).toLocaleString() : "-";
    const customerName = p.customer?.name || p.customer_name || "-";
    const location = p.map_location || "-";
    const contact = p.contact_name || "-";
    const status = p.status || "-";
    const description = p.description ? String(p.description).replace(/</g, "&lt;").replace(/>/g, "&gt;") : "";

    return `
      <!doctype html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Project Report - ${p.title || p._id}</title>
          <style>
            :root{--bg:#f8fafc;--card:#ffffff;--muted:#6b7280;--accent:#065f46}
            html,body{height:100%;margin:0;background:var(--bg);font-family:Inter,ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,"Helvetica Neue",Arial;}
            .wrap{max-width:900px;margin:24px auto;padding:20px}
            .card{background:var(--card);border-radius:10px;box-shadow:0 6px 18px rgba(15,23,42,0.06);overflow:hidden}
            .header{display:flex;align-items:center;justify-content:space-between;padding:20px 24px;border-bottom:1px solid #eef2f6}
            .title{font-size:20px;color:var(--accent);margin:0;font-weight:700}
            .meta{color:var(--muted);font-size:13px}
            .grid{display:grid;grid-template-columns:repeat(2,1fr);gap:14px;padding:18px 24px}
            .item .label{font-size:11px;color:var(--accent);text-transform:uppercase;font-weight:700;margin-bottom:6px}
            .item .value{font-size:15px;color:#111827}
            .desc{padding:0 24px 18px;color:#111827;font-size:14px;line-height:1.5}
            table{width:100%;border-collapse:collapse;margin:0 24px 24px}
            th,td{padding:10px;border:1px solid #e6eef3;text-align:left;font-size:13px}
            th{background:#fbfdff;color:#374151;font-weight:700;text-transform:none}
            .footer{padding:12px 24px;border-top:1px solid #eef2f6;color:var(--muted);font-size:12px;text-align:right}
            @media print {
              body{background:#fff}
              .wrap{margin:0;padding:0;max-width:100%}
              .card{box-shadow:none;border-radius:0}
              .header .title{font-size:18px}
            }
          </style>
        </head>
        <body>
          <div class="wrap">
            <div class="card">
              <div class="header">
                <div>
                  <div class="title">${(p.title || p.name || "Project").replace(/</g,"&lt;")}</div>
                  <div class="meta">Project ID: ${p._id || "-" } • Generated: ${generatedAt}</div>
                </div>
                <div style="text-align:right">
                  <div style="font-size:12px;color:${status === 'Completed' ? '#059669' : status === 'Active' ? '#0369a1' : '#b45309'};font-weight:700">${status}</div>
                  <div style="font-size:12px;color:var(--muted);margin-top:6px">${customerName}</div>
                </div>
              </div>

              <div class="grid">
                <div class="item">
                  <div class="label">Customer</div>
                  <div class="value">${customerName}</div>
                </div>
                <div class="item">
                  <div class="label">Location</div>
                  <div class="value">${location}</div>
                </div>

                <div class="item">
                  <div class="label">Contact</div>
                  <div class="value">${contact}</div>
                </div>
                <div class="item">
                  <div class="label">Created At</div>
                  <div class="value">${created}</div>
                </div>
              </div>

              ${description ? `<div class="desc"><strong>Description</strong><div style="margin-top:8px">${description}</div></div>` : ""}

              <table>
                <thead>
                  <tr>
                    <th style="width:40%">Field</th>
                    <th>Value</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td>Title</td><td>${(p.title || "-").replace(/</g,"&lt;")}</td></tr>
                  <tr><td>Project ID</td><td>${p._id || "-"}</td></tr>
                  <tr><td>Status</td><td>${status}</td></tr>
                  <tr><td>Customer</td><td>${customerName}</td></tr>
                  <tr><td>Location</td><td>${location}</td></tr>
                  <tr><td>Contact</td><td>${contact}</td></tr>
                  <tr><td>Created</td><td>${created}</td></tr>
                </tbody>
              </table>

              <div class="footer">TaskTrack — Project Report</div>
            </div>
          </div>
        </body>
      </html>
    `;
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
                        <td className="px-4 py-3">{project.customer?.name}</td>
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

                            {/* PRINT (per-project) */}
                            <button
                              onClick={() => handlePrintClick(project)}
                              className="w-8 h-8 flex items-center justify-center rounded-md bg-gray-200 hover:bg-gray-300 text-gray-800"
                              title="Print project"
                            >
                              <FaPrint size={14} />
                            </button>

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

      {/* PRINT PREVIEW (per-project) */}
      {showPrintPreview && printData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="absolute inset-0 backdrop-blur-sm z-40"></div>

          <div className="relative bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl mx-2 z-50">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Print Project</h2>
              <button onClick={closePrintPreview} className="text-2xl text-gray-500">×</button>
            </div>

            <div className="h-[70vh] overflow-auto border p-2">
              <iframe
                title="Project Print Preview"
                srcDoc={generatePrintDocument(printData)}
                style={{ width: "100%", height: "100%", border: 0 }}
              />
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <button onClick={closePrintPreview} className="px-4 py-2 rounded bg-gray-100 text-gray-700">Close</button>
              <button onClick={() => {
                const w = window.open("", "_blank", "noopener,noreferrer");
                w.document.write(generatePrintDocument(printData));
                w.document.close();
                w.print();
              }} className="px-4 py-2 rounded bg-blue-600 text-white">Print</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectsPage;
