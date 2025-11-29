import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../component/sidebar";
import { FaEdit, FaTrash } from "react-icons/fa";
import { apiClient } from "../lib/api-client"; // ✅ import your apiClient

const OrdersPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchField, setSearchField] = useState("order");
  const [orders, setOrders] = useState([]); // ✅ always an array
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch orders from API
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const data = await apiClient.getOrders();
        console.log("API response:", data);

        // ✅ only store the array
        setOrders(Array.isArray(data.orders) ? data.orders : []);
      } catch (err) {
        setError(err.message);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  // Delete handler
  const handleDelete = async (id) => {
    try {
      await apiClient.deleteOrder(id);
      setOrders((prev) => prev.filter((order) => order._id !== id));
    } catch (err) {
      console.error("Failed to delete order:", err);
    }
  };

  // Filtering logic
  const filteredOrders = orders.filter((order) => {
    const searchValue = searchTerm.toLowerCase();
    switch (searchField) {
      case "order":
        return order.order_number?.toLowerCase().includes(searchValue);
      case "erp":
        return order.erp_number?.toLowerCase().includes(searchValue);
      case "customer":
        return order.customer_id?.toLowerCase().includes(searchValue);
      case "project":
        return order.project_id?.toLowerCase().includes(searchValue);
      case "amount":
        return order.amount?.value?.toString().includes(searchTerm);
      default:
        return true;
    }
  });

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-y-auto pt-16 md:pt-0">
        <div className="p-4 sm:p-6 md:p-8">
          {/* Header */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Work Orders Management
            </h1>
            <Link
              to="/orders/new"
              className="rounded-lg bg-green-700 px-4 py-2 text-sm font-medium text-white hover:bg-green-800 transition-colors"
            >
              + Add Order
            </Link>
          </div>

          {/* Loading / Error */}
          {loading && <p className="text-gray-500">Loading orders...</p>}
          {error && <p className="text-red-500">Error: {error}</p>}

          {/* Search + Table */}
          {!loading && !error && (
            <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
              {/* Search Section */}
              <div className="border-b border-gray-200 p-4 sm:p-6">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                  {[
                    { field: "order", placeholder: "Search Order #" },
                    { field: "erp", placeholder: "Search ERP #" },
                    { field: "customer", placeholder: "Search Customer ID" },
                    { field: "project", placeholder: "Search Project ID" },
                    { field: "amount", placeholder: "Search Amount" },
                  ].map(({ field, placeholder }) => (
                    <input
                      key={field}
                      type="text"
                      placeholder={placeholder}
                      value={searchField === field ? searchTerm : ""}
                      onChange={(e) => {
                        setSearchField(field);
                        setSearchTerm(e.target.value);
                      }}
                      className="rounded-lg border border-gray-300 px-3 py-2 text-sm sm:text-base focus:border-green-700 focus:outline-none focus:ring-1 focus:ring-green-700"
                    />
                  ))}
                </div>
              </div>

              {/* Orders Table */}
              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px] text-sm sm:text-base">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-medium text-gray-700 uppercase">
                        Order #
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-medium text-gray-700 uppercase">
                        ERP #
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-medium text-gray-700 uppercase">
                        Customer
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-medium text-gray-700 uppercase">
                        Project
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-medium text-gray-700 uppercase">
                        Amount
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-medium text-gray-700 uppercase">
                        Created
                      </th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-medium text-gray-700 uppercase">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map((order) => (
                      <tr
                        key={order._id}
                        className="border-b border-gray-200 hover:bg-gray-50"
                      >
                        <td className="px-4 sm:px-6 py-3 text-gray-900 font-medium">
                          {order.order_number}
                        </td>
                        <td className="px-4 sm:px-6 py-3 text-gray-600">
                          {order.erp_number || "-"}
                        </td>
                        <td className="px-4 sm:px-6 py-3 text-gray-600">
                          {order.customer_id}
                        </td>
                        <td className="px-4 sm:px-6 py-3 text-gray-600">
                          {order.project_id}
                        </td>
                        <td className="px-4 sm:px-6 py-3 text-gray-600">
                          {/* ✅ unwrap Decimal128 */}
                          {order.amount?.$numberDecimal}
                        </td>
                        <td className="px-4 sm:px-6 py-3 text-gray-600">
                          {/* ✅ use created_at */}
                          {order.created_at
                            ? new Date(order.created_at).toLocaleDateString()
                            : "-"}
                        </td>
                        <td className="px-4 sm:px-6 py-3">
                          <div className="flex items-center gap-2">
                            <Link
                              to={`/orders/${order._id}/edit`}
                              className="w-8 h-8 flex items-center justify-center rounded-md bg-teal-400 hover:bg-teal-500 text-white text-sm"
                            >
                              <FaEdit size={14} />
                            </Link>
                            <button
                              onClick={() => handleDelete(order._id)}
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
              </div>

              {/* Empty State */}
              {filteredOrders.length === 0 && (
                <p className="text-center text-gray-500 py-6 text-sm sm:text-base">
                  No orders found.
                </p>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default OrdersPage;
