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

  // Fetch employees (users)
  const fetchEmployees = async () => {
    try {
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

  // 🔥 DELETE FUNCTION HERE
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this employee?")) return;

    try {
      await apiClient.deleteUser(id);

      // Remove deleted employee from UI
      setEmployees((prev) => prev.filter((emp) => emp._id !== id));
    } catch (err) {
      alert("Delete failed!");
      console.error(err);
    }
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

            <Link
              to="/employees/new"
              className="rounded-lg bg-green-700 px-4 py-2 text-sm font-medium text-white hover:bg-green-800 transition-colors"
            >
              + Add Employee
            </Link>
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
                      <th className="px-4 sm:px-6 py-3 text-left font-medium text-gray-700 uppercase text-xs sm:text-sm">
                        Name
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-left font-medium text-gray-700 uppercase text-xs sm:text-sm">
                        Position
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-left font-medium text-gray-700 uppercase text-xs sm:text-sm">
                        Email
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-left font-medium text-gray-700 uppercase text-xs sm:text-sm">
                        Phone
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-left font-medium text-gray-700 uppercase text-xs sm:text-sm">
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredEmployees.map((employee) => (
                      <tr
                        key={employee._id}
                        className="border-b border-gray-200 hover:bg-gray-50"
                      >
                        <td className="px-4 sm:px-6 py-3 text-gray-900 font-medium">
                          {employee.name}
                        </td>
                        <td className="px-4 sm:px-6 py-3 text-gray-600">
                          {employee.designation || "—"}
                        </td>
                        <td className="px-4 sm:px-6 py-3 text-gray-600">
                          {employee.email}
                        </td>
                        <td className="px-4 sm:px-6 py-3 text-gray-600">
                          {employee.phone || "—"}
                        </td>

                        <td className="px-4 sm:px-6 py-3">
                          <div className="flex items-center gap-2">
                            <Link
                              to={`/employees/${employee._id}`}
                              className="w-8 h-8 flex items-center justify-center rounded-md bg-teal-400 hover:bg-teal-500 text-white text-sm"
                            >
                              <FaEdit size={14} />
                            </Link>

                            <button
                              onClick={() => handleDelete(employee._id)}
                              className="w-8 h-8 flex items-center justify-center rounded-md bg-red-400 hover:bg-red-500 text-white text-sm"
                            >
                              <FaTrash size={14} />
                            </button>
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
    </div>
  );
};

export default EmployeesPage;
