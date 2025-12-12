import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Sidebar from "../component/sidebar";
import { FaEdit, FaTrash } from "react-icons/fa";
import { apiClient } from "../lib/api-client";

const OrderDetailsPage = () => {
  const { id } = useParams();

  const [order, setOrder] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const orderRes = await apiClient.getOrderById(id);
        setOrder(orderRes.order);

        const taskRes = await apiClient.getTasksByOrderId(id);
        setTasks(taskRes.tasks || []);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-screen">
        <Sidebar />
        <main className="flex-1 flex items-center justify-center text-gray-600">
          Loading...
        </main>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex h-screen">
        <Sidebar />
        <main className="flex-1 p-6">
          <p className="text-red-600">Order not found</p>
        </main>
      </div>
    );
  }

  // Group tasks by asset
  const groupedByAsset = tasks.reduce((acc, t) => {
    const assetName = t.asset?.name || "Unknown Asset";
    if (!acc[assetName]) acc[assetName] = [];
    acc[assetName].push(t);
    return acc;
  }, {});

  return (
    <div className="flex h-screen">
      <Sidebar />

      <main className="flex-1 overflow-y-auto bg-gray-50 p-6 md:p-8">
        {/* BACK BUTTON */}
        <Link
          to="/orders"
          className="text-green-700 hover:text-green-900 block mb-6 text-sm"
        >
          ← Back to Orders
        </Link>

        {/* ===================== ORDER SECTION ===================== */}
        <div className="bg-white shadow-sm border rounded-lg p-6 mb-10">
          <h1 className="text-3xl font-bold mb-2 text-gray-900">
            {order.title || `Order ${order.order_number}`}
          </h1>

          <p className="text-gray-600 mb-6">{order.description}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="font-semibold text-gray-700 text-sm">
                Order #
              </label>
              <p className="text-gray-900">{order.order_number}</p>
            </div>

            <div>
              <label className="font-semibold text-gray-700 text-sm">
                ERP #
              </label>
              <p className="text-gray-900">{order.erp_number || "-"}</p>
            </div>

            <div>
              <label className="font-semibold text-gray-700 text-sm">
                Customer
              </label>
              <p className="text-gray-900">{order.customer?.name}</p>
            </div>

            <div>
              <label className="font-semibold text-gray-700 text-sm">
                Project
              </label>
              <p className="text-gray-900">{order.project?.name}</p>
            </div>

            <div>
              <label className="font-semibold text-gray-700 text-sm">
                Amount
              </label>
              <p className="text-gray-900">{order.amount?.$numberDecimal}</p>
            </div>

            <div>
              <label className="font-semibold text-gray-700 text-sm">
                Status
              </label>
              <span
                className={`px-3 py-1 text-xs rounded-full font-semibold ${
                  order.status === "Completed"
                    ? "bg-green-100 text-green-800"
                    : order.status === "Active"
                    ? "bg-blue-100 text-blue-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {order.status}
              </span>
            </div>
          </div>
        </div>

        {/* ===================== TASKS SECTION ===================== */}
        {/* ===================== TASKS SECTION ===================== */}
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Tasks</h2>

        {Object.keys(groupedByAsset).length === 0 ? (
          <p className="text-gray-500">No tasks found.</p>
        ) : (
          Object.keys(groupedByAsset).map((assetName, index) => (
            <div
              key={index}
              className="mb-10 bg-white border shadow-md rounded-xl overflow-hidden"
            >
              {/* Asset Header */}
              <div className="bg-green-600 p-4">
                <h3 className="text-xl font-semibold text-white">
                  {assetName}
                </h3>
              </div>

              {/* Modern Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-100 text-gray-700 border-b">
                      <th className="px-4 py-3 text-left">Title</th>
                      <th className="px-4 py-3 text-left">Status</th>
                      <th className="px-4 py-3 text-left">Priority</th>
                      <th className="px-4 py-3 text-left">Assigned</th>
                      <th className="px-4 py-3 text-left">Start</th>
                      <th className="px-4 py-3 text-left">End</th>
                      <th className="px-4 py-3 text-left">Created</th>
                      <th className="px-4 py-3 text-left">Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {groupedByAsset[assetName].map((task) => (
                      <tr
                        key={task._id}
                        className="border-b hover:bg-gray-50 transition"
                      >
                        <td className="px-4 py-3 font-medium text-gray-900">
                          {task.title}
                        </td>

                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-1 text-xs font-semibold rounded-full 
                      ${
                        task.status === "Completed"
                          ? "bg-green-100 text-green-700"
                          : task.status === "Active"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                          >
                            {task.status}
                          </span>
                        </td>

                        <td className="px-4 py-3">{task.priority}</td>

                        <td className="px-4 py-3">{task.user?.name || "-"}</td>

                        <td className="px-4 py-3">
                          {task.start_time
                            ? new Date(task.start_time).toLocaleString()
                            : "-"}
                        </td>

                        <td className="px-4 py-3">
                          {task.end_time
                            ? new Date(task.end_time).toLocaleString()
                            : "-"}
                        </td>

                        <td className="px-4 py-3 text-gray-600">
                          {new Date(task.created_at).toLocaleDateString()}
                        </td>

                        {/* ACTION BUTTONS WITH ICONS */}
                        <td className="px-4 py-3 flex items-center gap-2">
                          {/* EDIT BUTTON */}
                          <button
                            className="p-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white shadow flex items-center justify-center"
                            onClick={() => console.log("edit", task._id)}
                          >
                            <FaEdit size={14} />
                          </button>

                          {/* DELETE BUTTON */}
                          <button
                            className="p-2 rounded-lg bg-red-500 hover:bg-red-600 text-white shadow flex items-center justify-center"
                            onClick={() => console.log("delete", task._id)}
                          >
                            <FaTrash size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))
        )}
      </main>
    </div>
  );
};

export default OrderDetailsPage;
