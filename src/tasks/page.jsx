import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../component/sidebar";
import { tasks as mockTasks } from "../lib/mock-data";
import { FaEdit, FaTrash } from "react-icons/fa";


const TasksPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showMore, setShowMore] = useState(false);
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

  const [tasks, setTasks] = useState(mockTasks);

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

  // -------------------------
  // AUTHORIZATION MATRIX (TASK)
  // -------------------------
  const canAddTask = role === "admin" || role === "manager" || role === "supervisor";
  const canEditTask =
    role === "admin" || role === "manager" || role === "supervisor" || role === "technician";
  const canDeleteTask = role === "admin" || role === "manager";

  // -------------------------
  // HANDLE DELETE (mock)
  // -------------------------
  const handleDelete = (id) => {
    setTasks((prev) => prev.filter((task) => task.id !== id));
  };

  // -------------------------
  // UNIQUE FILTER VALUES
  // -------------------------
  const uniqueValues = useMemo(() => {
    const assets = [...new Set(tasks.map((t) => t.asset))];
    const employees = [...new Set(tasks.map((t) => t.employee))];
    const statuses = [...new Set(tasks.map((t) => t.completed))];
    const projects = [...new Set(tasks.map((t) => t.project))];
    const orders = [...new Set(tasks.map((t) => t.order))];
    return { assets, employees, statuses, projects, orders };
  }, [tasks]);

  // -------------------------
  // FILTER LOGIC
  // -------------------------
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.customer.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesAsset = !filters.asset || task.asset === filters.asset;
    const matchesEmployee = !filters.employee || task.employee === filters.employee;
    const matchesStatus = !filters.status || task.completed === filters.status;
    const matchesProject = !filters.project || task.project === filters.project;
    const matchesOrder = !filters.order || task.order === filters.order;

    const matchesPlanStart =
      !filters.planStart || new Date(task.planStart) >= new Date(filters.planStart);
    const matchesPlanEnd =
      !filters.planEnd || new Date(task.planEnd) <= new Date(filters.planEnd);
    const matchesActualStart =
      !filters.actualStart || new Date(task.actualStart) >= new Date(filters.actualStart);
    const matchesActualEnd =
      !filters.actualEnd || new Date(task.actualEnd) <= new Date(filters.actualEnd);

    return (
      matchesSearch &&
      matchesAsset &&
      matchesEmployee &&
      matchesStatus &&
      matchesProject &&
      matchesOrder &&
      matchesPlanStart &&
      matchesPlanEnd &&
      matchesActualStart &&
      matchesActualEnd
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

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-50">
      <Sidebar />

      <main className="flex-1 overflow-y-auto pt-16 md:pt-0">
        <div className="p-4 sm:p-6 md:p-8">

          {/* HEADER */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Task Management</h1>

            {/* ADD TASK BUTTON (Admin + Manager + Supervisor) */}
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
          ... (UNCHANGED FILTER CODE — KEEP SAME)

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
                    <tr key={task.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">{task.title}</td>
                      <td className="px-4 py-3 text-gray-600">{task.customer}</td>
                      <td className="px-4 py-3 text-gray-600">{task.project}</td>
                      <td className="px-4 py-3 text-gray-600">{task.order}</td>
                      <td className="px-4 py-3 text-gray-600">{task.asset}</td>
                      <td className="px-4 py-3 text-gray-600">{task.employee}</td>
                      <td className="px-4 py-3 text-gray-600">{task.duration}</td>

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

                      <td className="px-4 py-3 text-gray-600">{task.created}</td>

                      {/* ACTION BUTTONS */}
                      <td className="px-4 py-3 flex items-center gap-2">

                        {/* EDIT: (Admin + Manager + Supervisor + Technician) */}
                      {canEditTask && (
  <Link
    to={`/tasks/${task.id}`}
    className="w-8 h-8 flex items-center justify-center rounded-md bg-teal-400 hover:bg-teal-500 text-white"
  >
    <FaEdit size={14} />
  </Link>
)}


                        {/* DELETE: (Admin + Manager ONLY) */}
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

            {/* EMPTY STATE */}
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
