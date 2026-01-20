import React, { useState, useMemo, useEffect, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Sidebar from "../component/sidebar";
import { FaEdit, FaTrash, FaChevronDown, FaFilter } from "react-icons/fa";
import { apiClient } from "../lib/api-client";

// Task status options
export const TASK_STATUS = ["Todo", "In Progress", "Completed", "On Hold"];

const TasksPage = () => {
  const [searchParams] = useSearchParams();
  const [filters, setFilters] = useState({
    title: "",
    asset: "",
    employee: "",
    status: "",
    project: "",
    order: "",
    customer: "",
  });

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [sortField, setSortField] = useState("title");
  const [sortOrder, setSortOrder] = useState("asc");
  const [openDropdown, setOpenDropdown] = useState(null);
  const [dropdownSearchTerm, setDropdownSearchTerm] = useState("");
  const dropdownRef = useRef(null);

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

  // AUTH MATRIX
  const canAddTask = ["admin", "manager", "supervisor"].includes(role);
  const canEditTask = ["admin", "manager", "supervisor", "technician"].includes(
    role
  );
  const canDeleteTask = ["admin", "manager"].includes(role);

  // Handler functions for dropdown filtering and sorting
  const handleHeaderClick = (field) => {
    setOpenDropdown(openDropdown === field ? null : field);
    setDropdownSearchTerm(filters[field] || "");
  };

  const handleApplyFilter = (field) => {
    setFilters((prev) => ({ ...prev, [field]: dropdownSearchTerm }));
    setOpenDropdown(null);
  };

  const handleClearFilter = (field) => {
    setFilters((prev) => ({ ...prev, [field]: "" }));
    setOpenDropdown(null);
  };

  const handleInputChange = (field, value) => {
    setDropdownSearchTerm(value);
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

  const openDeleteModal = (task) => {
    setTaskToDelete(task);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setTaskToDelete(null);
  };

  const handleDelete = async (id) => {
    const idToDelete = id;
    setDeletingId(idToDelete);
    try {
      await apiClient.deleteTask(idToDelete);
      setTasks((prev) =>
        prev.filter(
          (task) => (task.id || task._id) !== idToDelete
        )
      );
      closeDeleteModal();
    } catch (err) {
      console.error("Failed to delete task:", err);
    } finally {
      setDeletingId(null);
    }
  };
  // LOAD TASKS
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await apiClient.getTasks();
        console.log("Tasks API Response:", res);
        setTasks(res.tasks || []);
      } catch (err) {
        console.error("Failed to load tasks", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();

    // Apply status filter from query params
    const statusParam = searchParams.get("status");
    if (statusParam && TASK_STATUS.includes(statusParam)) {
      setFilters((prev) => ({ ...prev, status: statusParam }));
    }
  }, [searchParams]);

  // -------------------------
  // UNIQUE VALUES (FIX ADDED)
  // -------------------------

  const uniqueValues = useMemo(() => {
    return {
      assets: tasks.map((t) => t.asset).filter(Boolean),
      employees: tasks.map((t) => t.user).filter(Boolean),
      statuses: [...new Set(tasks.map((t) => t.status))],
      projects: tasks.map((t) => t.project).filter(Boolean),
      orders: tasks.map((t) => t.order).filter(Boolean),
    };
  }, [tasks]);

  // -------------------------
  // FILTER LOGIC
  // -------------------------
  const filteredTasks = tasks.filter((task) => {
    const title = (task.title || "").toLowerCase();
    const filterTitle = (filters.title || "").toLowerCase();
    const matchesTitle = !filterTitle || title.includes(filterTitle);

    const assetId = task.asset?.id || task.asset?._id || "";
    const employeeId = task.user?.id || task.user?._id || "";
    const projectId = task.project?.id || task.project?._id || "";
    const orderId = task.order?.id || task.order?._id || "";
    const customerId = task.customer?.id || task.customer?._id || "";

    const matchesAsset = !filters.asset || assetId === filters.asset;
    const matchesEmployee = !filters.employee || employeeId === filters.employee;
    const matchesStatus =
      !filters.status || task.status === filters.status;
    const matchesProject = !filters.project || projectId === filters.project;
    const matchesOrder = !filters.order || orderId === filters.order;
    const matchesCustomer = !filters.customer || customerId === filters.customer;

    return (
      matchesTitle &&
      matchesAsset &&
      matchesEmployee &&
      matchesStatus &&
      matchesProject &&
      matchesOrder &&
      matchesCustomer
    );
  });

  // -------------------------
  // SORT LOGIC
  // -------------------------
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    let aValue = "";
    let bValue = "";

    switch (sortField) {
      case "title":
        aValue = a.title || "";
        bValue = b.title || "";
        break;
      case "customer":
        aValue = a.customer?.name || "";
        bValue = b.customer?.name || "";
        break;
      case "project":
        aValue = a.project?.name || a.project?.title || "";
        bValue = b.project?.name || b.project?.title || "";
        break;
      case "order":
        aValue = a.order?.title || "";
        bValue = b.order?.title || "";
        break;
      case "asset":
        aValue = a.asset?.name || "";
        bValue = b.asset?.name || "";
        break;
      case "employee":
        aValue = a.user?.name || "";
        bValue = b.user?.name || "";
        break;
      case "status":
        aValue = a.status || "";
        bValue = b.status || "";
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

  const resetFilters = () => {
    setFilters({
      title: "",
      asset: "",
      employee: "",
      status: "",
      project: "",
      order: "",
      customer: "",
    });
    setSortField("title");
    setSortOrder("asc");
    setOpenDropdown(null);
    setDropdownSearchTerm("");
  };

  // -------------------------
  // JSX BELOW (FULL + FIXED)
  // -------------------------

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-50">
      <Sidebar />

      <main className="flex-1 overflow-y-auto pt-16 md:pt-0">
        <div className="p-4 sm:p-6 md:p-8">
          {/* HEADER */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Tasks
            </h1>
          </div>



          {/* TABLE */}
          <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-sm sm:text-base">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className={`px-4 py-3 text-left font-medium cursor-pointer hover:bg-gray-100 transition-colors relative ${filters.title ? "bg-blue-100" : ""}`} onClick={() => handleHeaderClick("title")}>
                      <div className="flex items-center gap-2">
                        Title
                        {filters.title && <FaFilter size={12} className="text-blue-600" />}
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
                              onKeyDown={(e) => { if (e.key === 'Enter') handleApplyFilter("title"); }}
                              className="w-full rounded-lg border border-gray-300 px-2 py-1 text-xs focus:border-green-700 focus:outline-none focus:ring-1 focus:ring-green-700"
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSortChange("title");
                                }}
                                className={`flex-1 px-2 py-1 rounded text-xs font-medium transition-colors ${sortField === "title" ? "bg-green-700 text-white" : "bg-gray-200 text-gray-800 hover:bg-gray-300"}`}
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
                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  setFilters(prev => ({ ...prev, title: "" }));
                                  setOpenDropdown(null);
                                }}
                                className="flex-1 px-2 py-1 rounded text-xs font-medium bg-red-500 text-white hover:bg-red-600 transition-colors"
                              >
                                Clear
                              </button>
                              <button
                                onClick={() => handleApplyFilter("title")}
                                className="flex-1 px-2 py-1 rounded bg-green-700 text-white hover:bg-green-800 transition-colors text-xs font-medium"
                              >
                                Apply
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </th>
                    <th className={`px-4 py-3 text-left font-medium cursor-pointer hover:bg-gray-100 transition-colors relative ${filters.customer ? "bg-blue-100" : ""}`} onClick={() => handleHeaderClick("customer")}>
                      <div className="flex items-center gap-2">
                        Customer
                        {filters.customer && <FaFilter size={12} className="text-blue-600" />}
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
                              onKeyDown={(e) => { if (e.key === 'Enter') handleApplyFilter("customer"); }}
                              className="w-full rounded-lg border border-gray-300 px-2 py-1 text-xs focus:border-green-700 focus:outline-none focus:ring-1 focus:ring-green-700"
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSortChange("customer");
                                }}
                                className={`flex-1 px-2 py-1 rounded text-xs font-medium transition-colors ${sortField === "customer" ? "bg-green-700 text-white" : "bg-gray-200 text-gray-800 hover:bg-gray-300"}`}
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
                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  setFilters(prev => ({ ...prev, customer: "" }));
                                  setOpenDropdown(null);
                                }}
                                className="flex-1 px-2 py-1 rounded text-xs font-medium bg-red-500 text-white hover:bg-red-600 transition-colors"
                              >
                                Clear
                              </button>
                              <button
                                onClick={() => handleApplyFilter("customer")}
                                className="flex-1 px-2 py-1 rounded bg-green-700 text-white hover:bg-green-800 transition-colors text-xs font-medium"
                              >
                                Apply
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </th>
                    <th className={`px-4 py-3 text-left font-medium cursor-pointer hover:bg-gray-100 transition-colors relative ${filters.project ? "bg-blue-100" : ""}`} onClick={() => handleHeaderClick("project")}>
                      <div className="flex items-center gap-2">
                        Project
                        {filters.project && <FaFilter size={12} className="text-blue-600" />}
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
                              onKeyDown={(e) => { if (e.key === 'Enter') handleApplyFilter("project"); }}
                              className="w-full rounded-lg border border-gray-300 px-2 py-1 text-xs focus:border-green-700 focus:outline-none focus:ring-1 focus:ring-green-700"
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSortChange("project");
                                }}
                                className={`flex-1 px-2 py-1 rounded text-xs font-medium transition-colors ${sortField === "project" ? "bg-green-700 text-white" : "bg-gray-200 text-gray-800 hover:bg-gray-300"}`}
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
                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  setFilters(prev => ({ ...prev, project: "" }));
                                  setOpenDropdown(null);
                                }}
                                className="flex-1 px-2 py-1 rounded text-xs font-medium bg-red-500 text-white hover:bg-red-600 transition-colors"
                              >
                                Clear
                              </button>
                              <button
                                onClick={() => handleApplyFilter("project")}
                                className="flex-1 px-2 py-1 rounded bg-green-700 text-white hover:bg-green-800 transition-colors text-xs font-medium"
                              >
                                Apply
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </th>
                    <th className={`px-4 py-3 text-left font-medium cursor-pointer hover:bg-gray-100 transition-colors relative ${filters.order ? "bg-blue-100" : ""}`} onClick={() => handleHeaderClick("order")}>
                      <div className="flex items-center gap-2">
                        Order
                        {filters.order && <FaFilter size={12} className="text-blue-600" />}
                        <FaChevronDown size={12} className={`transition-transform ${openDropdown === "order" ? "rotate-180" : ""}`} />
                      </div>
                      {openDropdown === "order" && (
                        <div ref={dropdownRef} onClick={(e) => e.stopPropagation()} className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-3 z-[9999]" style={{ minWidth: "200px" }}>
                          <div className="space-y-2">
                            <input
                              type="text"
                              placeholder="Search..."
                              value={dropdownSearchTerm}
                              onChange={(e) => setDropdownSearchTerm(e.target.value)}
                              onKeyDown={(e) => { if (e.key === 'Enter') handleApplyFilter("order"); }}
                              className="w-full rounded-lg border border-gray-300 px-2 py-1 text-xs focus:border-green-700 focus:outline-none focus:ring-1 focus:ring-green-700"
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSortChange("order");
                                }}
                                className={`flex-1 px-2 py-1 rounded text-xs font-medium transition-colors ${sortField === "order" ? "bg-green-700 text-white" : "bg-gray-200 text-gray-800 hover:bg-gray-300"}`}
                              >
                                Sort
                              </button>
                              {sortField === "order" && (
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
                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  setFilters(prev => ({ ...prev, order: "" }));
                                  setOpenDropdown(null);
                                }}
                                className="flex-1 px-2 py-1 rounded text-xs font-medium bg-red-500 text-white hover:bg-red-600 transition-colors"
                              >
                                Clear
                              </button>
                              <button
                                onClick={() => handleApplyFilter("order")}
                                className="flex-1 px-2 py-1 rounded bg-green-700 text-white hover:bg-green-800 transition-colors text-xs font-medium"
                              >
                                Apply
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </th>
                    <th className={`px-4 py-3 text-left font-medium cursor-pointer hover:bg-gray-100 transition-colors relative ${filters.asset ? "bg-blue-100" : ""}`} onClick={() => handleHeaderClick("asset")}>
                      <div className="flex items-center gap-2">
                        Asset
                        {filters.asset && <FaFilter size={12} className="text-blue-600" />}
                        <FaChevronDown size={12} className={`transition-transform ${openDropdown === "asset" ? "rotate-180" : ""}`} />
                      </div>
                      {openDropdown === "asset" && (
                        <div ref={dropdownRef} onClick={(e) => e.stopPropagation()} className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-3 z-[9999]" style={{ minWidth: "200px" }}>
                          <div className="space-y-2">
                            <input
                              type="text"
                              placeholder="Search..."
                              value={dropdownSearchTerm}
                              onChange={(e) => setDropdownSearchTerm(e.target.value)}
                              onKeyDown={(e) => { if (e.key === 'Enter') handleApplyFilter("asset"); }}
                              className="w-full rounded-lg border border-gray-300 px-2 py-1 text-xs focus:border-green-700 focus:outline-none focus:ring-1 focus:ring-green-700"
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSortChange("asset");
                                }}
                                className={`flex-1 px-2 py-1 rounded text-xs font-medium transition-colors ${sortField === "asset" ? "bg-green-700 text-white" : "bg-gray-200 text-gray-800 hover:bg-gray-300"}`}
                              >
                                Sort
                              </button>
                              {sortField === "asset" && (
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
                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  setFilters(prev => ({ ...prev, asset: "" }));
                                  setOpenDropdown(null);
                                }}
                                className="flex-1 px-2 py-1 rounded text-xs font-medium bg-red-500 text-white hover:bg-red-600 transition-colors"
                              >
                                Clear
                              </button>
                              <button
                                onClick={() => handleApplyFilter("asset")}
                                className="flex-1 px-2 py-1 rounded bg-green-700 text-white hover:bg-green-800 transition-colors text-xs font-medium"
                              >
                                Apply
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </th>
                    <th className={`px-4 py-3 text-left font-medium cursor-pointer hover:bg-gray-100 transition-colors relative ${filters.employee ? "bg-blue-100" : ""}`} onClick={() => handleHeaderClick("employee")}>
                      <div className="flex items-center gap-2">
                        Employee
                        {filters.employee && <FaFilter size={12} className="text-blue-600" />}
                        <FaChevronDown size={12} className={`transition-transform ${openDropdown === "employee" ? "rotate-180" : ""}`} />
                      </div>
                      {openDropdown === "employee" && (
                        <div ref={dropdownRef} onClick={(e) => e.stopPropagation()} className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-3 z-[9999]" style={{ minWidth: "200px" }}>
                          <div className="space-y-2">
                            <input
                              type="text"
                              placeholder="Search..."
                              value={dropdownSearchTerm}
                              onChange={(e) => setDropdownSearchTerm(e.target.value)}
                              onKeyDown={(e) => { if (e.key === 'Enter') handleApplyFilter("employee"); }}
                              className="w-full rounded-lg border border-gray-300 px-2 py-1 text-xs focus:border-green-700 focus:outline-none focus:ring-1 focus:ring-green-700"
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSortChange("employee");
                                }}
                                className={`flex-1 px-2 py-1 rounded text-xs font-medium transition-colors ${sortField === "employee" ? "bg-green-700 text-white" : "bg-gray-200 text-gray-800 hover:bg-gray-300"}`}
                              >
                                Sort
                              </button>
                              {sortField === "employee" && (
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
                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  setFilters(prev => ({ ...prev, employee: "" }));
                                  setOpenDropdown(null);
                                }}
                                className="flex-1 px-2 py-1 rounded text-xs font-medium bg-red-500 text-white hover:bg-red-600 transition-colors"
                              >
                                Clear
                              </button>
                              <button
                                onClick={() => handleApplyFilter("employee")}
                                className="flex-1 px-2 py-1 rounded bg-green-700 text-white hover:bg-green-800 transition-colors text-xs font-medium"
                              >
                                Apply
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </th>
                    <th className={`px-4 py-3 text-left font-medium cursor-pointer hover:bg-gray-100 transition-colors relative ${filters.status ? "bg-blue-100" : ""}`} onClick={() => handleHeaderClick("status")}>
                      <div className="flex items-center gap-2">
                        Status
                        {filters.status && <FaFilter size={12} className="text-blue-600" />}
                        <FaChevronDown size={12} className={`transition-transform ${openDropdown === "status" ? "rotate-180" : ""}`} />
                      </div>
                      {openDropdown === "status" && (
                        <div ref={dropdownRef} onClick={(e) => e.stopPropagation()} className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-3 z-[9999]" style={{ minWidth: "200px" }}>
                          <div className="space-y-2">
                            <div className="flex gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSortChange("status");
                                }}
                                className={`flex-1 px-2 py-1 rounded text-xs font-medium transition-colors ${sortField === "status" ? "bg-green-700 text-white" : "bg-gray-200 text-gray-800 hover:bg-gray-300"}`}
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
                            <div className="space-y-1">
                              {TASK_STATUS.map((s) => (
                                <div key={s} className="flex items-center gap-2 p-1" onClick={() => { setFilters(prev => ({ ...prev, status: s })); setOpenDropdown(null); }}>
                                  <input type="radio" checked={filters.status === s} readOnly className="cursor-pointer" />
                                  <span className="text-xs cursor-pointer">{s}</span>
                                </div>
                              ))}
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  setFilters(prev => ({ ...prev, status: "" }));
                                  setOpenDropdown(null);
                                }}
                                className="flex-1 px-2 py-1 rounded text-xs font-medium bg-red-500 text-white hover:bg-red-600 transition-colors"
                              >
                                Clear
                              </button>
                              <button
                                onClick={() => handleApplyFilter("status")}
                                className="flex-1 px-2 py-1 rounded bg-green-700 text-white hover:bg-green-800 transition-colors text-xs font-medium"
                              >
                                Apply
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </th>
                    <th className="px-4 py-3 text-left">Created</th>
                    <th className="px-4 py-3 text-left">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {sortedTasks.map((task) => (
                    <tr
                      key={task.id || task._id}
                      className="border-b border-gray-200 hover:bg-gray-50"
                    >
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {task.title}
                      </td>

                      {/* FIXED: Display names instead of objects */}
                      <td className="px-4 py-3 text-gray-600">
                        {task.customer?.name}
                      </td>

                      <td className="px-4 py-3 text-gray-600">
                        {task.project?.name}
                      </td>

                      <td className="px-4 py-3 text-gray-600">
                        {task.order?.title || "-"}
                      </td>

                      <td className="px-4 py-3 text-gray-600">
                        {task.asset?.name}
                      </td>

                      <td className="px-4 py-3 text-gray-600">
                        {task.user?.name || "-"}
                      </td>

                      <td className="px-4 py-3">
                        <span
                          className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${
                            task.status === "Completed" || task.status === "completed"
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                            }`}
                        >
                          {task.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {new Date(task.created_at).toLocaleDateString()}
                      </td>

                      <td className="px-4 py-3 flex items-center gap-2">
                        {canEditTask && (
                          <Link
                            to={`/tasks/${task.id || task._id}`}
                            className="w-8 h-8 flex items-center justify-center rounded-md bg-teal-400 hover:bg-teal-500 text-white"
                          >
                            <FaEdit size={14} />
                          </Link>
                        )}

                        {canDeleteTask && (
                          <button
                            onClick={() => openDeleteModal(task)}
                            disabled={deletingId === (task.id || task._id)}
                            className="w-8 h-8 flex items-center justify-center rounded-md bg-red-400 hover:bg-red-500 text-white disabled:opacity-50"
                          >
                            <FaTrash size={13} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {sortedTasks.length === 0 && (
              <p className="text-center text-gray-500 py-6">No tasks found.</p>
            )}
          </div>
        </div>
      </main>

      {/* DELETE CONFIRMATION MODAL */}
      {showDeleteModal && taskToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="rounded-lg bg-white shadow-lg max-w-sm w-full mx-4">
            {/* Header */}
            <div className="border-b border-gray-200 px-6 py-4">
              <h2 className="text-lg font-bold text-gray-900">Delete Task</h2>
            </div>

            {/* Body */}
            <div className="px-6 py-4">
              <p className="text-gray-600 mb-2">
                Are you sure you want to delete this task?
              </p>
              <p className="font-semibold text-gray-900">
                {taskToDelete.title}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                This action cannot be undone.
              </p>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 px-6 py-4 flex gap-3 justify-end">
              <button
                onClick={closeDeleteModal}
                disabled={deletingId === (taskToDelete.id || taskToDelete._id)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(taskToDelete.id || taskToDelete._id)}
                disabled={deletingId === (taskToDelete.id || taskToDelete._id)}
                className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 disabled:opacity-50"
              >
                {deletingId === (taskToDelete.id || taskToDelete._id)
                  ? "Deleting..."
                  : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TasksPage;