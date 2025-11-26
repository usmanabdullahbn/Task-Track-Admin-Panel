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

  // ✅ DELETE CUSTOMER FUNCTION
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this customer?"
    );
    if (!confirmDelete) return;

    try {
      await apiClient.deleteCustomer(id);
      loadCustomers(); // reload list after deleting
    } catch (error) {
      alert("Failed to delete customer!");
      console.error(error);
    }
  };

  // Fetch Customers (API)
  const loadCustomers = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getCustomers(); // <-- API call
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
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pt-16 md:pt-0">
        <div className="p-4 sm:p-6 md:p-8">
          {/* Header */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Customers
            </h1>

            <Link
              to="/customers/new"
              className="rounded-lg bg-green-700 px-4 py-2 text-sm font-medium text-white hover:bg-green-800 transition-colors"
            >
              + Add Customer
            </Link>
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

            {/* Loading State */}
            {loading && (
              <p className="text-center py-6 text-gray-500">
                Loading customers...
              </p>
            )}

            {/* Error State */}
            {error && (
              <p className="text-center py-6 text-red-500">{error}</p>
            )}

            {/* Table */}
            {!loading && !error && (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px] text-sm sm:text-base">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="px-4 sm:px-6 py-3 text-left font-medium text-gray-700 uppercase">
                        Name
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-left font-medium text-gray-700 uppercase">
                        Email
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-left font-medium text-gray-700 uppercase">
                        Phone
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-left font-medium text-gray-700 uppercase">
                        Address
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-left font-medium text-gray-700 uppercase">
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredCustomers.map((customer) => (
                      <tr
                        key={customer._id}
                        className="border-b border-gray-200 hover:bg-gray-50"
                      >
                        <td className="px-4 sm:px-6 py-3 font-medium text-gray-900">
                          {customer.name}
                        </td>
                        <td className="px-4 sm:px-6 py-3 text-gray-600">
                          {customer.email}
                        </td>
                        <td className="px-4 sm:px-6 py-3 text-gray-600">
                          {customer.phone || "--"}
                        </td>
                        <td className="px-4 sm:px-6 py-3 text-gray-600">
                          {customer.address || "--"}
                        </td>
                        <td className="px-4 sm:px-6 py-3">
                          <div className="flex items-center gap-2">
                            {/* Edit Button */}
                            <Link
                              to={`/customers/${customer._id}`}
                              className="w-8 h-8 flex items-center justify-center rounded-md bg-teal-400 hover:bg-teal-500 text-white"
                            >
                              <FaEdit size={14} />
                            </Link>

                            {/* Delete Button */}
                            <button
                              onClick={() => handleDelete(customer._id)}
                              className="w-8 h-8 flex items-center justify-center rounded-md bg-red-400 hover:bg-red-500 text-white"
                            >
                              <FaTrash size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Empty State */}
            {!loading && filteredCustomers.length === 0 && (
              <p className="text-center text-gray-500 py-6">
                No customers found.
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default CustomersPage;
