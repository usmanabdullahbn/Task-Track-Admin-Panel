import React, { useEffect, useState } from "react";
import { FaTimes } from "react-icons/fa";
import { apiClient } from "../lib/api-client";

const EditTaskModal = ({ isOpen, onClose, task, onUpdated }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "Medium",
    status: "Todo",
    plan_duration: "",
    start_time: "",
    end_time: "",
    actual_start_time: "",
    actual_end_time: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!task) return;
    setFormData({
      title: task.title || "",
      description: task.description || "",
      priority: task.priority || "Medium",
      status: task.status || "Todo",
      plan_duration: task.plan_duration ?? "",
      start_time: task.start_time || "",
      end_time: task.end_time || "",
      actual_start_time: task.actual_start_time || "",
      actual_end_time: task.actual_end_time || "",
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
        plan_duration: formData.plan_duration === "" ? undefined : Number(formData.plan_duration),
        start_time: formData.start_time || undefined,
        end_time: formData.end_time || undefined,
        actual_start_time: formData.actual_start_time || undefined,
        actual_end_time: formData.actual_end_time || undefined,
      };

      const updated = await apiClient.updateTask(task._id, payload);
      const updatedTask = updated?.task ?? updated;
      onUpdated && onUpdated(updatedTask || task);
      onClose && onClose();
    } catch (err) {
      console.error("EditTaskModal: update failed", err);
      setError(err?.message || "Failed to update task");
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
          {error && <p className="text-red-500 mb-3">{error}</p>}
          <form onSubmit={handleSubmit} className="space-y-4">
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

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Plan Duration (hours)</label>
              <input type="number" name="plan_duration" value={formData.plan_duration} onChange={handleChange} step="0.5" min="0" className="w-full px-3 py-2 border rounded" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Start Time</label>
                <input type="datetime-local" name="start_time" value={formData.start_time} onChange={handleChange} className="w-full px-3 py-2 border rounded" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">End Time</label>
                <input type="datetime-local" name="end_time" value={formData.end_time} onChange={handleChange} className="w-full px-3 py-2 border rounded" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Actual Start Time</label>
                <input type="datetime-local" name="actual_start_time" value={formData.actual_start_time} onChange={handleChange} className="w-full px-3 py-2 border rounded" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Actual End Time</label>
                <input type="datetime-local" name="actual_end_time" value={formData.actual_end_time} onChange={handleChange} className="w-full px-3 py-2 border rounded" />
              </div>
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