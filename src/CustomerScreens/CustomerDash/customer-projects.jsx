import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import CustomerSidebar from "./customer-sidebar";
import { apiClient } from "../../lib/api-client";
import { handleExportData } from "../../lib/export-utils";
import { FaExternalLinkAlt, FaPrint, FaFileExcel } from "react-icons/fa";

const CustomerProjects = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState({});
  const [orders, setOrders] = useState([]);
  const [assets, setAssets] = useState([]);
  const [tasks, setTasks] = useState([]);

  // print states
  const [printData, setPrintData] = useState(null);
  const [showPrintPreview, setShowPrintPreview] = useState(false);

  // Get customer ID from localStorage
  const getEmployeeId = () => {
    try {
      const user = JSON.parse(localStorage.getItem("User"));
      const employeeId = user?.user?._id;
      return employeeId || null;
    } catch (e) {
      // console.error("Error parsing User from localStorage:", e);
      return null;
    }
  };

  const employee = JSON.parse(localStorage.getItem("User"))?.user;

  useEffect(() => {
    const fetchData = async () => {
      const employeeId = getEmployeeId();
      if (!employeeId) {
        setError("employee ID not found");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const customerId = employee?.customer?.id || employee?.customerId;
        const [projectsRes, ordersRes, assetsRes, tasksRes] = await Promise.all([
          apiClient.getProjectsByCustomerEmployeeId(employeeId),
          apiClient.getOrdersByCustomerEmployeeId(employeeId),
          apiClient.getAssetsByCustomerEmployeeId(employeeId),
          apiClient.getTasksByCustomerId(customerId),
        ]);

        const projects = Array.isArray(projectsRes) ? projectsRes : (projectsRes.projects || []);
        const orders = Array.isArray(ordersRes) ? ordersRes : (ordersRes.orders || []);
        const assets = Array.isArray(assetsRes) ? assetsRes : (assetsRes.assets || []);
        const tasks = Array.isArray(tasksRes) ? tasksRes : (tasksRes.tasks || []);

        setProjects(projects);
        setOrders(orders);
        setAssets(assets);
        setTasks(tasks);

        const totalProjects = projects.length;
        const activeProjects = projects.filter(p => p.status === "Active").length;
        const completedProjects = projects.filter(p => p.status === "Completed").length;

        const totalOrders = orders.length;
        const pendingOrders = orders.filter(o => o.status === "Pending").length;
        const completedOrders = orders.filter(o => o.status === "Completed").length;

        const totalAssets = assets.length;

        setStats({
          totalProjects,
          activeProjects,
          completedProjects,
          totalOrders,
          pendingOrders,
          completedOrders,
          totalAssets,
        });
      } catch (err) {
        setError(err.message || "Failed to load data");
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // -------------------------
  // PRINT HELPERS (per-project)
  // -------------------------
  const handlePrint = (project) => {
    setPrintData(project);
    setShowPrintPreview(true);
  };

  const closePrintPreview = () => {
    setShowPrintPreview(false);
    setPrintData(null);
  };

  const generatePrintDocument = () => {
    if (!printData) return "";
    const currentDate = new Date().toLocaleDateString();
    const currentTime = new Date().toLocaleTimeString();

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <title>Project Report - ${printData.title || printData.name || "Project"}</title>
        <style>
          body { font-family: Arial, Helvetica, sans-serif; color:#111827; padding:20px; }
          .container { max-width:800px; margin:0 auto; background:#fff; padding:20px; border-radius:8px; }
          h1 { color:#065f46; margin-bottom:4px; }
          .meta { color:#6b7280; margin-bottom:16px; font-size:14px; }
          .grid { display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:14px; }
          .label { font-weight:600; color:#065f46; font-size:12px; text-transform:uppercase; margin-bottom:4px; }
          .value { font-size:15px; color:#111827; }
          .section { margin-top:10px; }
          table { width:100%; border-collapse:collapse; margin-top:12px; }
          th, td { padding:8px; border:1px solid #e5e7eb; text-align:left; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>${printData.title || printData.name || "Project"}</h1>
          <div class="meta">Generated on ${currentDate} at ${currentTime}</div>

          <div class="grid">
            <div>
              <div class="label">Project ID</div>
              <div class="value">${printData._id || printData.id || "N/A"}</div>
            </div>
            <div>
              <div class="label">Status</div>
              <div class="value">${printData.status || "N/A"}</div>
            </div>

            <div>
              <div class="label">Location</div>
              <div class="value">${printData.map_location || "N/A"}</div>
            </div>
            <div>
              <div class="label">Customer</div>
              <div class="value">${(printData.customer && (printData.customer.name || printData.customer)) || "N/A"}</div>
            </div>

            <div>
              <div class="label">Created</div>
              <div class="value">${printData.created_at ? new Date(printData.created_at).toLocaleString() : "N/A"}</div>
            </div>
            <div>
              <div class="label">Modified</div>
              <div class="value">${printData.modified_at ? new Date(printData.modified_at).toLocaleString() : "N/A"}</div>
            </div>
          </div>

          ${printData.description ? `<div class="section"><div class="label">Description</div><div class="value">${printData.description}</div></div>` : ""}
          <div class="section">
            <table>
              <thead>
                <tr><th>Field</th><th>Value</th></tr>
              </thead>
              <tbody>
                <tr><td>Title</td><td>${printData.title || "N/A"}</td></tr>
                <tr><td>Status</td><td>${printData.status || "N/A"}</td></tr>
                <tr><td>Location</td><td>${printData.map_location || "N/A"}</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </body>
      </html>
    `;
  };

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
                          {project.title || project.name || "N/A"}
                        </td>
                        <td className="px-4 sm:px-6 py-3 text-gray-600 max-w-xs truncate">
                          {project.description || project.map_location || "--"}
                        </td>
                        <td className="px-4 sm:px-6 py-3">
                          <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                            project.status === 'Completed' ? 'bg-green-100 text-green-800' :
                            project.status === 'Active' ? 'bg-blue-100 text-blue-800' :
                            project.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {project.status || "N/A"}
                          </span>
                        </td>
                        <td className="px-4 sm:px-6 py-3 text-gray-600">
                          {project.created_at ? new Date(project.created_at).toLocaleDateString() : "--"}
                        </td>
                        <td className="px-4 sm:px-6 py-3 text-gray-600">
                          {project.modified_at ? new Date(project.modified_at).toLocaleDateString() : "--"}
                        </td>
                        
                        <td className="px-4 sm:px-6 py-3 flex items-center gap-2">
                          <button
                            onClick={() => handlePrint(project)}
                            className="w-8 h-8 flex items-center justify-center rounded-md bg-gray-200 hover:bg-gray-300 text-gray-800"
                            title="Print project report"
                          >
                            <FaPrint size={14} />
                          </button>

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

        {/* Export Button - Fixed Bottom Right */}
        <div className="fixed bottom-4 right-4 z-10">
          <button
            onClick={() => handleExportData(employee, tasks)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors shadow-lg"
            title="Export Customer Data"
          >
            <FaFileExcel size={16} />
            Export Data
          </button>
        </div>
      </main>

      {/* PRINT PREVIEW MODAL */}
      {showPrintPreview && printData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="rounded-lg bg-white shadow-lg max-w-2xl w-full mx-4 max-h-[90vh] flex flex-col">
            <div className="border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-900">Print Project Report</h2>
              <button onClick={closePrintPreview} className="text-gray-500 hover:text-gray-700 text-2xl">×</button>
            </div>

            <div className="flex-1 overflow-y-auto">
              <iframe
                srcDoc={generatePrintDocument()}
                title="Project Report Preview"
                className="w-full h-full border-0"
                style={{ minHeight: "600px" }}
              />
            </div>

            <div className="border-t border-gray-200 px-6 py-4 flex gap-3 justify-end">
              <button onClick={closePrintPreview} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">
                Close
              </button>
              <button
                onClick={() => {
                  const w = window.open("", "", "width=800,height=600");
                  w.document.write(generatePrintDocument());
                  w.document.close();
                  w.print();
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600"
              >
                Print
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerProjects;
