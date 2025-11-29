import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../component/sidebar";
import { apiClient } from "../lib/api-client";
import { FaEdit, FaTrash } from "react-icons/fa";

const EmployeesPage = () => {
  const [employees, setEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Delete popup states
  const [employeeToDelete, setEmployeeToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

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

  const filteredEmployees = employees.filter(
    (employee) =>
      employee.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-50">
      <Sidebar />

      <main className="flex-1 overflow-y-auto pt-16 md:pt-0">
        <div className="p-4 sm:p-6 md:p-8">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Employees
            </h1>

            {/* ADD EMPLOYEE BUTTON — ONLY ADMIN */}
            {canAddEmployee && (
              <Link
                to="/employees/new"
                className="rounded-lg bg-green-700 px-4 py-2 text-sm font-medium text-white hover:bg-green-800 transition-colors"
              >
                + Add Employee
              </Link>
            )}
          </div>

          {error && (
            <div className="bg-red-100 border border-red-300 text-red-600 p-3 rounded mb-6">
              {error}
            </div>
          )}

          <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-200 p-4 sm:p-6">
              <input
                type="text"
                placeholder="Search employees by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm sm:text-base focus:border-green-700 focus:outline-none focus:ring-1 focus:ring-green-700"
              />
            </div>

            <div className="overflow-x-auto">
              {loading ? (
                <div className="text-center py-12">Loading...</div>
              ) : filteredEmployees.length === 0 ? (
                <p className="text-center text-gray-500 py-6 text-sm sm:text-base">
                  No employees found.
                </p>
              ) : (
                <table className="w-full min-w-[600px] text-sm sm:text-base">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="px-4 sm:px-6 py-3">Name</th>
                      <th className="px-4 sm:px-6 py-3">Position</th>
                      <th className="px-4 sm:px-6 py-3">Role</th>
                      <th className="px-4 sm:px-6 py-3">Email</th>
                      <th className="px-4 sm:px-6 py-3">Phone</th>
                      <th className="px-4 sm:px-6 py-3">Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredEmployees.map((employee) => (
                      <tr
                        key={employee._id}
                        className="border-b border-gray-200 hover:bg-gray-50"
                      >
                        <td className="px-4 sm:px-6 py-3 font-medium text-gray-900">
                          {employee.name}
                        </td>
                        <td className="px-4 sm:px-6 py-3">{employee.designation || "—"}</td>
                        <td className="px-4 sm:px-6 py-3">{employee.role || "—"}</td>
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
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* DELETE CONFIRMATION MODAL */}
      {employeeToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm"></div>

          <div className="relative bg-white rounded-lg shadow-xl p-6 w-full max-w-sm mx-2">
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
    </div>
  );
};

export default EmployeesPage;
