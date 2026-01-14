import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaEdit, FaTrash } from "react-icons/fa";
import { apiClient, FILE_BASE_URL } from "../lib/api-client";
import EditTaskModal from "./EditTaskModal";

const OrderTasksSection = ({
  order,
  orderTasks,
  onAddTask,
  onEditTask,
  onDeleteTask,
  onPrintTask,
}) => {
  const incoming = Array.isArray(orderTasks?.[order._id]) ? orderTasks[order._id] : [];
  const [tasksList, setTasksList] = useState(incoming);
  const [deletingId, setDeletingId] = useState(null);

  // confirmation modal state
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [deleteError, setDeleteError] = useState(null);

  // edit task modal state
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editTask, setEditTask] = useState(null);

  // files modal state
  const [showFilesModal, setShowFilesModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  useEffect(() => {
    setTasksList(incoming);
  }, [order._id, orderTasks]);

  const openConfirm = (task) => {
    setTaskToDelete(task);
    setDeleteError(null);
    setShowConfirmDelete(true);
  };

  const cancelConfirm = () => {
    setShowConfirmDelete(false);
    setTaskToDelete(null);
    setDeleteError(null);
  };

  const confirmDelete = async () => {
    if (!taskToDelete?._id) return;
    const taskId = taskToDelete._id;
    try {
      setDeletingId(taskId);
      setDeleteError(null);
      await apiClient.deleteTask(taskId);
      setTasksList((prev) => prev.filter((t) => t._id !== taskId));
      onDeleteTask && onDeleteTask(taskId);
      cancelConfirm();
    } catch (err) {
      console.error("Failed to delete task:", err);
      setDeleteError("Failed to delete task. See console for details.");
    } finally {
      setDeletingId(null);
    }
  };

  // replace previous Link edit action with modal opener
  const openEditModal = (task) => {
    setEditTask(task);
    setIsEditOpen(true);
  };

  const handleUpdatedTask = (updated) => {
    // update local list
    setTasksList((prev) => prev.map((t) => (t._id === updated._id ? updated : t)));
    setIsEditOpen(false);
    setEditTask(null);
    // notify parent if needed
    onEditTask && onEditTask(updated);
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

  return (
    <div className="ml-4">
      {/* HEADER WITH ADD TASK BUTTON */}
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-semibold text-gray-900">
          Tasks for Order: {order.order_number || order._id}
        </h4>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAddTask && onAddTask(order._id);
          }}
          className="rounded-lg bg-green-700 px-4 py-2 text-sm font-medium text-white hover:bg-green-800 transition-colors"
        >
          + Add Task
        </button>
      </div>

      {/* TASKS TABLE OR EMPTY STATE */}
      {Array.isArray(tasksList) && tasksList.length > 0 ? (
        <div className="overflow-x-auto mt-3">
          <table className="w-full text-sm border border-gray-200">
            <thead>
              <tr className="bg-gray-100 border-b border-gray-200">
                <th className="px-3 py-2 text-left">Title</th>
                <th className="px-3 py-2 text-left">Status</th>
                <th className="px-3 py-2 text-left">Priority</th>
                <th className="px-3 py-2 text-left">Assigned To</th>
                <th className="px-3 py-2 text-left">Created</th>
                <th className="px-3 py-2 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {tasksList.map((task) => (
                <tr
                  key={task._id}
                  className="border-b border-gray-200 hover:bg-white"
                >
                  <td className="px-3 py-2 font-medium text-gray-900">
                    {task.title || "-"}
                  </td>
                  <td className="px-3 py-2">{task.status || "-"}</td>
                  <td className="px-3 py-2">{task.priority || "-"}</td>
                  <td className="px-3 py-2">
                    {task.assigned_to?.name || task.user.name || "-"}
                  </td>
                  <td className="px-3 py-2">
                    {task.created_at
                      ? new Date(task.created_at).toLocaleDateString()
                      : "-"}
                  </td>
                  <td className="px-3 py-2 text-center" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-center gap-2">
                      {/* VIEW FILES */}
                      <button
                        onClick={(e) => { e.stopPropagation(); openFilesModal(task); }}
                        className="w-7 h-7 flex items-center justify-center rounded-md bg-blue-400 hover:bg-blue-500 text-white transition"
                        title="View Files"
                      >
                        📁
                      </button>

                      {/* EDIT BUTTON (open modal) */}
                      <button
                        onClick={(e) => { e.stopPropagation(); openEditModal(task); }}
                        className="w-7 h-7 flex items-center justify-center rounded-md bg-teal-400 hover:bg-teal-500 text-white transition"
                        title="Edit task"
                      >
                        <FaEdit size={12} />
                      </button>

                      {/* DELETE BUTTON */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openConfirm(task);
                        }}
                        disabled={deletingId === task._id}
                        className={`w-7 h-7 flex items-center justify-center rounded-md text-white transition ${
                          deletingId === task._id ? "bg-gray-300 cursor-wait" : "bg-red-400 hover:bg-red-500"
                        }`}
                        title="Delete task"
                      >
                        <FaTrash size={12} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-gray-500 mt-3">No tasks found for this order.</p>
      )}

      {/* Edit Task Modal */}
      <EditTaskModal
        isOpen={isEditOpen}
        onClose={() => { setIsEditOpen(false); setEditTask(null); }}
        task={editTask}
        onUpdated={handleUpdatedTask}
      />

      {/* Confirm Delete Modal */}
      {showConfirmDelete && taskToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="absolute inset-0 backdrop-blur-sm z-40" />
          <div className="relative bg-white rounded-lg shadow-xl p-6 w-full max-w-sm mx-2 z-50">
            <h2 className="text-lg font-semibold mb-4 text-gray-900">Confirm Delete</h2>
            <p className="mb-4 text-gray-700">
              Are you sure you want to delete task{" "}
              <span className="font-bold">{taskToDelete.title || taskToDelete._id}</span>?
            </p>
            {deleteError && <p className="text-sm text-red-500 mb-3">{deleteError}</p>}
            <div className="flex justify-end gap-3">
              <button
                onClick={cancelConfirm}
                className="px-4 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deletingId === taskToDelete._id}
                className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 transition-colors"
              >
                {deletingId === taskToDelete._id ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
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
                              src={file.url.startsWith('http') ? file.url : `${FILE_BASE_URL}${file.url}`}
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
                          href={file.url.startsWith('http') ? file.url : `${FILE_BASE_URL}${file.url}`}
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

export default OrderTasksSection;