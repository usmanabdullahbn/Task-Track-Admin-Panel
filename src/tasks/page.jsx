import React, { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../component/sidebar";
import { FaEdit, FaTrash } from "react-icons/fa";
import { apiClient } from "../lib/api-client";

const TasksPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    asset: "",
    employee: "",
    status: "",
    project: "",
    order: "",
    planStart: "",
    planEnd: "",
    actualStart: "",
    actualEnd: "",
  });

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);

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

  // AUTH MATRIX
  const canAddTask = ["admin", "manager", "supervisor"].includes(role);
  const canEditTask = ["admin", "manager", "supervisor", "technician"].includes(
    role
  );
  const canDeleteTask = ["admin", "manager"].includes(role);

  const openDeleteModal = (task) => {
    setTaskToDelete(task);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setTaskToDelete(null);
  };

  const handleDelete = async (id) => {
    const idToDelete = id;
    setDeletingId(idToDelete);
    try {
      await apiClient.deleteTask(idToDelete);
      setTasks((prev) =>
        prev.filter(
          (task) => (task.id || task._id) !== idToDelete
        )
      );
      closeDeleteModal();
    } catch (err) {
      console.error("Failed to delete task:", err);
    } finally {
      setDeletingId(null);
    }
  };
  // LOAD TASKS
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await apiClient.getTasks();
        setTasks(res.tasks || []);
      } catch (err) {
        console.error("Failed to load tasks", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  // -------------------------
  // UNIQUE VALUES (FIX ADDED)
  // -------------------------

  const uniqueValues = useMemo(() => {
    return {
      assets: tasks.map((t) => t.asset).filter(Boolean),
      employees: tasks.map((t) => t.employee).filter(Boolean),
      statuses: [...new Set(tasks.map((t) => t.completed))],
      projects: tasks.map((t) => t.project).filter(Boolean),
      orders: tasks.map((t) => t.order).filter(Boolean),
    };
  }, [tasks]);

  // -------------------------
  // FILTER LOGIC
  // -------------------------
  const filteredTasks = tasks.filter((task) => {
    const title = task.title || "";
    const customerName = task.customer?.name || "";
    const search = (searchTerm || "").toLowerCase();
    const matchesSearch =
      title.toLowerCase().includes(search) ||
      customerName.toLowerCase().includes(search);

    const assetId = task.asset?.id || task.asset?._id || "";
    const employeeId = task.employee?.id || task.employee?._id || "";
    const projectId = task.project?.id || task.project?._id || "";
    const orderId = task.order?.id || task.order?._id || "";

    const matchesAsset = !filters.asset || assetId === filters.asset;
    const matchesEmployee = !filters.employee || employeeId === filters.employee;
    const matchesStatus =
      !filters.status || String(task.completed) === String(filters.status);
    const matchesProject = !filters.project || projectId === filters.project;
    const matchesOrder = !filters.order || orderId === filters.order;

    return (
      matchesSearch &&
      matchesAsset &&
      matchesEmployee &&
      matchesStatus &&
      matchesProject &&
      matchesOrder
    );
  });

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const resetFilters = () => {
    setFilters({
      asset: "",
      employee: "",
      status: "",
      project: "",
      order: "",
      planStart: "",
      planEnd: "",
      actualStart: "",
      actualEnd: "",
    });
    setSearchTerm("");
  };

  // -------------------------
  // JSX BELOW (FULL + FIXED)
  // -------------------------

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-50">
      <Sidebar />

      <main className="flex-1 overflow-y-auto pt-16 md:pt-0">
        <div className="p-4 sm:p-6 md:p-8">
          {/* HEADER */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Task Management
            </h1>

            {canAddTask && (
              <Link
                to="/tasks/new"
                className="rounded-lg bg-green-700 px-4 py-2 text-sm font-medium text-white hover:bg-green-800 transition-colors"
              >
                + Add Task
              </Link>
            )}
          </div>

          {/* FILTERS */}
          <div className="rounded-lg border border-gray-200 bg-white shadow-sm mb-6 p-4 sm:p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Search */}
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-1">
                  Search
                </label>
                <input
                  type="text"
                  placeholder="Search by title or customer..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-1 focus:ring-green-700 focus:outline-none"
                />
              </div>

              {/* Asset */}
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-1">
                  Asset
                </label>
                <select
                  name="asset"
                  value={filters.asset}
                  onChange={handleFilterChange}
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-green-700 focus:outline-none"
                >
                  <option value="">All Assets</option>
                  {uniqueValues.assets.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Employee */}
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-1">
                  Employee
                </label>
                <select
                  name="employee"
                  value={filters.employee}
                  onChange={handleFilterChange}
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-green-700 focus:outline-none"
                >
                  <option value="">All Employees</option>
                  {uniqueValues.employees.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status */}
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  name="status"
                  value={filters.status}
                  onChange={handleFilterChange}
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-green-700 focus:outline-none"
                >
                  <option value="">All Statuses</option>
                  {uniqueValues.statuses.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Reset */}
            <div className="flex justify-end">
              <button
                onClick={resetFilters}
                className="text-sm font-medium text-gray-700 hover:text-green-700 underline"
              >
                Reset Filters
              </button>
            </div>
          </div>

          {/* TABLE */}
          <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-sm sm:text-base">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="px-4 py-3 text-left">Title</th>
                    <th className="px-4 py-3 text-left">Customer</th>
                    <th className="px-4 py-3 text-left">Project</th>
                    <th className="px-4 py-3 text-left">Order</th>
                    <th className="px-4 py-3 text-left">Asset</th>
                    <th className="px-4 py-3 text-left">Employee</th>
                    <th className="px-4 py-3 text-left">Duration</th>
                    <th className="px-4 py-3 text-left">Completed</th>
                    <th className="px-4 py-3 text-left">Created</th>
                    <th className="px-4 py-3 text-left">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredTasks.map((task) => (
                    <tr
                      key={task.id || task._id}
                      className="border-b border-gray-200 hover:bg-gray-50"
                    >
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {task.title}
                      </td>

                      {/* FIXED: Display names instead of objects */}
                      <td className="px-4 py-3 text-gray-600">
                        {task.customer?.name}
                      </td>

                      <td className="px-4 py-3 text-gray-600">
                        {task.project?.name}
                      </td>

                      <td className="px-4 py-3 text-gray-600">
                        {task.order?.name}
                      </td>

                      <td className="px-4 py-3 text-gray-600">
                        {task.asset?.name}
                      </td>

                      <td className="px-4 py-3 text-gray-600">
                        {task.employee?.name}
                      </td>

                      <td className="px-4 py-3 text-gray-600">
                        {(() => {
                          const start = new Date(task.start_time);
                          const end = new Date(task.end_time);
                          const diffMs = end - start; // difference in ms
                          const diffHours = diffMs / (1000 * 60 * 60); // convert to hours
                          return diffHours + " hours";
                        })()}
                      </td>

                      <td className="px-4 py-3">
                        <span
                          className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${
                            task.completed === true
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {task.completed === true ? "Yes" : "No"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {new Date(task.created_at).toLocaleDateString()}
                      </td>

                      <td className="px-4 py-3 flex items-center gap-2">
                        {canEditTask && (
                          <Link
                            to={`/tasks/${task.id || task._id}`}
                            className="w-8 h-8 flex items-center justify-center rounded-md bg-teal-400 hover:bg-teal-500 text-white"
                          >
                            <FaEdit size={14} />
                          </Link>
                        )}

                        {canDeleteTask && (
                          <button
                            onClick={() => openDeleteModal(task)}
                            disabled={deletingId === (task.id || task._id)}
                            className="w-8 h-8 flex items-center justify-center rounded-md bg-red-400 hover:bg-red-500 text-white disabled:opacity-50"
                          >
                            <FaTrash size={13} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredTasks.length === 0 && (
              <p className="text-center text-gray-500 py-6">No tasks found.</p>
            )}
          </div>
        </div>
      </main>

      {/* DELETE CONFIRMATION MODAL */}
      {showDeleteModal && taskToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="rounded-lg bg-white shadow-lg max-w-sm w-full mx-4">
            {/* Header */}
            <div className="border-b border-gray-200 px-6 py-4">
              <h2 className="text-lg font-bold text-gray-900">Delete Task</h2>
            </div>

            {/* Body */}
            <div className="px-6 py-4">
              <p className="text-gray-600 mb-2">
                Are you sure you want to delete this task?
              </p>
              <p className="font-semibold text-gray-900">
                {taskToDelete.title}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                This action cannot be undone.
              </p>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 px-6 py-4 flex gap-3 justify-end">
              <button
                onClick={closeDeleteModal}
                disabled={deletingId === (taskToDelete.id || taskToDelete._id)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(taskToDelete.id || taskToDelete._id)}
                disabled={deletingId === (taskToDelete.id || taskToDelete._id)}
                className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 disabled:opacity-50"
              >
                {deletingId === (taskToDelete.id || taskToDelete._id)
                  ? "Deleting..."
                  : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TasksPage;