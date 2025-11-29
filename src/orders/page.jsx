import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../component/sidebar";
import { FaEdit, FaTrash } from "react-icons/fa";
import { apiClient } from "../lib/api-client";

const OrdersPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchField, setSearchField] = useState("order");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  // -------------------------
  // PERMISSIONS BASED ON AUTH MATRIX
  // -------------------------
  const canAddOrder =
    role === "admin" || role === "manager" || role === "supervisor";

  const canEditOrder = role === "admin" || role === "manager";

  const canDeleteOrder = role === "admin" || role === "manager";

  // -------------------------
  // FETCH WORK ORDERS
  // -------------------------
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const data = await apiClient.getOrders();

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

  // -------------------------
  // DELETE ORDER
  // -------------------------
  const handleDelete = async (id) => {
    try {
      await apiClient.deleteOrder(id);
      setOrders((prev) => prev.filter((order) => order._id !== id));
    } catch (err) {
      console.error("Failed to delete order:", err);
    }
  };

  // -------------------------
  // FILTERING
  // -------------------------
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
              {/* SEARCH SECTION */}
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

              {/* TABLE */}
              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px] text-sm sm:text-base">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="px-4 py-3">Order #</th>
                      <th className="px-4 py-3">ERP #</th>
                      <th className="px-4 py-3">Customer</th>
                      <th className="px-4 py-3">Project</th>
                      <th className="px-4 py-3">Amount</th>
                      <th className="px-4 py-3">Created</th>
                      <th className="px-4 py-3">Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredOrders.map((order) => (
                      <tr
                        key={order._id}
                        className="border-b border-gray-200 hover:bg-gray-50"
                      >
                        <td className="px-4 py-3 font-medium text-gray-900">
                          {order.order_number}
                        </td>
                        <td className="px-4 py-3">{order.erp_number || "-"}</td>
                        <td className="px-4 py-3">{order.customer_id}</td>
                        <td className="px-4 py-3">{order.project_id}</td>
                        <td className="px-4 py-3">
                          {order.amount?.$numberDecimal}
                        </td>
                        <td className="px-4 py-3">
                          {order.created_at
                            ? new Date(order.created_at).toLocaleDateString()
                            : "-"}
                        </td>

                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            {/* EDIT BUTTON (Admin + Manager) */}
                            {canEditOrder && (
                              <Link
                                to={`/orders/${order._id}/edit`}
                                className="w-8 h-8 flex items-center justify-center rounded-md bg-teal-400 hover:bg-teal-500 text-white"
                              >
                                <FaEdit size={14} />
                              </Link>
                            )}

                            {/* DELETE BUTTON (Admin + Manager) */}
                            {canDeleteOrder && (
                              <button
                                onClick={() => handleDelete(order._id)}
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

              {filteredOrders.length === 0 && (
                <p className="text-center text-gray-500 py-6 sm:text-base">
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
