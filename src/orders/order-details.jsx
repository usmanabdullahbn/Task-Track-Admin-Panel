import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Sidebar from "../component/sidebar";
import { apiClient } from "../lib/api-client";

const OrderDetailsPage = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await apiClient.getOrderById(id);
        setOrder(res.order);
        setError("");
      } catch (err) {
        setError(err.message || "Failed to load order details");
        setLoading(false);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-screen">
        <Sidebar />
        <main className="flex-1 flex items-center justify-center p-8">
          <p className="text-gray-600">Loading order details...</p>
        </main>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="flex h-screen">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 md:p-8">
            <Link to="/orders" className="text-green-700 hover:text-green-900 mb-4 block">
              ← Back to Orders
            </Link>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-700">{error || "Order not found"}</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const customer = order.customer?.name || order.customer_name || "-";
  const project = order.project?.name || order.project?.title || order.project_name || "-";
  const status = order.status || "-";
  const amount = order.amount?.$numberDecimal || order.amount?.value || "-";
  const orderDate = order.order_date ? new Date(order.order_date).toLocaleDateString() : "-";
  const deliveryDate = order.delivery_date ? new Date(order.delivery_date).toLocaleDateString() : "-";
  const assets = order.assets || [];

  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="p-4 sm:p-6 md:p-8">
          {/* Back Link */}
          <Link to="/orders" className="text-green-700 hover:text-green-900 mb-6 block text-sm font-medium">
            ← Back to Orders
          </Link>

          {/* Order Title */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              {order.title || `Order ${order.order_number || order._id}`}
            </h1>
            {order.description && (
              <p className="text-gray-600 text-sm md:text-base">{order.description}</p>
            )}
          </div>

          {/* Order Details Card */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm mb-8 overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
              {/* Order Number */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Order Number
                </label>
                <p className="text-gray-900 font-medium">{order.order_number || "-"}</p>
              </div>

              {/* ERP Number */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  ERP Number
                </label>
                <p className="text-gray-900 font-medium">{order.erp_number || "-"}</p>
              </div>

              {/* Customer */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Customer
                </label>
                <p className="text-gray-900 font-medium">{customer}</p>
              </div>

              {/* Project */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Project
                </label>
                <p className="text-gray-900 font-medium">{project}</p>
              </div>

              {/* Amount */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Amount
                </label>
                <p className="text-gray-900 font-medium">{amount}</p>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Status
                </label>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                    status === "Completed"
                      ? "bg-green-100 text-green-800"
                      : status === "Active"
                      ? "bg-blue-100 text-blue-800"
                      : status === "Pending"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {status}
                </span>
              </div>

              {/* Order Date */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Order Date
                </label>
                <p className="text-gray-900 font-medium">{orderDate}</p>
              </div>

              {/* Delivery Date */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Delivery Date
                </label>
                <p className="text-gray-900 font-medium">{deliveryDate}</p>
              </div>
            </div>
          </div>

          {/* Assets & Tasks Sections */}
          {assets && assets.length > 0 ? (
            <div className="space-y-6">
              {assets.map((asset, assetIdx) => (
                <div key={assetIdx} className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                  {/* Asset Heading */}
                  <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
                    <h2 className="text-xl md:text-2xl font-bold text-gray-900">
                      {asset.assetTitle || `Asset ${assetIdx + 1}`}
                    </h2>
                  </div>

                  {/* Tasks for this Asset */}
                  <div className="p-6">
                    {asset.tasks && asset.tasks.length > 0 ? (
                      <div className="space-y-4">
                        {asset.tasks.map((task, taskIdx) => (
                          <div
                            key={taskIdx}
                            className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
                          >
                            {/* Task Title */}
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                              {task.title || `Task ${taskIdx + 1}`}
                            </h3>

                            {/* Task Details Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {/* Description */}
                              {task.description && (
                                <div className="md:col-span-2">
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Description
                                  </label>
                                  <p className="text-gray-700 text-sm">{task.description}</p>
                                </div>
                              )}

                              {/* Priority */}
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Priority
                                </label>
                                <span
                                  className={`inline-block px-3 py-1 rounded text-xs font-semibold ${
                                    task.priority === "High"
                                      ? "bg-red-100 text-red-800"
                                      : task.priority === "Medium"
                                      ? "bg-yellow-100 text-yellow-800"
                                      : "bg-green-100 text-green-800"
                                  }`}
                                >
                                  {task.priority || "Normal"}
                                </span>
                              </div>

                              {/* Status */}
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Status
                                </label>
                                <span
                                  className={`inline-block px-3 py-1 rounded text-xs font-semibold ${
                                    task.status === "Completed"
                                      ? "bg-green-100 text-green-800"
                                      : task.status === "In Progress"
                                      ? "bg-blue-100 text-blue-800"
                                      : "bg-gray-100 text-gray-800"
                                  }`}
                                >
                                  {task.status || "Pending"}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-4">No tasks for this asset</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
              <p className="text-yellow-800">No assets assigned to this order yet</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default OrderDetailsPage;
