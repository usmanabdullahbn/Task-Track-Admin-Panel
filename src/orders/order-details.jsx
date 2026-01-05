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

  // files modal state
  const [showFilesModal, setShowFilesModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

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

  // files modal functions
  const openFilesModal = (task) => {
    setSelectedTask(task);
    setShowFilesModal(true);
  };

  const closeFilesModal = () => {
    setShowFilesModal(false);
    setSelectedTask(null);
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

  const computeActualHours = (task) => {
    // Prefer explicit value from DB if present
    if (task.actual_hours !== undefined && task.actual_hours !== null) {
      return task.actual_hours;
    }

    if (task.actual_start_time && task.actual_end_time) {
      const s = new Date(task.actual_start_time);
      const e = new Date(task.actual_end_time);
      const diffHours = (e - s) / (1000 * 60 * 60);
      if (!Number.isFinite(diffHours)) return "-";
      return diffHours.toFixed(2);
    }

    return "-";
  };

  const computePlannedHours = (task) => {
    // Prefer explicit plan_duration if present
    if (task.plan_duration !== undefined && task.plan_duration !== null) {
      return task.plan_duration;
    }

    if (task.start_time && task.end_time) {
      const s = new Date(task.start_time);
      const e = new Date(task.end_time);
      const diffHours = (e - s) / (1000 * 60 * 60);
      if (!Number.isFinite(diffHours)) return "-";
      return diffHours.toFixed(2);
    }

    return "-";
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

          {/* Signature */}
          {order.file_upload && order.file_upload.length > 0 && (
            <div className="mt-4">
              <label className="font-semibold text-gray-700 text-sm">
                Signature
              </label>
              <div className="mt-1">
                {(() => {
                  const lastFile = order.file_upload[order.file_upload.length - 1];
                  console.log(lastFile.url);
                  return (
                    <img
                      src={lastFile.url.startsWith('http') ? lastFile.url : `http://localhost:4000${lastFile.url}`}
                      alt="Signature"
                      className="w-24 h-24 object-contain rounded border"
                    />
                  );
                })()}
              </div>
            </div>
          )}
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
                                ? new Date(task.start_time).toLocaleString([], { year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                                : "-"}
                            </td>

                            <td className="px-4 py-3">
                              {task.end_time
                                ? new Date(task.end_time).toLocaleString([], { year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                                : "-"}
                            </td>

                            <td className="px-4 py-3 text-gray-600">
                              {task.created_at ? new Date(task.created_at).toLocaleDateString() : "-"}
                            </td>

                            {/* ACTION BUTTONS WITH ICONS */}
                            <td
                              className="px-4 py-3 flex items-center gap-2"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {/* VIEW FILES */}
                              <button
                                className="p-2 rounded-lg bg-blue-400 hover:bg-blue-500 text-white shadow flex items-center justify-center"
                                onClick={() => openFilesModal(task)}
                                title="View Files"
                              >
                                📁
                              </button>

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
                            <tr className="border-b">
                              <td colSpan="8" className="px-6 py-8  from-blue-50 to-indigo-50">
                                <div className="max-w-6xl mx-auto">
                                  {/* Task Title Card */}
                                  <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-blue-100">
                                    <h4 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                                      <div className="w-2 h-8 bg-blue-500 rounded-full"></div>
                                      {task.title}
                                    </h4>
                                    {task.description && (
                                      <p className="text-gray-600 text-sm leading-relaxed mt-3">
                                        {task.description}
                                      </p>
                                    )}
                                  </div>

                                  {/* Details Grid */}
                                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    {/* Status & Priority Card */}
                                    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                                      <h5 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                        <span className="text-blue-500">📊</span> Status & Priority
                                      </h5>
                                      <div className="space-y-4">
                                        <div>
                                          <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                                            Status
                                          </label>
                                          <span
                                            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                              task.status === "Completed"
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
                                        <div>
                                          <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                                            Priority
                                          </label>
                                          <p className="text-gray-900 font-medium">{task.priority}</p>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Assignment & Duration Card */}
                                    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                                      <h5 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                        <span className="text-green-500">👤</span> Assignment & Duration
                                      </h5>
                                      <div className="space-y-4">
                                        <div>
                                          <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                                            Assigned To
                                          </label>
                                          <p className="text-gray-900 font-medium">{task.user?.name || "-"}</p>
                                        </div>
                                        <div>
                                          <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                                            Planned Duration
                                          </label>
                                          <p className="text-gray-900 font-medium">{task.plan_duration ? `${task.plan_duration} hours` : "-"}</p>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Timings Card */}
                                    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                                      <h5 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                        <span className="text-purple-500">⏰</span> Timings
                                      </h5>
                                      <div className="space-y-4">
                                        <div>
                                          <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                                            Start Time
                                          </label>
                                          <p className="text-gray-900 text-sm">
                                            {task.start_time
                                              ? new Date(task.start_time).toLocaleString([], { year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                                              : "-"}
                                          </p>
                                        </div>
                                        <div>
                                          <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                                            End Time
                                          </label>
                                          <p className="text-gray-900 text-sm">
                                            {task.end_time
                                              ? new Date(task.end_time).toLocaleString([], { year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                                              : "-"}
                                          </p>
                                        </div>
                                        <div>
                                          <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                                            Total Planned Hours
                                          </label>
                                          <p className="text-gray-900 font-semibold text-lg">{computePlannedHours(task)}</p>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Actuals Card */}
                                    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 lg:col-span-2">
                                      <h5 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                        <span className="text-orange-500">✅</span> Actual Performance
                                      </h5>
                                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                          <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                                            Actual Start
                                          </label>
                                          <p className="text-gray-900 text-sm">
                                            {task.actual_start_time
                                              ? new Date(task.actual_start_time).toLocaleString([], { year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                                              : "-"}
                                          </p>
                                        </div>
                                        <div>
                                          <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                                            Actual End
                                          </label>
                                          <p className="text-gray-900 text-sm">
                                            {task.actual_end_time
                                              ? new Date(task.actual_end_time).toLocaleString([], { year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                                              : "-"}
                                          </p>
                                        </div>
                                        <div>
                                          <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                                            Total Actual Hours
                                          </label>
                                          <p className="text-gray-900 font-semibold text-lg">{computeActualHours(task)}</p>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Metadata Card */}
                                    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                                      <h5 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                        <span className="text-gray-500">📅</span> Metadata
                                      </h5>
                                      <div className="space-y-4">
                                        <div>
                                          <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                                            Created At
                                          </label>
                                          <p className="text-gray-900 text-sm">
                                            {task.created_at
                                              ? new Date(task.created_at).toLocaleString()
                                              : "-"}
                                          </p>
                                        </div>
                                        <div>
                                          <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                                            Last Modified
                                          </label>
                                          <p className="text-gray-900 text-sm">
                                            {task.updated_at
                                              ? new Date(task.updated_at).toLocaleString()
                                              : "-"}
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
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

      {/* FILES MODAL */}
      {showFilesModal && selectedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="rounded-lg bg-white shadow-lg max-w-2xl w-full mx-4 max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-900">Files for {selectedTask.title}</h2>
              <button
                onClick={closeFilesModal}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6">
              {selectedTask.file_upload && selectedTask.file_upload.length > 0 ? (
                <div className="space-y-4">
                  {selectedTask.file_upload.map((file, index) => (
                    <div key={index} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-start gap-4">
                        {/* Image Preview */}
                        {file.mimetype && file.mimetype.startsWith('image/') && (
                          <div className="">
                            <img
                              src={file.url.startsWith('http') ? file.url : `http://localhost:4000${file.url}`}
                              alt={file.originalname}
                              className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                            />
                          </div>
                        )}

                        {/* File Info */}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">{file.originalname}</p>
                          <p className="text-sm text-gray-500">
                            Size: {(file.size / 1024).toFixed(2)} KB • Type: {file.mimetype}
                          </p>
                        </div>

                        {/* View Button */}
                        <a
                          href={file.url.startsWith('http') ? file.url : `http://localhost:4000${file.url}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                          View
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-8">No files attached to this task.</p>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 px-6 py-4 flex justify-end">
              <button
                onClick={closeFilesModal}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderDetailsPage;