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
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

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
        console.log(data);

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
  const handleDeleteClick = (order) => {
    setSelectedOrder(order);
    setShowConfirmModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedOrder) return;

    try {
      await apiClient.deleteOrder(selectedOrder._id);
      setOrders((prev) =>
        prev.filter((order) => order._id !== selectedOrder._id)
      );
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
      <Sidebar
        className={showConfirmModal || showSuccessModal ? "blur-sm" : ""}
      />

      <main
        className={`flex-1 overflow-y-auto pt-16 md:pt-0 ${
          showConfirmModal || showSuccessModal ? "blur-sm" : ""
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
                      <th className="px-4 py-3">Customer</th>
                      <th className="px-4 py-3">Project</th>
                      <th className="px-4 py-3">Order #</th>
                      <th className="px-4 py-3">ERP #</th>
                      <th className="px-4 py-3">Amount</th>
                      <th className="px-4 py-3">Status</th>
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
                        
                        <td className="px-4 py-3">{order.customer.name}</td>
                        <td className="px-4 py-3">{order.project.name}</td>
                        <td className="px-4 py-3 font-medium text-gray-900">
                          {order.order_number}
                        </td>
                        <td className="px-4 py-3">{order.erp_number || "-"}</td>
                        <td className="px-4 py-3">
                          {order.amount?.$numberDecimal}
                        </td>
                        <td className="px-4 py-3">{order.status}</td>

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

              {filteredOrders.length === 0 && (
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
          <div className="absolute inset-0 backdrop-blur-sm z-40"></div>

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
          <div className="absolute inset-0 backdrop-blur-sm z-40"></div>

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
    </div>
  );
};

export default OrdersPage;
