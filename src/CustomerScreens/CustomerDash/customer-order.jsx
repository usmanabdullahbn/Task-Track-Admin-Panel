import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaPrint, FaExternalLinkAlt, FaFileExcel } from "react-icons/fa";
import { apiClient } from "../../lib/api-client";
import { handleExportData } from "../../lib/export-utils";
import CustomerSidebar from "./customer-sidebar";

const CustomerOrder = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [stats, setStats] = useState({});
  const [projects, setProjects] = useState([]);
  const [assets, setAssets] = useState([]);

  // per-order print states
  const [printData, setPrintData] = useState(null);
  const [showPrintPreview, setShowPrintPreview] = useState(false);

  const getEmployeeId = () => {
    try {
      const user = JSON.parse(localStorage.getItem("User"));
      return user?.user?._id || null;
    } catch (e) {
      return null;
    }
  };

  const employee = JSON.parse(localStorage.getItem("User"))?.user;

  // -------------------------
  // FETCH WORK ORDERS
  // -------------------------
  useEffect(() => {
    const fetchData = async () => {
      const employeeId = getEmployeeId();
      if (!employeeId) {
        setError("employee ID not found");
        setOrders([]);
        setProjects([]);
        setAssets([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const [projectsRes, ordersRes, assetsRes] = await Promise.all([
          apiClient.getProjectsByCustomerEmployeeId(employeeId),
          apiClient.getOrdersByCustomerEmployeeId(employeeId),
          apiClient.getAssetsByCustomerEmployeeId(employeeId),
        ]);

        const projects = Array.isArray(projectsRes) ? projectsRes : (projectsRes.projects || []);
        const orders = Array.isArray(ordersRes) ? ordersRes : (ordersRes.orders || []);
        const assets = Array.isArray(assetsRes) ? assetsRes : (assetsRes.assets || []);

        setProjects(projects);
        setOrders(orders);
        setAssets(assets);

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
        setError(err?.message || "Failed to load data");
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // -------------------------
  // FILTERING
  // -------------------------
  const filteredOrders = (orders || []).filter((order) => {
    const orderNumber = (order.order_number || "").toLowerCase();
    const projectName = (
      order.project?.title ||
      order.project?.name ||
      order.project_id ||
      ""
    ).toString().toLowerCase();
    const amount = (order.amount?.$numberDecimal || order.amount?.value || "").toString().toLowerCase();
    const search = (searchTerm || "").toLowerCase();

    return (
      orderNumber.includes(search) ||
      projectName.includes(search) ||
      amount.includes(search)
    );
  });

  // -------------------------
  // PER-ORDER PRINT HELPERS
  // -------------------------
  const handlePrint = (order) => {
    setPrintData(order);
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

    const customerName =
      printData.customer?.name ||
      printData.customer_name ||
      printData.customer_id ||
      "-";
    const projectName =
      printData.project?.title ||
      printData.project?.name ||
      printData.project_name ||
      printData.project_id ||
      "-";
    const amount =
      printData.amount?.$numberDecimal ?? printData.amount?.value ?? "-";

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <title>Order Report - ${printData.order_number || "Order"}</title>
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
          <h1>Order ${printData.order_number || printData._id || ""}</h1>
          <div class="meta">Generated on ${currentDate} at ${currentTime}</div>

          <div class="grid">
            <div>
              <div class="label">Order #</div>
              <div class="value">${printData.order_number || "-"}</div>
            </div>
            <div>
              <div class="label">ERP #</div>
              <div class="value">${printData.erp_number || "-"}</div>
            </div>

            <div>
              <div class="label">Customer</div>
              <div class="value">${customerName}</div>
            </div>
            <div>
              <div class="label">Project</div>
              <div class="value">${projectName}</div>
            </div>

            <div>
              <div class="label">Amount</div>
              <div class="value">${amount}</div>
            </div>
            <div>
              <div class="label">Status</div>
              <div class="value">${printData.status || "-"}</div>
            </div>
          </div>

          ${
            printData.description
              ? `<div class="section"><div class="label">Description</div><div class="value">${printData.description}</div></div>`
              : ""
          }
          <div class="section">
            <table>
              <thead>
                <tr><th>Field</th><th>Value</th></tr>
              </thead>
              <tbody>
                <tr><td>Order #</td><td>${
                  printData.order_number || "-"
                }</td></tr>
                <tr><td>ERP #</td><td>${printData.erp_number || "-"}</td></tr>
                <tr><td>Customer</td><td>${customerName}</td></tr>
                <tr><td>Project</td><td>${projectName}</td></tr>
                <tr><td>Amount</td><td>${amount}</td></tr>
                <tr><td>Created</td><td>${
                  printData.created_at
                    ? new Date(printData.created_at).toLocaleString()
                    : "-"
                }</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </body>
      </html>
    `;
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-50">
      <CustomerSidebar />

      <main
        className={`flex-1 overflow-y-auto pt-16 md:pt-0 ${
          showConfirmModal || showSuccessModal ? "blur-sm" : ""
        }`}
      >
        <div className="p-4 sm:p-6 md:p-8">
          {/* HEADER */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Work Orders
            </h1>
            {/* top print button removed as requested */}
          </div>

          {/* LOADING / ERROR */}
          {loading && <p className="text-gray-500">Loading orders...</p>}
          {error && <p className="text-red-500">Error: {error}</p>}

          {!loading && !error && (
            <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
              {/* SEARCH SECTION */}
              <div className="border-b border-gray-200 p-4 sm:p-6">
                <input
                  type="text"
                  placeholder="Search orders by order number, project, or amount..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm sm:text-base focus:border-green-700 focus:outline-none focus:ring-1 focus:ring-green-700"
                />
              </div>

              {/* TABLE */}
              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px] text-sm sm:text-base">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="px-4 py-3 text-left">Project</th>
                      <th className="px-4 py-3 text-left">Order #</th>
                      <th className="px-4 py-3 text-left">Amount</th>
                      <th className="px-4 py-3 text-left">Status</th>
                      <th className="px-4 py-3 text-left">Created</th>
                      <th className="px-4 py-3 text-left">Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredOrders.map((order) => (
                      <tr
                        key={order._id}
                        className="border-b border-gray-200 hover:bg-gray-50"
                      >
                        <td className="px-4 py-3">
                          {order.project?.title ||
                            order.project?.name ||
                            order.project_name ||
                            order.project_id ||
                            "-"}
                        </td>
                        <td className="px-4 py-3 font-medium text-gray-900">
                          {order.order_number || "-"}
                        </td>
                        <td className="px-4 py-3">
                          {order.amount?.$numberDecimal ??
                            order.amount?.value ??
                            "-"}
                        </td>
                        <td className="px-4 py-3">{order.status || "-"}</td>

                        <td className="px-4 py-3">
                          {order.created_at
                            ? new Date(order.created_at).toLocaleDateString()
                            : "-"}
                        </td>

                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handlePrint(order)}
                              className="w-8 h-8 flex items-center justify-center rounded-md bg-gray-200 hover:bg-gray-300 text-gray-800"
                              title="Print order report"
                            >
                              <FaPrint size={14} />
                            </button>
                            {/* add other per-order actions here */}
                            <button
                              onClick={() =>
                                navigate(`/customer/project/${order.project?._id}`)
                              }
                              className="w-8 h-8 flex items-center justify-center rounded-md bg-blue-400 hover:bg-blue-500 text-white text-sm"
                              title="Open project details"
                            >
                              <FaExternalLinkAlt size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredOrders.length === 0 && (
                <p className="text-center text-gray-500 py-6">No orders found.</p>
              )}
            </div>
          )}
        </div>

        {/* Export Button - Fixed Bottom Right */}
        <div className="fixed bottom-4 right-4 z-10">
          <button
            onClick={() => handleExportData(stats, projects, orders, assets, employee)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors shadow-lg"
            title="Export Customer Data"
          >
            <FaFileExcel size={16} />
            Export Data
          </button>
        </div>
      </main>

      {/* PRINT PREVIEW MODAL (per-order) */}
      {showPrintPreview && printData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="rounded-lg bg-white shadow-lg max-w-2xl w-full mx-4 max-h-[90vh] flex flex-col">
            <div className="border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-900">
                Print Order Report
              </h2>
              <button
                onClick={closePrintPreview}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              <iframe
                srcDoc={generatePrintDocument()}
                title="Order Report Preview"
                className="w-full h-full border-0"
                style={{ minHeight: "600px" }}
              />
            </div>

            <div className="border-t border-gray-200 px-6 py-4 flex gap-3 justify-end">
              <button
                onClick={closePrintPreview}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
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

export default CustomerOrder;
