import React, { useEffect, useState } from "react";
import { FaTimes } from "react-icons/fa";
import { apiClient } from "../lib/api-client";

const EditTaskModal = ({ isOpen, onClose, task, onUpdated }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "Medium",
    status: "Todo",
    start_time: "",
    end_time: "",
    actual_start_time: "",
    actual_end_time: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);

  // Helper function to format date string to datetime-local format
  const formatForDatetimeLocal = (dateString) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "";
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    } catch {
      return "";
    }
  };

  useEffect(() => {
    if (!task) return;
    setFormData({
      title: task.title || "",
      description: task.description || "",
      priority: task.priority || "Medium",
      status: task.status || "Todo",
      start_time: formatForDatetimeLocal(task.start_time),
      end_time: formatForDatetimeLocal(task.end_time),
      actual_start_time: formatForDatetimeLocal(task.actual_start_time),
      actual_end_time: formatForDatetimeLocal(task.actual_end_time),
    });
    setError(null);
  }, [task]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((s) => ({ ...s, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e && e.preventDefault();
    if (!task?._id) return;
    setLoading(true);
    setError(null);
    try {
      // prepare payload - send only relevant fields
      const payload = {
        title: formData.title,
        description: formData.description,
        priority: formData.priority,
        status: formData.status,
        start_time: formData.start_time ? new Date(formData.start_time).toISOString() : undefined,
        end_time: formData.end_time ? new Date(formData.end_time).toISOString() : undefined,
        actual_start_time: formData.actual_start_time ? new Date(formData.actual_start_time).toISOString() : undefined,
        actual_end_time: formData.actual_end_time ? new Date(formData.actual_end_time).toISOString() : undefined,
      };

      if (selectedFiles.length > 0) {
        const fd = new FormData();
        Object.keys(payload).forEach((k) => {
          if (payload[k] !== undefined && payload[k] !== null) fd.append(k, payload[k]);
        });
        selectedFiles.forEach((file) => fd.append('files', file));
        const updated = await apiClient.updateTask(task._id, fd);
        const updatedTask = updated?.task ?? updated;
        onUpdated && onUpdated(updatedTask || task);
      } else {
        const updated = await apiClient.updateTask(task._id, payload);
        const updatedTask = updated?.task ?? updated;
        onUpdated && onUpdated(updatedTask || task);
      }
      onClose && onClose();
    } catch (err) {
      console.error("EditTaskModal: update failed", err);
      setError(err.message || "Failed to update task. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Edit Task</h2>
            <div className="text-sm text-gray-600">{task?.title ? `Editing: ${task.title}` : `Task ID: ${task?._id || "-"}`}</div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
            <FaTimes size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* ERROR MESSAGE */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Title</label>
              <input name="title" value={formData.title} onChange={handleChange} required className="w-full px-3 py-2 border rounded" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
              <textarea name="description" value={formData.description} onChange={handleChange} rows={3} className="w-full px-3 py-2 border rounded" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Priority</label>
                <select name="priority" value={formData.priority} onChange={handleChange} className="w-full px-3 py-2 border rounded">
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Status</label>
                <select name="status" value={formData.status} onChange={handleChange} className="w-full px-3 py-2 border rounded">
                  <option value="Todo">Todo</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="On Hold">On Hold</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Plan Start Time</label>
                <input 
                  type="datetime-local" 
                  name="start_time" 
                  value={formData.start_time} 
                  onChange={handleChange} 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors" 
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Plan End Time</label>
                <input 
                  type="datetime-local" 
                  name="end_time" 
                  value={formData.end_time} 
                  onChange={handleChange} 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors" 
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Actual Start Time</label>
                <input 
                  type="datetime-local" 
                  name="actual_start_time" 
                  value={formData.actual_start_time} 
                  onChange={handleChange} 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors" 
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Actual End Time</label>
                <input 
                  type="datetime-local" 
                  name="actual_end_time" 
                  value={formData.actual_end_time} 
                  onChange={handleChange} 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors" 
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Attachments</label>
              <input
                type="file"
                multiple
                name="files"
                accept=".pdf,.doc,.docx,.csv"
                onChange={(e) => {
                  const files = Array.from(e.target.files);
                  console.log("Selected files for task update:", files);
                  setSelectedFiles(files);
                }}
                className="w-full border-2 border-gray-300 rounded-lg px-4 py-2.5 bg-white
               text-gray-900 file:bg-green-700 file:text-white 
               file:border-none file:px-4 file:py-2 file:mr-4 
               file:rounded-md file:cursor-pointer
               hover:file:bg-green-800 transition cursor-pointer"
              />
              <p className="text-xs text-gray-500 mt-1">
                You can select multiple PDF, Word, or CSV files.
              </p>
            </div>
          </form>
        </div>

        <div className="flex justify-end gap-3 p-4 border-t border-gray-200 bg-white">
          <button onClick={onClose} className="px-4 py-2 rounded border">Cancel</button>
          <button onClick={handleSubmit} disabled={loading} className="px-4 py-2 rounded bg-teal-500 text-white">
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditTaskModal;