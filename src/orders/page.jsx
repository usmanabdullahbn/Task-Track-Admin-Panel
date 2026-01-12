import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Sidebar from "../component/sidebar";
import { FaEdit, FaTrash, FaPrint, FaChevronDown } from "react-icons/fa";
import { apiClient } from "../lib/api-client";
import AddTaskModal from "./AddTaskModal";

const OrdersPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortField, setSortField] = useState("title");
  const [sortOrder, setSortOrder] = useState("asc");
  const [openDropdown, setOpenDropdown] = useState(null);
  const [dropdownSearchTerm, setDropdownSearchTerm] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef(null);

  // Modals & selection
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskOrderId, setTaskOrderId] = useState(null); // which order the modal is creating task for

  // Print preview
  const [printData, setPrintData] = useState(null);
  const [showPrintPreview, setShowPrintPreview] = useState(false);

  // Expand order to show tasks
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [orderTasks, setOrderTasks] = useState({}); // { orderId: [tasks...] }

  // Handler functions for dropdown filtering and sorting
  const handleHeaderClick = (field) => {
    setOpenDropdown(openDropdown === field ? null : field);
    setDropdownSearchTerm("");
  };

  const handleApplyFilter = (field) => {
    // Apply the dropdown search term to the main search
    setSearchTerm(dropdownSearchTerm);
    setOpenDropdown(null);
  };

  const handleSortChange = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
    setOpenDropdown(null);
  };

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenDropdown(null);
        setDropdownSearchTerm("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // -------------------------
  // PRINT DOCUMENT GENERATOR (styled like asset report)
  // -------------------------
  const generatePrintDocument = (o) => {
    if (!o) return "";
    const now = new Date();
    const generatedAt = now.toLocaleString();
    const created = o.created_at
      ? new Date(o.created_at).toLocaleString()
      : "-";
    const cust = o.customer?.name || o.customer_name || o.customer_id || "-";
    const proj =
      o.project?.name ||
      o.project?.title ||
      o.project_name ||
      o.project_id ||
      "-";
    const amt = o.amount?.$numberDecimal ?? o.amount?.value ?? "-";
    const status = o.status || "-";
    const title = o.title || "-";
    const description = o.description
      ? String(o.description).replace(/</g, "&lt;").replace(/>/g, "&gt;")
      : "";

    return `
      <!doctype html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Order Report - ${o.order_number || o._id}</title>
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
                  <div class="title">Order ${o.order_number || o._id}</div>
                  <div class="meta">Generated: ${generatedAt} • Order Number: ${o.order_number || o._id || "-"
      }</div>
                </div>
                <div style="text-align:right">
                  <div style="font-size:12px;color:${status === "Completed"
        ? "#059669"
        : status === "Active"
          ? "#0369a1"
          : "#b45309"
      };font-weight:700">${status}</div>
                  <div style="font-size:12px;color:var(--muted);margin-top:6px">${cust}</div>
                </div>
              </div>

              <div class="grid">
                <div class="item">
                  <div class="label">Title</div>
                  <div class="value">${title}</div>
                </div>
                <div class="item">
                  <div class="label">Customer</div>
                  <div class="value">${cust}</div>
                </div>

                <div class="item">
                  <div class="label">Project</div>
                  <div class="value">${proj}</div>
                </div>
                <div class="item">
                  <div class="label">Amount</div>
                  <div class="value">${amt}</div>
                </div>

                <div class="item">
                  <div class="label">Created At</div>
                  <div class="value">${created}</div>
                </div>
              </div>

              ${description
        ? `<div class="desc"><strong>Description</strong><div style="margin-top:8px">${description}</div></div>`
        : ""
      }

              <table>
                <thead>
                  <tr>
                    <th style="width:40%">Field</th>
                    <th>Value</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td>Title</td><td>${title}</td></tr>
                  <tr><td>Order #</td><td>${o.order_number || "-"}</td></tr>
                  <tr><td>ERP #</td><td>${o.erp_number || "-"}</td></tr>
                  <tr><td>Customer</td><td>${cust}</td></tr>
                  <tr><td>Project</td><td>${proj}</td></tr>
                  <tr><td>Amount</td><td>${amt}</td></tr>
                  <tr><td>Status</td><td>${status}</td></tr>
                  <tr><td>Created</td><td>${created}</td></tr>
                </tbody>
              </table>

              <div class="footer">TaskTrack — Order Report</div>
            </div>
          </div>
        </body>
      </html>
    `;
  };

  // -------------------------
  // GET USER ROLE
  // -------------------------
  const getUserRole = () => {
    try {
      const user = JSON.parse(localStorage.getItem("User"))?.user;
      return (user?.role || "").toLowerCase();
    } catch (err) {
      return "";
    }
  };

  const role = getUserRole();
  const canAddOrder =
    role === "admin" || role === "manager" || role === "supervisor";
  const canEditOrder = role === "admin" || role === "manager";
  const canDeleteOrder = role === "admin" || role === "manager";

  // -------------------------
  // NORMALIZE STATUS FOR COMPARISON
  // -------------------------
  const normalizeStatus = (status) => {
    if (!status) return "";
    // Convert to lowercase and replace spaces/dashes with nothing for comparison
    return status.toLowerCase().replace(/[\s-_]/g, "");
  };

  // -------------------------
  // FETCH DATA (Orders, Customers, Projects)
  // -------------------------
  const fetchData = async (status = "all") => {
    try {
      setLoading(true);

      // Fetch orders
      const ordersData = await apiClient.getOrders();
      let ordersList = Array.isArray(ordersData?.orders) ? ordersData.orders : [];

      // Fetch customers
      const customersData = await apiClient.getCustomers();
      const customersList = Array.isArray(customersData?.customers) ? customersData.customers : [];
      setCustomers(customersList);

      // Fetch projects
      const projectsData = await apiClient.getProjects();
      const projectsList = Array.isArray(projectsData?.projects) ? projectsData.projects : [];
      setProjects(projectsList);

      // Filter by status if specified
      if (status !== "all") {
        const normalizedFilterStatus = normalizeStatus(status);
        ordersList = ordersList.filter(order =>
          normalizeStatus(order.status) === normalizedFilterStatus
        );
      }

      setOrders(ordersList);
    } catch (err) {
      console.error("Failed to fetch data:", err);
      setError(err?.message || "Failed to fetch data");
      setOrders([]);
      setCustomers([]);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const statusParam = searchParams.get("status");
    if (statusParam) {
      setSearchTerm(statusParam);
      fetchData(statusParam);
    } else {
      fetchData("all");
    }
  }, [searchParams]);

  // -------------------------
  // FETCH TASKS FOR ORDER
  // -------------------------
  const fetchTasksForOrder = async (orderId) => {
    if (!orderId) return;
    try {
      const tasks = await apiClient.getTasksByOrderId(orderId);
      const tasksList = Array.isArray(tasks) ? tasks : tasks?.tasks || [];
      setOrderTasks((prev) => ({ ...prev, [orderId]: tasksList }));
    } catch (err) {
      console.error("Failed to fetch tasks for order:", err);
      setOrderTasks((prev) => ({ ...prev, [orderId]: [] }));
    }
  };

  // -------------------------
  // DELETE ORDER
  // -------------------------
  const handleDeleteClick = (order) => {
    setSelectedOrder(order);
    setShowConfirmModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedOrder) return;
    try {
      await apiClient.deleteOrder(selectedOrder._id);
      setOrders((prev) => prev.filter((o) => o._id !== selectedOrder._id));
      setShowConfirmModal(false);
      setShowSuccessModal(true);
    } catch (err) {
      console.error("Failed to delete order:", err);
      setError("Failed to delete order");
      setShowConfirmModal(false);
    }
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    setSelectedOrder(null);
  };

  // -------------------------
  // EXPAND/COLLAPSE ORDER TO SHOW TASKS
  // -------------------------
  const handleExpandOrder = async (orderId) => {
    if (expandedOrderId === orderId) {
      setExpandedOrderId(null);
    } else {
      setExpandedOrderId(orderId);
      // fetch tasks if not loaded
      if (!orderTasks[orderId]) {
        await fetchTasksForOrder(orderId);
      }
    }
  };

  // -------------------------
  // OPEN ADD TASK MODAL (attached to a specific order)
  // -------------------------
  const handleOpenAddTask = (orderId) => {
    setTaskOrderId(orderId);
    setIsTaskModalOpen(true);
  };

  // -------------------------
  // HANDLE SUBMIT FROM ADD TASK MODAL
  // -------------------------
  const handleTaskSubmit = async (taskData) => {
    // taskData comes from AddTaskModal as an object; may contain file_upload (File)
    if (!taskOrderId) {
      console.warn("No order selected for the new task");
      return;
    }

    try {
      // prepare payload - use FormData if file present
      let payloadToSend;
      let config = {};

      if (taskData.file_upload instanceof File) {
        payloadToSend = new FormData();
        payloadToSend.append("title", taskData.title || "");
        payloadToSend.append("description", taskData.description || "");
        if (
          taskData.plan_duration !== undefined &&
          taskData.plan_duration !== ""
        )
          payloadToSend.append("plan_duration", taskData.plan_duration);
        if (taskData.start_time)
          payloadToSend.append("start_time", taskData.start_time);
        if (taskData.end_time)
          payloadToSend.append("end_time", taskData.end_time);
        if (taskData.actual_start_time)
          payloadToSend.append("actual_start_time", taskData.actual_start_time);
        if (taskData.actual_end_time)
          payloadToSend.append("actual_end_time", taskData.actual_end_time);
        payloadToSend.append("priority", taskData.priority || "Medium");
        payloadToSend.append("status", taskData.status || "Todo");
        payloadToSend.append("orderId", taskOrderId);
        payloadToSend.append("file_upload", taskData.file_upload);
        // Note: apiClient.createTask should detect FormData and set headers accordingly.
      } else {
        // no file - send JSON
        payloadToSend = {
          ...taskData,
          orderId: taskOrderId,
        };
        config = { headers: { "Content-Type": "application/json" } };
      }

      // Use your apiClient to create task. Adapt if your apiClient expects a different signature.
      // If apiClient.createTask accepts (payload, config) that's good.
      const created = await apiClient.createTask(payloadToSend, config);

      // Close modal
      setIsTaskModalOpen(false);
      setTaskOrderId(null);

      // Refresh the tasks list for this order
      await fetchTasksForOrder(taskOrderId);

      // Optionally show a success message (you could implement toast)
      console.log("Task created", created);
    } catch (err) {
      console.error("Failed to create task:", err);
      // keep modal open or show error to user
      alert("Failed to create task. Check console for details.");
    }
  };

  const handleDeleteTask = (taskId) => {
    console.log("Delete task:", taskId);
    // Implement delete task logic
  };

  const handlePrintTask = (task) => {
    console.log("Print task:", task);
    // Implement print task logic
  };

  // -------------------------  
  // FILTER & SORT
  // -------------------------
  const filteredOrders = orders.filter((order) => {
    if (!searchTerm) return true;

    // Search across all fields
    const title = order.title || "";
    const orderNumber = order.order_number || "";
    const customer = order.customer?.name || order.customer_name || "";
    const project = order.project?.name || order.project?.title || order.project_name || "";
    const amount = String(order.amount?.value ?? order.amount?.$numberDecimal ?? "");
    const status = normalizeStatus(order.status) || "";
    const search = searchTerm.toLowerCase();

    return (
      title.toLowerCase().includes(search) ||
      orderNumber.toLowerCase().includes(search) ||
      customer.toLowerCase().includes(search) ||
      project.toLowerCase().includes(search) ||
      amount.includes(search) ||
      status.toLowerCase().includes(search)
    );
  });

  // Sort Logic
  const sortedOrders = [...filteredOrders].sort((a, b) => {
    let aValue = "";
    let bValue = "";

    switch (sortField) {
      case "title":
        aValue = a.title || "";
        bValue = b.title || "";
        break;
      case "order_number":
        aValue = a.order_number || "";
        bValue = b.order_number || "";
        break;
      case "customer":
        aValue = a.customer?.name || a.customer_name || "";
        bValue = b.customer?.name || b.customer_name || "";
        break;
      case "project":
        aValue = a.project?.name || a.project?.title || a.project_name || "";
        bValue = b.project?.name || b.project?.title || b.project_name || "";
        break;
      case "amount":
        aValue = String(a.amount?.value ?? a.amount?.$numberDecimal ?? 0);
        bValue = String(b.amount?.value ?? b.amount?.$numberDecimal ?? 0);
        break;
      case "status":
        aValue = normalizeStatus(a.status) || "";
        bValue = normalizeStatus(b.status) || "";
        break;
      case "created_at":
        aValue = a.created_at || "";
        bValue = b.created_at || "";
        break;
      default:
        return 0;
    }

    if (sortOrder === "asc") {
      return aValue.localeCompare(bValue);
    } else {
      return bValue.localeCompare(aValue);
    }
  });

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-50">
      <Sidebar
        className={showConfirmModal || showSuccessModal ? "blur-sm" : ""}
      />

      <main
        className={`flex-1 overflow-y-auto pt-16 md:pt-0 ${showConfirmModal || showSuccessModal ? "blur-sm" : ""
          }`}
      >
        <div className="p-4 sm:p-6 md:p-8">
          {/* HEADER */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Work Orders Management
            </h1>

            {/* ADD ORDER BUTTON */}
            {canAddOrder && (
              <Link
                to="/orders/new"
                className="rounded-lg bg-green-700 px-4 py-2 text-sm font-medium text-white hover:bg-green-800 transition-colors"
              >
                + Add Order
              </Link>
            )}
          </div>

          {/* LOADING / ERROR */}
          {loading && <p className="text-gray-500">Loading orders...</p>}
          {error && <p className="text-red-500">Error: {error}</p>}

          {!loading && !error && (
            <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
              {/* TABLE */}
              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px] text-sm sm:text-base">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="px-4 py-3 text-left font-medium cursor-pointer hover:bg-gray-100 transition-colors relative" onClick={() => handleHeaderClick("title")}>
                        <div className="flex items-center gap-2">
                          Title
                          <FaChevronDown size={12} className={`transition-transform ${openDropdown === "title" ? "rotate-180" : ""}`} />
                        </div>
                        {openDropdown === "title" && (
                          <div ref={dropdownRef} onClick={(e) => e.stopPropagation()} className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-3 z-[9999]" style={{ minWidth: "200px" }}>
                            <div className="space-y-2">
                              <input
                                type="text"
                                placeholder="Search..."
                                value={dropdownSearchTerm}
                                onChange={(e) => setDropdownSearchTerm(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 px-2 py-1 text-xs focus:border-green-700 focus:outline-none focus:ring-1 focus:ring-green-700"
                              />
                              <div className="flex gap-2">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSortChange("title");
                                  }}
                                  className={`flex-1 px-2 py-1 rounded text-xs font-medium transition-colors ${sortField === "title" ? "bg-green-700 text-white" : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                                    }`}
                                >
                                  Sort
                                </button>
                                {sortField === "title" && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                                    }}
                                    className="px-2 py-1 rounded text-xs font-medium bg-blue-700 text-white hover:bg-blue-800"
                                  >
                                    {sortOrder === "asc" ? "↑" : "↓"}
                                  </button>
                                )}
                              </div>
                              <button
                                onClick={() => handleApplyFilter("title")}
                                className="w-full px-2 py-1 rounded bg-green-700 text-white hover:bg-green-800 transition-colors text-xs font-medium"
                              >
                                Apply
                              </button>
                            </div>
                          </div>
                        )}
                      </th>
                      <th className="px-4 py-3 text-left font-medium cursor-pointer hover:bg-gray-100 transition-colors relative" onClick={() => handleHeaderClick("order_number")}>
                        <div className="flex items-center gap-2">
                          Order #
                          <FaChevronDown size={12} className={`transition-transform ${openDropdown === "order_number" ? "rotate-180" : ""}`} />
                        </div>
                        {openDropdown === "order_number" && (
                          <div ref={dropdownRef} onClick={(e) => e.stopPropagation()} className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-3 z-[9999]" style={{ minWidth: "200px" }}>
                            <div className="space-y-2">
                              <input
                                type="text"
                                placeholder="Search..."
                                value={dropdownSearchTerm}
                                onChange={(e) => setDropdownSearchTerm(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 px-2 py-1 text-xs focus:border-green-700 focus:outline-none focus:ring-1 focus:ring-green-700"
                              />
                              <div className="flex gap-2">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSortChange("order_number");
                                  }}
                                  className={`flex-1 px-2 py-1 rounded text-xs font-medium transition-colors ${sortField === "order_number" ? "bg-green-700 text-white" : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                                    }`}
                                >
                                  Sort
                                </button>
                                {sortField === "order_number" && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                                    }}
                                    className="px-2 py-1 rounded text-xs font-medium bg-blue-700 text-white hover:bg-blue-800"
                                  >
                                    {sortOrder === "asc" ? "↑" : "↓"}
                                  </button>
                                )}
                              </div>
                              <button
                                onClick={() => handleApplyFilter("order_number")}
                                className="w-full px-2 py-1 rounded bg-green-700 text-white hover:bg-green-800 transition-colors text-xs font-medium"
                              >
                                Apply
                              </button>
                            </div>
                          </div>
                        )}
                      </th>
                      <th className="px-4 py-3 text-left font-medium cursor-pointer hover:bg-gray-100 transition-colors relative" onClick={() => handleHeaderClick("customer")}>
                        <div className="flex items-center gap-2">
                          Customer
                          <FaChevronDown size={12} className={`transition-transform ${openDropdown === "customer" ? "rotate-180" : ""}`} />
                        </div>
                        {openDropdown === "customer" && (
                          <div ref={dropdownRef} onClick={(e) => e.stopPropagation()} className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-3 z-[9999]" style={{ minWidth: "200px" }}>
                            <div className="space-y-2">
                              <input
                                type="text"
                                placeholder="Search..."
                                value={dropdownSearchTerm}
                                onChange={(e) => setDropdownSearchTerm(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 px-2 py-1 text-xs focus:border-green-700 focus:outline-none focus:ring-1 focus:ring-green-700"
                              />
                              <div className="flex gap-2">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSortChange("customer");
                                  }}
                                  className={`flex-1 px-2 py-1 rounded text-xs font-medium transition-colors ${sortField === "customer" ? "bg-green-700 text-white" : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                                    }`}
                                >
                                  Sort
                                </button>
                                {sortField === "customer" && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                                    }}
                                    className="px-2 py-1 rounded text-xs font-medium bg-blue-700 text-white hover:bg-blue-800"
                                  >
                                    {sortOrder === "asc" ? "↑" : "↓"}
                                  </button>
                                )}
                              </div>
                              <button
                                onClick={() => handleApplyFilter("customer")}
                                className="w-full px-2 py-1 rounded bg-green-700 text-white hover:bg-green-800 transition-colors text-xs font-medium"
                              >
                                Apply
                              </button>
                            </div>
                          </div>
                        )}
                      </th>
                      <th className="px-4 py-3 text-left font-medium cursor-pointer hover:bg-gray-100 transition-colors relative" onClick={() => handleHeaderClick("project")}>
                        <div className="flex items-center gap-2">
                          Project
                          <FaChevronDown size={12} className={`transition-transform ${openDropdown === "project" ? "rotate-180" : ""}`} />
                        </div>
                        {openDropdown === "project" && (
                          <div ref={dropdownRef} onClick={(e) => e.stopPropagation()} className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-3 z-[9999]" style={{ minWidth: "200px" }}>
                            <div className="space-y-2">
                              <input
                                type="text"
                                placeholder="Search..."
                                value={dropdownSearchTerm}
                                onChange={(e) => setDropdownSearchTerm(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 px-2 py-1 text-xs focus:border-green-700 focus:outline-none focus:ring-1 focus:ring-green-700"
                              />
                              <div className="flex gap-2">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSortChange("project");
                                  }}
                                  className={`flex-1 px-2 py-1 rounded text-xs font-medium transition-colors ${sortField === "project" ? "bg-green-700 text-white" : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                                    }`}
                                >
                                  Sort
                                </button>
                                {sortField === "project" && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                                    }}
                                    className="px-2 py-1 rounded text-xs font-medium bg-blue-700 text-white hover:bg-blue-800"
                                  >
                                    {sortOrder === "asc" ? "↑" : "↓"}
                                  </button>
                                )}
                              </div>
                              <button
                                onClick={() => handleApplyFilter("project")}
                                className="w-full px-2 py-1 rounded bg-green-700 text-white hover:bg-green-800 transition-colors text-xs font-medium"
                              >
                                Apply
                              </button>
                            </div>
                          </div>
                        )}
                      </th>
                      {/* <th className="px-4 py-3">ERP #</th> */}
                      <th className="px-4 py-3 text-left font-medium cursor-pointer hover:bg-gray-100 transition-colors relative" onClick={() => handleHeaderClick("amount")}>
                        <div className="flex items-center gap-2">
                          Amount
                          <FaChevronDown size={12} className={`transition-transform ${openDropdown === "amount" ? "rotate-180" : ""}`} />
                        </div>
                        {openDropdown === "amount" && (
                          <div ref={dropdownRef} onClick={(e) => e.stopPropagation()} className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-3 z-[9999]" style={{ minWidth: "200px" }}>
                            <div className="space-y-2">
                              <input
                                type="text"
                                placeholder="Search..."
                                value={dropdownSearchTerm}
                                onChange={(e) => setDropdownSearchTerm(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 px-2 py-1 text-xs focus:border-green-700 focus:outline-none focus:ring-1 focus:ring-green-700"
                              />
                              <div className="flex gap-2">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSortChange("amount");
                                  }}
                                  className={`flex-1 px-2 py-1 rounded text-xs font-medium transition-colors ${sortField === "amount" ? "bg-green-700 text-white" : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                                    }`}
                                >
                                  Sort
                                </button>
                                {sortField === "amount" && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                                    }}
                                    className="px-2 py-1 rounded text-xs font-medium bg-blue-700 text-white hover:bg-blue-800"
                                  >
                                    {sortOrder === "asc" ? "↑" : "↓"}
                                  </button>
                                )}
                              </div>
                              <button
                                onClick={() => handleApplyFilter("amount")}
                                className="w-full px-2 py-1 rounded bg-green-700 text-white hover:bg-green-800 transition-colors text-xs font-medium"
                              >
                                Apply
                              </button>
                            </div>
                          </div>
                        )}
                      </th>
                      <th className="px-4 py-3 text-left font-medium cursor-pointer hover:bg-gray-100 transition-colors relative" onClick={() => handleHeaderClick("status")}>
                        <div className="flex items-center gap-2">
                          Status
                          <FaChevronDown size={12} className={`transition-transform ${openDropdown === "status" ? "rotate-180" : ""}`} />
                        </div>
                        {openDropdown === "status" && (
                          <div ref={dropdownRef} onClick={(e) => e.stopPropagation()} className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-3 z-[9999]" style={{ minWidth: "200px" }}>
                            <div className="space-y-2">
                              <input
                                type="text"
                                placeholder="Search..."
                                value={dropdownSearchTerm}
                                onChange={(e) => setDropdownSearchTerm(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 px-2 py-1 text-xs focus:border-green-700 focus:outline-none focus:ring-1 focus:ring-green-700"
                              />
                              <div className="flex gap-2">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSortChange("status");
                                  }}
                                  className={`flex-1 px-2 py-1 rounded text-xs font-medium transition-colors ${sortField === "status" ? "bg-green-700 text-white" : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                                    }`}
                                >
                                  Sort
                                </button>
                                {sortField === "status" && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                                    }}
                                    className="px-2 py-1 rounded text-xs font-medium bg-blue-700 text-white hover:bg-blue-800"
                                  >
                                    {sortOrder === "asc" ? "↑" : "↓"}
                                  </button>
                                )}
                              </div>
                              <button
                                onClick={() => handleApplyFilter("status")}
                                className="w-full px-2 py-1 rounded bg-green-700 text-white hover:bg-green-800 transition-colors text-xs font-medium"
                              >
                                Apply
                              </button>
                            </div>
                          </div>
                        )}
                      </th>
                      <th className="px-4 py-3 text-left font-medium cursor-pointer hover:bg-gray-100 transition-colors relative" onClick={() => handleHeaderClick("created_at")}>
                        <div className="flex items-center gap-2">
                          Created
                          <FaChevronDown size={12} className={`transition-transform ${openDropdown === "created_at" ? "rotate-180" : ""}`} />
                        </div>
                        {openDropdown === "created_at" && (
                          <div ref={dropdownRef} onClick={(e) => e.stopPropagation()} className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-3 z-[9999]" style={{ minWidth: "200px" }}>
                            <div className="space-y-2">
                              <input
                                type="text"
                                placeholder="Search..."
                                value={dropdownSearchTerm}
                                onChange={(e) => setDropdownSearchTerm(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 px-2 py-1 text-xs focus:border-green-700 focus:outline-none focus:ring-1 focus:ring-green-700"
                              />
                              <div className="flex gap-2">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSortChange("created_at");
                                  }}
                                  className={`flex-1 px-2 py-1 rounded text-xs font-medium transition-colors ${sortField === "created_at" ? "bg-green-700 text-white" : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                                    }`}
                                >
                                  Sort
                                </button>
                                {sortField === "created_at" && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                                    }}
                                    className="px-2 py-1 rounded text-xs font-medium bg-blue-700 text-white hover:bg-blue-800"
                                  >
                                    {sortOrder === "asc" ? "↑" : "↓"}
                                  </button>
                                )}
                              </div>
                              <button
                                onClick={() => handleApplyFilter("created_at")}
                                className="w-full px-2 py-1 rounded bg-green-700 text-white hover:bg-green-800 transition-colors text-xs font-medium"
                              >
                                Apply
                              </button>
                            </div>
                          </div>
                        )}
                      </th>
                      <th className="px-4 py-3">Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {sortedOrders.map((order) => (
                      <tr
                        key={order._id}
                        className="border-b border-gray-200 hover:bg-gray-50 cursor-pointer"
                        onClick={() => navigate(`/orders/details/${order._id}`)}
                      >
                        <td className="px-4 py-3 font-medium text-gray-900">
                          {order.title || "-"}
                        </td>
                        <td className="px-4 py-3">
                          {order.order_number || "-"}
                        </td>
                        <td className="px-4 py-3">
                          {order.customer?.name || "-"}
                        </td>
                        <td className="px-4 py-3">
                          {order.project?.name || order.project?.title || "-"}
                        </td>
                        {/* <td className="px-4 py-3">{order.erp_number || "-"}</td> */}
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

                        <td
                          className="px-4 py-3"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-center gap-2">
                            {/* PRINT BUTTON (per-order) */}
                            <button
                              onClick={() => {
                                setPrintData(order);
                                setShowPrintPreview(true);
                              }}
                              className="w-8 h-8 flex items-center justify-center rounded-md bg-gray-200 hover:bg-gray-300 text-gray-800"
                              title="Print order"
                            >
                              <FaPrint size={14} />
                            </button>

                            {/* EDIT BUTTON (Admin + Manager) */}
                            {canEditOrder && (
                              <Link
                                to={`/orders/${order._id}`}
                                className="w-8 h-8 flex items-center justify-center rounded-md bg-teal-400 hover:bg-teal-500 text-white"
                              >
                                <FaEdit size={14} />
                              </Link>
                            )}

                            {/* DELETE BUTTON (Admin + Manager) */}
                            {canDeleteOrder && (
                              <button
                                onClick={() => handleDeleteClick(order)}
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

              {sortedOrders.length === 0 && (
                <p className="text-center text-gray-500 py-6 sm:text-base">
                  No orders found.
                </p>
              )}
            </div>
          )}
        </div>
      </main>

      {/* CONFIRM DELETE MODAL */}
      {showConfirmModal && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="absolute inset-0 backdrop-blur-sm z-40" />
          <div className="relative bg-white rounded-lg shadow-xl p-6 w-full max-w-sm mx-2 z-50">
            <h2 className="text-lg font-semibold mb-4 text-gray-900">
              Confirm Delete
            </h2>
            <p className="mb-6 text-gray-700">
              Are you sure you want to delete order{" "}
              <span className="font-bold">
                {selectedOrder.order_name || selectedOrder.order_number}
              </span>
              ?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUCCESS DELETE MODAL */}
      {showSuccessModal && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="absolute inset-0 backdrop-blur-sm z-40" />
          <div className="relative bg-white rounded-lg shadow-xl p-6 w-full max-w-sm mx-2 z-50">
            <h2 className="text-lg font-semibold mb-4 text-green-600">
              Success
            </h2>
            <p className="mb-6 text-gray-700">
              Order{" "}
              <span className="font-bold">
                {selectedOrder.order_name || selectedOrder.order_number}
              </span>{" "}
              has been deleted successfully.
            </p>
            <div className="flex justify-end">
              <button
                onClick={handleCloseSuccessModal}
                className="px-4 py-2 rounded bg-green-700 text-white hover:bg-green-800 transition-colors"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PRINT PREVIEW (per-order) */}
      {showPrintPreview && printData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="absolute inset-0 backdrop-blur-sm z-40" />
          <div className="relative bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl mx-2 z-50">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Print Order
              </h2>
              <button
                onClick={() => {
                  setShowPrintPreview(false);
                  setPrintData(null);
                }}
                className="text-2xl text-gray-500"
              >
                ×
              </button>
            </div>

            <div className="h-[70vh] overflow-auto border p-2">
              <iframe
                title="Order Print Preview"
                srcDoc={generatePrintDocument(printData)}
                style={{ width: "100%", height: "100%", border: 0 }}
              />
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => {
                  setShowPrintPreview(false);
                  setPrintData(null);
                }}
                className="px-4 py-2 rounded bg-gray-100 text-gray-700"
              >
                Close
              </button>
              <button
                onClick={() => {
                  const w = window.open("", "_blank", "noopener,noreferrer");
                  w.document.write(generatePrintDocument(printData));
                  w.document.close();
                  w.print();
                }}
                className="px-4 py-2 rounded bg-blue-600 text-white"
              >
                Print
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD TASK MODAL (mounted at page level so overlay works) */}
      {/* <AddTaskModal
        isOpen={isTaskModalOpen}
        orderId={taskOrderId}
        onClose={() => {
          setIsTaskModalOpen(false);
          setTaskOrderId(null);
        }}
        onSubmit={handleTaskSubmit}
      /> */}
    </div>
  );
};

export default OrdersPage;
