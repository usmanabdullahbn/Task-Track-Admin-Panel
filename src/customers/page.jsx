import React, { useState, useEffect, useRef } from "react";
import Sidebar from "../component/sidebar";
import { Link } from "react-router-dom";
import { apiClient } from "../lib/api-client";
import { FaEdit, FaTrash, FaChevronDown, FaFilter } from "react-icons/fa";

const CustomersPage = () => {
  const [filters, setFilters] = useState({ name: "", email: "", phone: "", address: "" });
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sortField, setSortField] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [openDropdown, setOpenDropdown] = useState(null);
  const [dropdownSearchTerm, setDropdownSearchTerm] = useState("");
  const dropdownRef = useRef(null);

  // Get logged-in user's role from localStorage
  const getUserRole = () => {
    try {
      const user = JSON.parse(localStorage.getItem("User"))?.user;
      return (user?.role || "").toString().toLowerCase();
    } catch (e) {
      return "";
    }
  };

  const loggedUserRole = getUserRole();

  // Permissions based on Authorization Matrix
  const canAddCustomer = loggedUserRole === "admin" || loggedUserRole === "manager";
  const canEditCustomer = loggedUserRole === "admin" || loggedUserRole === "manager";
  const canDeleteCustomer = loggedUserRole === "admin";

  // Popup state for delete confirmation
  const [customerToDelete, setCustomerToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  // Success modal states
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const handleDeleteClick = (customer) => {
    setCustomerToDelete(customer);
    setDeleteError("");
  };

  const handleConfirmDelete = async () => {
    if (!customerToDelete) return;
    setDeleting(true);
    setDeleteError("");
    try {
      await apiClient.deleteCustomer(customerToDelete._id);
      setCustomers((prev) => prev.filter((cust) => cust._id !== customerToDelete._id));

      // Show success modal
      setSuccessMessage(`Customer ${customerToDelete.name} has been deleted successfully`);
      setShowSuccessModal(true);
      setCustomerToDelete(null);
    } catch (error) {
      setDeleteError("Failed to delete customer!");
      console.error(error);
    } finally {
      setDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setCustomerToDelete(null);
    setDeleteError("");
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    setSuccessMessage("");
  };

  // Fetch Customers (API)
  const loadCustomers = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getCustomers();
      setCustomers(response?.customers || response || []);
    } catch (err) {
      setError(err.message || "Failed to load customers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if click is inside the dropdown ref
      if (dropdownRef.current && dropdownRef.current.contains(event.target)) {
        return;
      }

      // Check if click is on a header
      if (event.target.closest("th")) {
        return;
      }

      setOpenDropdown(null);
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter Logic
  const filteredCustomers = customers.filter((customer) => {
    for (const [field, term] of Object.entries(filters)) {
      if (term) {
        const value = (customer[field] || "").toLowerCase();
        if (!value.includes(term.toLowerCase())) {
          return false;
        }
      }
    }
    return true;
  });

  // Sort Logic
  const sortedCustomers = [...filteredCustomers].sort((a, b) => {
    let aValue = a[sortField] || "";
    let bValue = b[sortField] || "";

    aValue = aValue.toString().toLowerCase();
    bValue = bValue.toString().toLowerCase();

    if (sortOrder === "asc") {
      return aValue.localeCompare(bValue);
    } else {
      return bValue.localeCompare(aValue);
    }
  });

  const handleHeaderClick = (field) => {
    setOpenDropdown(openDropdown === field ? null : field);
    setDropdownSearchTerm(filters[field] || "");
  };

  const handleApplyFilter = (field) => {
    setFilters(prev => ({ ...prev, [field]: dropdownSearchTerm }));
    setOpenDropdown(null);
  };

  const handleSortChange = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-50">
      <Sidebar className={customerToDelete || showSuccessModal ? "blur-sm" : ""} />

      <main className={`flex-1 overflow-y-auto pt-16 md:pt-0 ${customerToDelete || showSuccessModal ? "blur-sm" : ""}`}>
        <div className="p-4 sm:p-6 md:pt-8">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Customers</h1>

            {/* Add Customer Button (Admin + Manager) */}
            {canAddCustomer && (
              <Link
                to="/customers/new"
                className="rounded-lg bg-green-700 px-4 py-2 text-sm font-medium text-white hover:bg-green-800 transition-colors"
              >
                + Add Customer
              </Link>
            )}
          </div>

          {/* Search Box */}
          <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
            {loading && (
              <p className="text-center py-6 text-gray-500">Loading customers...</p>
            )}

            {error && <p className="text-center py-6 text-red-500">{error}</p>}

            {!loading && !error && (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px] text-sm sm:text-base">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className={`px-4 py-3 text-left font-medium cursor-pointer hover:bg-gray-100 transition-colors relative ${filters.name ? "bg-blue-100" : ""}`} onClick={() => handleHeaderClick("name")}>
                        <div className="flex items-center gap-2">
                          Name
                          {filters.name && <FaFilter size={12} className="text-blue-600" />}
                          <FaChevronDown size={12} className={`transition-transform ${openDropdown === "name" ? "rotate-180" : ""}`} />
                        </div>
                        {openDropdown === "name" && (
                          <div ref={dropdownRef} onClick={(e) => e.stopPropagation()} className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-3 z-9999" style={{ minWidth: "200px" }}>
                            <div className="space-y-2">
                              <input
                                type="text"
                                placeholder={`Search...`}
                                value={dropdownSearchTerm}
                                onChange={(e) => setDropdownSearchTerm(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter') handleApplyFilter("name"); }}
                                className="w-full rounded-lg border border-gray-300 px-2 py-1 text-xs z-99999 focus:border-green-700 focus:outline-none focus:ring-1 focus:ring-green-700"
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
                      <th className={`px-4 py-3 text-left font-medium cursor-pointer hover:bg-gray-100 transition-colors relative ${filters.email ? "bg-blue-100" : ""}`} onClick={() => handleHeaderClick("email")}>
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
                                placeholder={`Search...`}
                                value={dropdownSearchTerm}
                                onChange={(e) => setDropdownSearchTerm(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter') handleApplyFilter("email"); }}
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
                                  onClick={() => {
                                    setFilters(prev => ({ ...prev, ["email"]: "" }));
                                    setOpenDropdown(null);
                                  }}
                                  className="flex-1 px-2 py-1 rounded text-xs font-medium bg-red-500 text-white hover:bg-red-600 transition-colors"
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
                      <th className={`px-4 py-3 text-left font-medium cursor-pointer hover:bg-gray-100 transition-colors relative ${filters.phone ? "bg-blue-100" : ""}`} onClick={() => handleHeaderClick("phone")}>
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
                                placeholder={`Search...`}
                                value={dropdownSearchTerm}
                                onChange={(e) => setDropdownSearchTerm(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter') handleApplyFilter("phone"); }}
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
                                  onClick={() => {
                                    setFilters(prev => ({ ...prev, ["phone"]: "" }));
                                    setOpenDropdown(null);
                                  }}
                                  className="flex-1 px-2 py-1 rounded text-xs font-medium bg-red-500 text-white hover:bg-red-600 transition-colors"
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
                      <th className={`px-4 py-3 text-left font-medium cursor-pointer hover:bg-gray-100 transition-colors relative ${filters.address ? "bg-blue-100" : ""}`} onClick={() => handleHeaderClick("address")}>
                        <div className="flex items-center gap-2">
                          Address
                          {filters.address && <FaFilter size={12} className="text-blue-600" />}
                          <FaChevronDown size={12} className={`transition-transform ${openDropdown === "address" ? "rotate-180" : ""}`} />
                        </div>
                        {openDropdown === "address" && (
                          <div ref={dropdownRef} onClick={(e) => e.stopPropagation()} className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-3 z-[9999]" style={{ minWidth: "200px" }}>
                            <div className="space-y-2">
                              <input
                                type="text"
                                placeholder={`Search...`}
                                value={dropdownSearchTerm}
                                onChange={(e) => setDropdownSearchTerm(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter') handleApplyFilter("address"); }}
                                className="w-full rounded-lg border border-gray-300 px-2 py-1 text-xs focus:border-green-700 focus:outline-none focus:ring-1 focus:ring-green-700"
                              />
                              <div className="flex gap-2">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSortChange("address");
                                  }}
                                  className={`flex-1 px-2 py-1 rounded text-xs font-medium transition-colors ${sortField === "address" ? "bg-green-700 text-white" : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                                    }`}
                                >
                                  Sort
                                </button>
                                {sortField === "address" && (
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
                                    setFilters(prev => ({ ...prev, ["address"]: "" }));
                                    setOpenDropdown(null);
                                  }}
                                  className="flex-1 px-2 py-1 rounded text-xs font-medium bg-red-500 text-white hover:bg-red-600 transition-colors"
                                >
                                  Clear
                                </button>
                                <button
                                  onClick={() => handleApplyFilter("address")}
                                  className="flex-1 px-2 py-1 rounded bg-green-700 text-white hover:bg-green-800 transition-colors text-xs font-medium"
                                >
                                  Apply
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </th>
                      <th className="px-4 py-3 text-left font-medium">Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {sortedCustomers.map((customer) => (
                      <tr key={customer._id} className="hover:bg-gray-50 border-b-0">
                        <td className="px-4 py-3">{customer.name}</td>
                        <td className="px-4 py-3">{customer.email}</td>
                        <td className="px-4 py-3">{customer.phone || "--"}</td>
                        <td className="px-4 py-3">{customer.address || "--"}</td>

                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">

                            {/* Edit (Admin + Manager) */}
                            {canEditCustomer && (
                              <Link
                                to={`/customers/${customer._id}`}
                                className="w-8 h-8 flex items-center justify-center rounded-md bg-teal-400 hover:bg-teal-500 text-white"
                                title="Edit customer"
                              >
                                <FaEdit size={14} />
                              </Link>
                            )}

                            {/* Delete (Admin only) */}
                            {canDeleteCustomer && (
                              <button
                                onClick={() => handleDeleteClick(customer)}
                                className="w-8 h-8 flex items-center justify-center rounded-md bg-red-400 hover:bg-red-500 text-white"
                                title="Delete customer"
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
            )}

            {!loading && sortedCustomers.length === 0 && (
              <p className="text-center text-gray-500 py-6">No customers found.</p>
            )}
          </div>
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      {customerToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="absolute inset-0 backdrop-blur-sm z-40"></div>

          <div className="relative bg-white rounded-lg shadow-xl p-6 w-full max-w-sm mx-2 z-50">
            <h2 className="text-lg font-semibold mb-4">Confirm Deletion</h2>
            <p className="mb-4 text-gray-700">
              Are you sure you want to delete{" "}
              <span className="font-bold">{customerToDelete.name}</span>?
            </p>
            {deleteError && <div className="text-red-600 text-sm mb-2">{deleteError}</div>}

            <div className="flex justify-end gap-3">
              <button
                onClick={handleCancelDelete}
                disabled={deleting}
                className="px-4 py-2 rounded bg-gray-200 text-gray-800 hover:bg-gray-300"
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

export default CustomersPage;
