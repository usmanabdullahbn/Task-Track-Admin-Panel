import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Sidebar from "../component/sidebar";
import { FaEdit, FaTrash, FaChevronDown, FaChevronUp, FaPlus } from "react-icons/fa";
import { apiClient } from "../lib/api-client";
import EditTaskModal from "./EditTaskModal";
import AddTaskModal from "./AddTaskModal";

const OrderDetailsPage = () => {
  const { id } = useParams();

  const [order, setOrder] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingTask, setEditingTask] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteConfirmTask, setDeleteConfirmTask] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(null);
  const [expandedAssets, setExpandedAssets] = useState({});
  const [expandedTasks, setExpandedTasks] = useState({});
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [assetTableExpanded, setAssetTableExpanded] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const orderRes = await apiClient.getOrderById(id);
        setOrder(orderRes.order);

        const taskRes = await apiClient.getTasksByOrderId(id);
        const loadedTasks = taskRes.tasks || [];
        setTasks(loadedTasks);

        // Initialize all assets as expanded by default
        const groupedByAsset = loadedTasks.reduce((acc, t) => {
          const assetName = t.asset?.name || "Unknown Asset";
          if (!acc[assetName]) acc[assetName] = [];
          acc[assetName].push(t);
          return acc;
        }, {});

        // Set all assets as expanded
        const initialExpandedAssets = {};
        Object.keys(groupedByAsset).forEach((assetName) => {
          initialExpandedAssets[assetName] = true;
        });
        setExpandedAssets(initialExpandedAssets);
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

  const handleEditTask = (task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTask(null);
  };

  const handleTaskUpdated = (updatedTask) => {
    setTasks((prevTasks) =>
      prevTasks.map((t) => (t._id === updatedTask._id ? updatedTask : t))
    );
    handleCloseModal();
  };

  const handleDeleteClick = (task) => {
    setDeleteConfirmTask(task);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirmTask) return;

    setIsDeleting(true);
    try {
      await apiClient.deleteTask(deleteConfirmTask._id);
      setTasks((prevTasks) =>
        prevTasks.filter((t) => t._id !== deleteConfirmTask._id)
      );
      setDeleteSuccess(deleteConfirmTask.title);
      setShowDeleteConfirm(false);
      setDeleteConfirmTask(null);

      // Clear success message after 3 seconds
      setTimeout(() => setDeleteSuccess(null), 3000);
    } catch (err) {
      console.error("Failed to delete task:", err);
      alert("Failed to delete task. Please try again.");
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
    setDeleteConfirmTask(null);
  };

  const toggleAssetExpansion = (assetName) => {
    setExpandedAssets((prev) => ({
      ...prev,
      [assetName]: !prev[assetName],
    }));
  };

  const toggleTaskExpansion = (taskId) => {
    setExpandedTasks((prev) => ({
      ...prev,
      [taskId]: !prev[taskId],
    }));
  };

  const handleOpenAddTask = () => {
    setIsAddTaskModalOpen(true);
  };

  const handleCloseAddTask = () => {
    setIsAddTaskModalOpen(false);
  };

  const handleTaskSubmit = async (taskData) => {
    try {
      // The task data will be submitted and the modal will handle the API call
      // After successful submission, reload tasks
      const taskRes = await apiClient.getTasksByOrderId(id);
      setTasks(taskRes.tasks || []);
      handleCloseAddTask();
    } catch (err) {
      console.error("Failed to add task:", err);
    }
  };

  return (
    <div className="flex h-screen">
      <Sidebar />

      <main className={`flex-1 overflow-y-auto bg-gray-50 p-6 md:p-8 ${isModalOpen || isAddTaskModalOpen ? "blur-sm" : ""}`}>
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
                className={`px-3 py-1 text-xs rounded-full font-semibold ${order.status === "Completed"
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

        {/* Task Section Header with Add Button */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Task(s)</h2>
          <button
            onClick={handleOpenAddTask}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded flex items-center gap-2 transition"
            title="Add Task"
          >
            <FaPlus size={16} />
            Add Task
          </button>
        </div>

        {Object.keys(groupedByAsset).length === 0 ? (
          <p className="text-gray-500">No tasks found.</p>
        ) : (
          Object.keys(groupedByAsset).map((assetName, index) => (
            <div
              key={index}
              className="mb-10 bg-white border shadow-md rounded-xl overflow-hidden"
            >
              {/* Asset Header - Collapsible */}
              <button
                onClick={() => toggleAssetExpansion(assetName)}
                className="w-full bg-green-600 p-4 flex items-center justify-between hover:bg-green-700 transition text-white"
              >
                <h3 className="text-xl font-semibold">
                  Task(s) for asset: {assetName}
                </h3>
                <span>
                  {expandedAssets[assetName] ? (
                    <FaChevronUp size={20} />
                  ) : (
                    <FaChevronDown size={20} />
                  )}
                </span>
              </button>

              {/* Modern Table - Collapsible */}
              {expandedAssets[assetName] && (
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
                        <th className="px-4 py-3 text-left flex items-center justify-between">
                          <span>Action</span>
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {groupedByAsset[assetName].map((task) => (
                        <React.Fragment key={task._id}>
                          {/* Main Task Row - Clickable */}
                          <tr
                            className="border-b hover:bg-gray-50 transition cursor-pointer"
                            onClick={() => toggleTaskExpansion(task._id)}
                          >
                            <td className="px-4 py-3 font-medium text-gray-900">
                              <div className="flex items-center gap-2">
                                <span>
                                  {expandedTasks[task._id] ? (
                                    <FaChevronUp size={14} />
                                  ) : (
                                    <FaChevronDown size={14} />
                                  )}
                                </span>
                                {task.title}
                              </div>
                            </td>

                            <td className="px-4 py-3">
                              <span
                                className={`px-2 py-1 text-xs font-semibold rounded-full 
                        ${task.status === "Completed"
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
                            <td
                              className="px-4 py-3 flex items-center gap-2"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {/* EDIT BUTTON */}
                              <button
                                className="p-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white shadow flex items-center justify-center"
                                onClick={() => handleEditTask(task)}
                              >
                                <FaEdit size={14} />
                              </button>

                              {/* DELETE BUTTON */}
                              <button
                                className="p-2 rounded-lg bg-red-500 hover:bg-red-600 text-white shadow flex items-center justify-center"
                                onClick={() => handleDeleteClick(task)}
                              >
                                <FaTrash size={14} />
                              </button>
                            </td>
                          </tr>

                          {/* Expanded Task Details Row */}
                          {expandedTasks[task._id] && (
                            <tr className="border-b bg-blue-50">
                              <td colSpan="8" className="px-4 py-6">
                                <div className="space-y-6">
                                  {/* Title Section */}
                                  <div>
                                    <h4 className="text-lg font-bold text-gray-900 mb-4">
                                      {task.title}
                                    </h4>
                                  </div>

                                  {/* Two Column Layout */}
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Left Column */}
                                    <div className="space-y-4">
                                      {/* Status */}
                                      <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                                          Status
                                        </label>
                                        <span
                                          className={`inline-block px-3 py-1 text-sm font-semibold rounded-full ${task.status === "Completed"
                                              ? "bg-green-100 text-green-800"
                                              : task.status === "Active"
                                                ? "bg-blue-100 text-blue-800"
                                                : task.status === "In Progress"
                                                  ? "bg-yellow-100 text-yellow-800"
                                                  : "bg-gray-100 text-gray-800"
                                            }`}
                                        >
                                          {task.status}
                                        </span>
                                      </div>

                                      {/* Priority */}
                                      <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                                          Priority
                                        </label>
                                        <p className="text-gray-900">{task.priority}</p>
                                      </div>

                                      {/* Assigned To */}
                                      <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                                          Assigned To
                                        </label>
                                        <p className="text-gray-900">{task.user?.name || "-"}</p>
                                      </div>

                                      {/* Duration */}
                                      <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                                          Duration (hours)
                                        </label>
                                        <p className="text-gray-900">{task.plan_duration || "-"}</p>
                                      </div>
                                    </div>

                                    {/* Right Column */}
                                    <div className="space-y-4">
                                      {/* Start Time */}
                                      <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                                          Start Time
                                        </label>
                                        <p className="text-gray-900">
                                          {task.start_time
                                            ? new Date(task.start_time).toLocaleString()
                                            : "-"}
                                        </p>
                                      </div>

                                      {/* End Time */}
                                      <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                                          End Time
                                        </label>
                                        <p className="text-gray-900">
                                          {task.end_time
                                            ? new Date(task.end_time).toLocaleString()
                                            : "-"}
                                        </p>
                                      </div>

                                      {/* Created At */}
                                      <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                                          Created At
                                        </label>
                                        <p className="text-gray-900">
                                          {task.created_at
                                            ? new Date(task.created_at).toLocaleString()
                                            : "-"}
                                        </p>
                                      </div>

                                      {/* Last Modified */}
                                      <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                                          Last Modified
                                        </label>
                                        <p className="text-gray-900">
                                          {task.updated_at
                                            ? new Date(task.updated_at).toLocaleString()
                                            : "-"}
                                        </p>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Description - Full Width */}
                                  {task.description && (
                                    <div>
                                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Description
                                      </label>
                                      <p className="text-gray-700 text-sm leading-relaxed">
                                        {task.description}
                                      </p>
                                    </div>
                                  )}

                                  {/* Image Attachment - Full Width */}
                                  {task.file_upload && (
                                    <div>
                                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Attachment
                                      </label>
                                      <a
                                        href={task.file_upload}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:text-blue-800 underline text-sm"
                                      >
                                        View Attachment
                                      </a>
                                    </div>
                                  )}
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))
        )}
      </main>

      {/* EDIT TASK MODAL */}
      <EditTaskModal
        isOpen={isModalOpen}
        task={editingTask}
        onClose={handleCloseModal}
        onUpdated={handleTaskUpdated}
      />

      {/* ADD TASK MODAL */}
      <AddTaskModal
        isOpen={isAddTaskModalOpen}
        onClose={handleCloseAddTask}
        onSubmit={handleTaskSubmit}
        orderId={id}
      />

      {/* DELETE CONFIRMATION MODAL */}
      {showDeleteConfirm && deleteConfirmTask && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full mx-4">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Delete Task</h2>
            </div>
            <div className="p-6">
              <p className="text-gray-700 mb-2">
                Are you sure you want to delete this task?
              </p>
              <p className="text-gray-900 font-semibold">
                "{deleteConfirmTask.title}"
              </p>
            </div>
            <div className="flex justify-end gap-3 p-4 border-t border-gray-200">
              <button
                onClick={handleCancelDelete}
                disabled={isDeleting}
                className="px-4 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600 disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUCCESS MESSAGE */}
      {deleteSuccess && (
        <div className="fixed bottom-4 right-4 bg-green-100 border border-green-300 rounded-lg p-4 shadow-lg z-50">
          <p className="text-green-800 font-semibold">
            Task "{deleteSuccess}" has been deleted successfully
          </p>
        </div>
      )}
    </div>
  );
};

export default OrderDetailsPage;
