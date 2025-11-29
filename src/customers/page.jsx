import React, { useState, useEffect } from "react";
import Sidebar from "../component/sidebar";
import { Link } from "react-router-dom";
import { apiClient } from "../lib/api-client";
import { FaEdit, FaTrash } from "react-icons/fa";

const CustomersPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
      setCustomerToDelete(null);
      loadCustomers();
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

  // Filter Logic
  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-50">
      <Sidebar />

      <main className="flex-1 overflow-y-auto pt-16 md:pt-0">
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
            <div className="border-b border-gray-200 p-4 sm:p-6">
              <input
                type="text"
                placeholder="Search customers by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm sm:text-base focus:border-green-700 focus:outline-none focus:ring-1 focus:ring-green-700"
              />
            </div>

            {loading && (
              <p className="text-center py-6 text-gray-500">Loading customers...</p>
            )}

            {error && <p className="text-center py-6 text-red-500">{error}</p>}

            {!loading && !error && (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px] text-sm sm:text-base">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="px-4 py-3 text-left font-medium">Name</th>
                      <th className="px-4 py-3 text-left font-medium">Email</th>
                      <th className="px-4 py-3 text-left font-medium">Phone</th>
                      <th className="px-4 py-3 text-left font-medium">Address</th>
                      <th className="px-4 py-3 text-left font-medium">Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredCustomers.map((customer) => (
                      <tr key={customer._id} className="border-b hover:bg-gray-50">
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

            {!loading && filteredCustomers.length === 0 && (
              <p className="text-center text-gray-500 py-6">No customers found.</p>
            )}
          </div>
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      {customerToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm"></div>

          <div className="relative bg-white rounded-lg shadow-xl p-6 w-full max-w-sm mx-2">
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
    </div>
  );
};

export default CustomersPage;
