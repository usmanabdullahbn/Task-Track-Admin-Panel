import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../component/sidebar";
import { apiClient } from "../lib/api-client";
import { FaEdit, FaTrash, FaClock, FaChevronDown, FaFilter } from "react-icons/fa";

const EmployeesPage = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sortField, setSortField] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [openDropdown, setOpenDropdown] = useState(null);
  const [dropdownSearchTerm, setDropdownSearchTerm] = useState("");
  const [filters, setFilters] = useState({ name: "", position: "", role: [], company: "", email: "", phone: "" });
  const dropdownRef = useRef(null);

  // Handler functions for dropdown filtering and sorting
  const handleHeaderClick = (field) => {
    setOpenDropdown(openDropdown === field ? null : field);
    if (field !== "role") {
      setDropdownSearchTerm(filters[field] || "");
    }
  };

  const handleApplyFilter = (field, value) => {
    // Close the dropdown
    setOpenDropdown(null);
  };

  const handleClearFilter = (field) => {
    setFilters(prev => ({ ...prev, [field]: field === "role" ? [] : "" }));
    setOpenDropdown(null);
  };

  const handleInputChange = (field, value) => {
    setDropdownSearchTerm(value);
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleRoleChange = (role, checked) => {
    setFilters(prev => ({
      ...prev,
      role: checked
        ? [...prev.role, role.toLowerCase()]
        : prev.role.filter(r => r !== role.toLowerCase())
    }));
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

  // Delete popup states
  const [employeeToDelete, setEmployeeToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  // Success modal states
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [successAction, setSuccessAction] = useState("");

  // -------------------------
  // GET USER ROLE
  // -------------------------
  const getUserRole = () => {
    try {
      const user = JSON.parse(localStorage.getItem("User"))?.user;
      return (user?.role || "").toLowerCase();
    } catch {
      return "";
    }
  };

  const role = getUserRole();

  // -------------------------
  // PERMISSIONS BASED ON MATRIX
  // -------------------------
  const canAddEmployee = role === "admin";
  const canEditEmployee = role === "admin";
  const canDeleteEmployee = role === "admin";

  // Fetch employees
  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getUsers();
      const usersArray = Array.isArray(response)
        ? response
        : response.Users || [];

      setEmployees(usersArray);
    } catch (err) {
      setError(err.message || "Failed to fetch employees");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  // Show delete modal
  const handleDeleteClick = (employee) => {
    if (!canDeleteEmployee) return; // extra safety
    setEmployeeToDelete(employee);
    setDeleteError("");
  };

  // Confirm delete
  const handleConfirmDelete = async () => {
    if (!employeeToDelete) return;

    try {
      setDeleting(true);
      await apiClient.deleteUser(employeeToDelete._id);

      setEmployees((prev) =>
        prev.filter((emp) => emp._id !== employeeToDelete._id)
      );

      // Show success modal
      setSuccessMessage(`Employee ${employeeToDelete.name} has been deleted successfully`);
      setSuccessAction("deleted");
      setShowSuccessModal(true);
      setEmployeeToDelete(null);
    } catch (err) {
      setDeleteError("Failed to delete employee!");
    } finally {
      setDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setEmployeeToDelete(null);
    setDeleteError("");
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    setSuccessMessage("");
    setSuccessAction("");
  };

  const filteredEmployees = employees.filter((employee) => {
    for (const [field, term] of Object.entries(filters)) {
      if (term && (Array.isArray(term) ? term.length > 0 : term)) {
        const value = (() => {
          switch (field) {
            case "name":
              return (employee.name || "").toLowerCase();
            case "position":
              return (employee.designation || "").toLowerCase();
            case "role":
              return (employee.role || "").toLowerCase();
            case "company":
              return employee.role === "employee" 
                ? (employee.customer?.name || "").toLowerCase()
                : "switchgear international";
            case "email":
              return (employee.email || "").toLowerCase();
            case "phone":
              return (employee.phone || "").toLowerCase();
            default:
              return "";
          }
        })();
        if (field === "role") {
          if (!term.includes(employee.role?.toLowerCase())) {
            return false;
          }
        } else if (!value.includes(term.toLowerCase())) {
          return false;
        }
      }
    }
    return true;
  });

  // Sort Logic
  const sortedEmployees = [...filteredEmployees].sort((a, b) => {
    let aValue = "";
    let bValue = "";

    switch (sortField) {
      case "name":
        aValue = a.name || "";
        bValue = b.name || "";
        break;
      case "position":
        aValue = a.designation || "";
        bValue = b.designation || "";
        break;
      case "role":
        aValue = a.role || "";
        bValue = b.role || "";
        break;
      case "company":
        aValue = a.role === "employee" ? (a.customer?.name || "") : "Switchgear International";
        bValue = b.role === "employee" ? (b.customer?.name || "") : "Switchgear International";
        break;
      case "email":
        aValue = a.email || "";
        bValue = b.email || "";
        break;
      case "phone":
        aValue = a.phone || "";
        bValue = b.phone || "";
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
      <Sidebar className={employeeToDelete || showSuccessModal ? "blur-sm" : ""} />

      <main className={`flex-1 overflow-y-auto pt-16 md:pt-0 ${employeeToDelete || showSuccessModal ? "blur-sm" : ""}`}>
        <div className="p-4 sm:p-6 md:p-8">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Users
            </h1>

            {/* ADD EMPLOYEE BUTTON — ONLY ADMIN */}
            {canAddEmployee && (
              <Link
                to="/employees/new"
                className="rounded-lg bg-green-700 px-4 py-2 text-sm font-medium text-white hover:bg-green-800 transition-colors"
              >
                + Add User
              </Link>
            )}
          </div>

          {error && (
            <div className="bg-red-100 border border-red-300 text-red-600 p-3 rounded mb-6">
              {error}
            </div>
          )}

          <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              {loading ? (
                <div className="text-center py-12">Loading...</div>
              ) : (
                <table className="w-full min-w-[600px] text-sm sm:text-base">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className={`px-4 sm:px-6 py-3 text-left font-medium cursor-pointer hover:bg-gray-100 transition-colors relative ${filters.name ? "bg-blue-100" : ""}`} onClick={() => handleHeaderClick("name")}>
                        <div className="flex items-center gap-2">
                          Name
                          {filters.name && <FaFilter size={12} className="text-blue-600" />}
                          <FaChevronDown size={12} className={`transition-transform ${openDropdown === "name" ? "rotate-180" : ""}`} />
                        </div>
                        {openDropdown === "name" && (
                          <div ref={dropdownRef} onClick={(e) => e.stopPropagation()} className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-3 z-[9999]" style={{ minWidth: "200px" }}>
                            <div className="space-y-2">
                              <input
                                type="text"
                                placeholder="Search..."
                                value={dropdownSearchTerm}
                                onChange={(e) => handleInputChange("name", e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter') setOpenDropdown(null); }}
                                className="w-full rounded-lg border border-gray-300 px-2 py-1 text-xs focus:border-green-700 focus:outline-none focus:ring-1 focus:ring-green-700"
                              />
                              <div className="flex gap-2">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSortChange("name");
                                  }}
                                  className={`flex-1 px-2 py-1 rounded text-xs font-medium transition-colors ${sortField === "name" ? "bg-green-700 text-white" : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                                    }`}
                                >
                                  Sort
                                </button>
                                {sortField === "name" && (
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
                                    setFilters(prev => ({ ...prev, name: "" }));
                                    setOpenDropdown(null);
                                  }}
                                  className="flex-1 px-2 py-1 rounded text-xs font-medium bg-red-500 text-white hover:bg-red-600 transition-colors"
                                >
                                  Clear
                                </button>
                                <button
                                  onClick={() => handleApplyFilter("name")}
                                  className="flex-1 px-2 py-1 rounded bg-green-700 text-white hover:bg-green-800 transition-colors text-xs font-medium"
                                >
                                  Apply
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </th>
                      <th className={`px-4 sm:px-6 py-3 text-left font-medium cursor-pointer hover:bg-gray-100 transition-colors relative ${filters.position ? "bg-blue-100" : ""}`} onClick={() => handleHeaderClick("position")}>
                        <div className="flex items-center gap-2">
                          Position
                          {filters.position && <FaFilter size={12} className="text-blue-600" />}
                          <FaChevronDown size={12} className={`transition-transform ${openDropdown === "position" ? "rotate-180" : ""}`} />
                        </div>
                        {openDropdown === "position" && (
                          <div ref={dropdownRef} onClick={(e) => e.stopPropagation()} className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-3 z-[9999]" style={{ minWidth: "200px" }}>
                            <div className="space-y-2">
                              <input
                                type="text"
                                placeholder="Search..."
                                value={dropdownSearchTerm}
                                onChange={(e) => handleInputChange("position", e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter') setOpenDropdown(null); }}
                                className="w-full rounded-lg border border-gray-300 px-2 py-1 text-xs focus:border-green-700 focus:outline-none focus:ring-1 focus:ring-green-700"
                              />
                              <div className="flex gap-2">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSortChange("position");
                                  }}
                                  className={`flex-1 px-2 py-1 rounded text-xs font-medium transition-colors ${sortField === "position" ? "bg-green-700 text-white" : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                                    }`}
                                >
                                  Sort
                                </button>
                                {sortField === "position" && (
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
                                  onClick={() => handleClearFilter("position")}
                                  className="flex-1 px-2 py-1 rounded bg-red-700 text-white hover:bg-red-800 transition-colors text-xs font-medium"
                                >
                                  Clear
                                </button>
                                <button
                                  onClick={() => handleApplyFilter("position")}
                                  className="flex-1 px-2 py-1 rounded bg-green-700 text-white hover:bg-green-800 transition-colors text-xs font-medium"
                                >
                                  Apply
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </th>
                      <th className={`px-4 sm:px-6 py-3 text-left font-medium cursor-pointer hover:bg-gray-100 transition-colors relative ${filters.role.length > 0 ? "bg-blue-100" : ""}`} onClick={() => handleHeaderClick("role")}>
                        <div className="flex items-center gap-2">
                          Role
                          {filters.role.length > 0 && <FaFilter size={12} className="text-blue-600" />}
                          <FaChevronDown size={12} className={`transition-transform ${openDropdown === "role" ? "rotate-180" : ""}`} />
                        </div>
                        {openDropdown === "role" && (
                          <div ref={dropdownRef} onClick={(e) => e.stopPropagation()} className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-3 z-[9999]" style={{ minWidth: "200px" }}>
                            <div className="space-y-2">
                              <div className="space-y-1">
                                <label className="flex items-center gap-2 text-xs">
                                  <input
                                    type="checkbox"
                                    checked={filters.role.includes("admin")}
                                    onChange={(e) => handleRoleChange("admin", e.target.checked)}
                                    className="rounded"
                                  />
                                  Admin
                                </label>
                                <label className="flex items-center gap-2 text-xs">
                                  <input
                                    type="checkbox"
                                    checked={filters.role.includes("employee")}
                                    onChange={(e) => handleRoleChange("employee", e.target.checked)}
                                    className="rounded"
                                  />
                                  Employee
                                </label>
                                <label className="flex items-center gap-2 text-xs">
                                  <input
                                    type="checkbox"
                                    checked={filters.role.includes("technician")}
                                    onChange={(e) => handleRoleChange("technician", e.target.checked)}
                                    className="rounded"
                                  />
                                  Technician
                                </label>
                                <label className="flex items-center gap-2 text-xs">
                                  <input
                                    type="checkbox"
                                    checked={filters.role.includes("supervisor")}
                                    onChange={(e) => handleRoleChange("supervisor", e.target.checked)}
                                    className="rounded"
                                  />
                                  Supervisor
                                </label>
                                <label className="flex items-center gap-2 text-xs">
                                  <input
                                    type="checkbox"
                                    checked={filters.role.includes("manager")}
                                    onChange={(e) => handleRoleChange("manager", e.target.checked)}
                                    className="rounded"
                                  />
                                  Manager
                                </label>
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSortChange("role");
                                  }}
                                  className={`flex-1 px-2 py-1 rounded text-xs font-medium transition-colors ${sortField === "role" ? "bg-green-700 text-white" : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                                    }`}
                                >
                                  Sort
                                </button>
                                {sortField === "role" && (
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
                                  onClick={() => handleClearFilter("role")}
                                  className="flex-1 px-2 py-1 rounded bg-red-700 text-white hover:bg-red-800 transition-colors text-xs font-medium"
                                >
                                  Clear
                                </button>
                                <button
                                  onClick={() => handleApplyFilter("role")}
                                  className="flex-1 px-2 py-1 rounded bg-green-700 text-white hover:bg-green-800 transition-colors text-xs font-medium"
                                >
                                  Apply
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </th>
                      <th className={`px-4 sm:px-6 py-3 text-left font-medium cursor-pointer hover:bg-gray-100 transition-colors relative ${filters.company ? "bg-blue-100" : ""}`} onClick={() => handleHeaderClick("company")}>
                        <div className="flex items-center gap-2">
                          Company
                          {filters.company && <FaFilter size={12} className="text-blue-600" />}
                          <FaChevronDown size={12} className={`transition-transform ${openDropdown === "company" ? "rotate-180" : ""}`} />
                        </div>
                        {openDropdown === "company" && (
                          <div ref={dropdownRef} onClick={(e) => e.stopPropagation()} className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-3 z-[9999]" style={{ minWidth: "200px" }}>
                            <div className="space-y-2">
                              <label className="flex items-center gap-2 text-xs">
                                <input
                                  type="checkbox"
                                  checked={filters.company === "switchgear international"}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setFilters(prev => ({ ...prev, company: "switchgear international" }));
                                      setDropdownSearchTerm("");
                                    } else {
                                      setFilters(prev => ({ ...prev, company: "" }));
                                      setDropdownSearchTerm("");
                                    }
                                  }}
                                  className="rounded"
                                />
                                SGI (Switchgear International)
                              </label>
                              <input
                                type="text"
                                placeholder="Search other companies..."
                                value={dropdownSearchTerm}
                                onChange={(e) => {
                                  setDropdownSearchTerm(e.target.value);
                                  setFilters(prev => ({ ...prev, company: e.target.value }));
                                }}
                                onKeyDown={(e) => { if (e.key === 'Enter') setOpenDropdown(null); }}
                                className="w-full rounded-lg border border-gray-300 px-2 py-1 text-xs focus:border-green-700 focus:outline-none focus:ring-1 focus:ring-green-700"
                              />
                              <div className="flex gap-2">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSortChange("company");
                                  }}
                                  className={`flex-1 px-2 py-1 rounded text-xs font-medium transition-colors ${sortField === "company" ? "bg-green-700 text-white" : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                                    }`}
                                >
                                  Sort
                                </button>
                                {sortField === "company" && (
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
                                  onClick={() => handleClearFilter("company")}
                                  className="flex-1 px-2 py-1 rounded bg-red-700 text-white hover:bg-red-800 transition-colors text-xs font-medium"
                                >
                                  Clear
                                </button>
                                <button
                                  onClick={() => handleApplyFilter("company")}
                                  className="flex-1 px-2 py-1 rounded bg-green-700 text-white hover:bg-green-800 transition-colors text-xs font-medium"
                                >
                                  Apply
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </th>
                      <th className={`px-4 sm:px-6 py-3 text-left font-medium cursor-pointer hover:bg-gray-100 transition-colors relative ${filters.email ? "bg-blue-100" : ""}`} onClick={() => handleHeaderClick("email")}>
                        <div className="flex items-center gap-2">
                          Email
                          {filters.email && <FaFilter size={12} className="text-blue-600" />}
                          <FaChevronDown size={12} className={`transition-transform ${openDropdown === "email" ? "rotate-180" : ""}`} />
                        </div>
                        {openDropdown === "email" && (
                          <div ref={dropdownRef} onClick={(e) => e.stopPropagation()} className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-3 z-[9999]" style={{ minWidth: "200px" }}>
                            <div className="space-y-2">
                              <input
                                type="text"
                                placeholder="Search..."
                                value={dropdownSearchTerm}
                                onChange={(e) => handleInputChange("email", e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter') setOpenDropdown(null); }}
                                className="w-full rounded-lg border border-gray-300 px-2 py-1 text-xs focus:border-green-700 focus:outline-none focus:ring-1 focus:ring-green-700"
                              />
                              <div className="flex gap-2">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSortChange("email");
                                  }}
                                  className={`flex-1 px-2 py-1 rounded text-xs font-medium transition-colors ${sortField === "email" ? "bg-green-700 text-white" : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                                    }`}
                                >
                                  Sort
                                </button>
                                {sortField === "email" && (
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
                                  onClick={() => handleClearFilter("email")}
                                  className="flex-1 px-2 py-1 rounded bg-red-700 text-white hover:bg-red-800 transition-colors text-xs font-medium"
                                >
                                  Clear
                                </button>
                                <button
                                  onClick={() => handleApplyFilter("email")}
                                  className="flex-1 px-2 py-1 rounded bg-green-700 text-white hover:bg-green-800 transition-colors text-xs font-medium"
                                >
                                  Apply
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </th>
                      <th className={`px-4 sm:px-6 py-3 text-left font-medium cursor-pointer hover:bg-gray-100 transition-colors relative ${filters.phone ? "bg-blue-100" : ""}`} onClick={() => handleHeaderClick("phone")}>
                        <div className="flex items-center gap-2">
                          Phone
                          {filters.phone && <FaFilter size={12} className="text-blue-600" />}
                          <FaChevronDown size={12} className={`transition-transform ${openDropdown === "phone" ? "rotate-180" : ""}`} />
                        </div>
                        {openDropdown === "phone" && (
                          <div ref={dropdownRef} onClick={(e) => e.stopPropagation()} className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-3 z-[9999]" style={{ minWidth: "200px" }}>
                            <div className="space-y-2">
                              <input
                                type="text"
                                placeholder="Search..."
                                value={dropdownSearchTerm}
                                onChange={(e) => handleInputChange("phone", e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter') setOpenDropdown(null); }}
                                className="w-full rounded-lg border border-gray-300 px-2 py-1 text-xs focus:border-green-700 focus:outline-none focus:ring-1 focus:ring-green-700"
                              />
                              <div className="flex gap-2">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSortChange("phone");
                                  }}
                                  className={`flex-1 px-2 py-1 rounded text-xs font-medium transition-colors ${sortField === "phone" ? "bg-green-700 text-white" : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                                    }`}
                                >
                                  Sort
                                </button>
                                {sortField === "phone" && (
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
                                  onClick={() => handleClearFilter("phone")}
                                  className="flex-1 px-2 py-1 rounded bg-red-700 text-white hover:bg-red-800 transition-colors text-xs font-medium"
                                >
                                  Clear
                                </button>
                                <button
                                  onClick={() => handleApplyFilter("phone")}
                                  className="flex-1 px-2 py-1 rounded bg-green-700 text-white hover:bg-green-800 transition-colors text-xs font-medium"
                                >
                                  Apply
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </th>
                      <th className="px-4 sm:px-6 py-3">Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {sortedEmployees.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="px-4 py-8 text-center text-gray-500">
                          No employees found.
                        </td>
                      </tr>
                    ) : (
                      sortedEmployees.map((employee) => (
                        <tr
                          key={employee._id}
                          className="border-b border-gray-200 hover:bg-gray-50"
                        >
                          <td className="px-4 sm:px-6 py-3 font-medium text-gray-900">
                            {employee.name}
                          </td>
                          <td className="px-4 sm:px-6 py-3">{employee.designation || "—"}</td>
                          <td className="px-4 sm:px-6 py-3">{employee.role || "—"}</td>
                          <td className="px-4 sm:px-6 py-3">
                            {employee.role === "employee" 
                              ? (employee.customer?.name || "N/A") 
                              : "Switchgear International"}
                          </td>
                          <td className="px-4 sm:px-6 py-3">{employee.email}</td>
                          <td className="px-4 sm:px-6 py-3">{employee.phone || "—"}</td>

                          <td className="px-4 sm:px-6 py-3">
                            <div className="flex items-center gap-2">
                              {/* EDIT — ONLY ADMIN */}
                              {canEditEmployee && (
                                <Link
                                  to={`/employees/${employee._id}`}
                                  className="w-8 h-8 flex items-center justify-center rounded-md bg-teal-400 hover:bg-teal-500 text-white"
                                >
                                  <FaEdit size={14} />
                                </Link>
                              )}

                              {/* DELETE — ONLY ADMIN */}
                              {canDeleteEmployee && (
                                <button
                                  onClick={() => handleDeleteClick(employee)}
                                  className="w-8 h-8 flex items-center justify-center rounded-md bg-red-400 hover:bg-red-500 text-white"
                                >
                                  <FaTrash size={14} />
                                </button>
                              )}

                              {/* TIMELINE — ONLY ADMIN */}
                              {canEditEmployee && (
                                <Link
                                  to={`/timeline`}
                                  className="w-8 h-8 flex items-center justify-center rounded-md bg-blue-400 hover:bg-blue-500 text-white"
                                >
                                  <FaClock size={14} />
                                </Link>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* DELETE CONFIRMATION MODAL */}
      {employeeToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="absolute inset-0 backdrop-blur-sm z-40"></div>

          <div className="relative bg-white rounded-lg shadow-xl p-6 w-full max-w-sm mx-2 z-50">
            <h2 className="text-lg font-semibold mb-4">Confirm Deletion</h2>

            <p className="mb-4 text-gray-700">
              Are you sure you want to delete{" "}
              <span className="font-bold">{employeeToDelete.name}</span>?
            </p>

            {deleteError && (
              <div className="text-red-600 text-sm mb-2">{deleteError}</div>
            )}

            <div className="flex justify-end gap-3">
              <button
                onClick={handleCancelDelete}
                disabled={deleting}
                className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
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
              {successMessage}
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

export default EmployeesPage;
