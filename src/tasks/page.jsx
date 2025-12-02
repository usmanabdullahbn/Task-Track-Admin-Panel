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

  // DELETE mock
  // const handleDelete = (id) => {
  //   setTasks((prev) => prev.filter((task) => task.id !== id));
  // };

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
    const matchesSearch =
      task.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.customer?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesAsset = !filters.asset || task.asset === filters.asset;
    const matchesEmployee =
      !filters.employee || task.employee === filters.employee;
    const matchesStatus = !filters.status || task.completed === filters.status;
    const matchesProject = !filters.project || task.project === filters.project;
    const matchesOrder = !filters.order || task.order === filters.order;

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
                    key={task.id}
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
                      {task.duration}
                    </td>

                    <td className="px-4 py-3">
                      <span
                        className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${
                          task.completed === "Yes"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {task.completed}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-gray-600">{task.created_at}</td>

                    <td className="px-4 py-3 flex items-center gap-2">
                      {canEditTask && (
                        <Link
                          to={`/tasks/${task.id}`}
                          className="w-8 h-8 flex items-center justify-center rounded-md bg-teal-400 hover:bg-teal-500 text-white"
                        >
                          <FaEdit size={14} />
                        </Link>
                      )}

                      {canDeleteTask && (
                        <button
                          onClick={() => handleDelete(task.id)}
                          className="w-8 h-8 flex items-center justify-center rounded-md bg-red-400 hover:bg-red-500 text-white"
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
  </div>
);

};

export default TasksPage;
