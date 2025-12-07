import React, { useState, useEffect } from "react";
import { FaTimes } from "react-icons/fa";
import { apiClient } from "../lib/api-client";

const AddTaskModal = ({ isOpen, onClose, onSubmit, orderId }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "Medium",
    status: "Todo",
    plan_duration: "",
    // order data
    order: {
      id: "",
      title: "",
    },
    // customer data
    customer: {
      id: "",
      name: "",
    },
    // user data
    user: {
      id: "",
      name: "",
    },
    // project data
    project: {
      id: "",
      name: "",
    },
  });

  // order detail state
  const [orderDetail, setOrderDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [detailError, setDetailError] = useState(null);

  useEffect(() => {
    let mounted = true;
    const fetchDetail = async () => {
      if (!orderId) {
        setOrderDetail(null);
        return;
      }
      setLoadingDetail(true);
      setDetailError(null);
      try {
        const data = await apiClient.getOrderById(orderId);
        const fetched = data?.order ?? data;
        console.log("getOrderById ->", fetched);

        if (mounted) {
          setOrderDetail(fetched);

          // populate formData with order data
          setFormData((prev) => ({
            ...prev,
            order: {
              id: fetched._id || "",
              title: fetched.title || "",
            },
            customer: {
              id: fetched.customer?.id || "",
              name: fetched.customer?.name || "",
            },
            user: {
              id: fetched.user?.id || "",
              name: fetched.user?.name || "",
            },
            project: {
              id: fetched.project?.id || "",
              name: fetched.project?.name || "",
            },
          }));
        }
      } catch (err) {
        console.error("AddTaskModal: failed to fetch order detail", err);
        if (mounted) setDetailError("Failed to load order details");
      } finally {
        if (mounted) setLoadingDetail(false);
      }
    };

    fetchDetail();
    return () => {
      mounted = false;
    };
  }, [orderId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((s) => ({ ...s, [name]: value }));
  };

  const handleSubmit = (e) => {
    e && e.preventDefault();
    // submit with all required fields from order
    onSubmit(formData);

    // reset form
    setFormData({
      title: "",
      description: "",
      priority: "Medium",
      status: "Todo",
      plan_duration: "",
      order: {
        id: "",
        title: "",
      },
      customer: {
        id: "",
        name: "",
      },
      user: {
        id: "",
        name: "",
      },
      project: {
        id: "",
        name: "",
      },
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Add New Task</h2>
            {loadingDetail ? (
              <div className="text-sm text-gray-500">Loading order...</div>
            ) : detailError ? (
              <div className="text-sm text-red-500">{detailError}</div>
            ) : orderDetail ? (
              <div className="text-sm text-gray-600">
                Order:{" "}
                <span className="font-medium">
                  {orderDetail.order_number || orderDetail._id}
                </span>
                {orderDetail.title ? ` — ${orderDetail.title}` : ""}
              </div>
            ) : orderId ? (
              <div className="text-sm text-gray-600">
                Order ID:{" "}
                <span className="font-medium">{orderId}</span>
              </div>
            ) : null}
          </div>

          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <FaTimes size={20} />
          </button>
        </div>

        {/* FORM - SCROLLABLE */}
        <div className="flex-1 overflow-y-auto p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* TITLE */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Task Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter task title"
              />
            </div>

            {/* DESCRIPTION */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="3"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Enter task description"
              ></textarea>
            </div>

            {/* priority / status grid */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Priority
                </label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="Todo">Todo</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="On Hold">On Hold</option>
                </select>
              </div>
            </div>

            {/* plan duration */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Plan Duration (Hours)
              </label>
              <input
                type="number"
                name="plan_duration"
                value={formData.plan_duration}
                onChange={handleChange}
                min="0"
                step="0.5"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter duration in hours"
              />
            </div>

            {/* ORDER INFO (READ-ONLY) */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">
                Order Details (Auto-filled)
              </h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-600">Order ID:</span>
                  <div className="font-medium text-gray-900">
                    {formData.order.id || "-"}
                  </div>
                </div>
                <div>
                  <span className="text-gray-600">Order Title:</span>
                  <div className="font-medium text-gray-900">
                    {formData.order.title || "-"}
                  </div>
                </div>
                <div>
                  <span className="text-gray-600">Customer:</span>
                  <div className="font-medium text-gray-900">
                    {formData.customer.name || "-"}
                  </div>
                </div>
                <div>
                  <span className="text-gray-600">Project:</span>
                  <div className="font-medium text-gray-900">
                    {formData.project.name || "-"}
                  </div>
                </div>
                <div>
                  <span className="text-gray-600">Assigned User:</span>
                  <div className="font-medium text-gray-900">
                    {formData.user.name || "-"}
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* ACTION BUTTONS - FIXED AT BOTTOM */}
        <div className="flex justify-end gap-3 p-8 border-t border-gray-200 bg-white">
          <button
            type="button"
            className="px-5 py-2 bg-gray-200 text-gray-800 font-medium rounded-lg hover:bg-gray-300 transition"
            onClick={onClose}
          >
            Cancel
          </button>

          <button
            type="button"
            className="px-5 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition"
            onClick={handleSubmit}
          >
            Add Task
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddTaskModal;
