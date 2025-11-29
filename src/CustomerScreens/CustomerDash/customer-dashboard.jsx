import React, { useEffect, useState } from "react";
import {
  FaProjectDiagram,
  FaCheckCircle,
  FaTasks,
  FaCubes,
  FaShoppingCart,
  FaSpinner,
  FaClock,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { apiClient } from "../../lib/api-client";

const CustomerDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({});
  const customer = JSON.parse(localStorage.getItem("User"))?.customer;

  const handleSignOut = () => {
    try {
      localStorage.removeItem("User");
    } catch (e) {
      // ignore
    }
    navigate("/login", { replace: true });
  };

  useEffect(() => {
    const fetchStats = async () => {
      if (!customer) return;

      try {
        const [projectsRes, ordersRes] = await Promise.all([
          apiClient.getProjectByCustomerId(customer._id),
          apiClient.getOrdersByCustomerId(customer._id),
        ]);

        const projects = projectsRes.projects || projectsRes;
        const orders = ordersRes.orders || ordersRes;

        // 🔹 Project stats
        const totalProjects = projects.length;
        const activeProjects = projects.filter(p => p.status === "Active").length;
        const completedProjects = projects.filter(p => p.status === "Completed").length;

        // 🔹 Order stats
        const totalOrders = orders.length;
        const pendingOrders = orders.filter(o => o.status === "Pending").length;
        const completedOrders = orders.filter(o => o.status === "Completed").length;

        // 🔹 Task stats
        let allTasks = [];
        for (const project of projects) {
          try {
            const taskRes = await apiClient.getTasksByProjectId(project._id);
            const tasks = taskRes.tasks || taskRes;
            allTasks = allTasks.concat(tasks);
          } catch (err) {
            console.warn(`Failed to fetch tasks for project ${project._id}`, err);
          }
        }

        const totalTasks = allTasks.length;
        const completedTasks = allTasks.filter(t => t.status === "Completed").length;
        const inProgressTasks = allTasks.filter(
          t =>
            t.status === "In Progress" ||
            t.status === "Todo" ||
            t.status === "On Hold"
        ).length;

        setStats({
          totalProjects,
          activeProjects,
          completedProjects,
          totalOrders,
          pendingOrders,
          completedOrders,
          totalTasks,
          completedTasks,
          inProgressTasks,
          totalAssets: 0,
        });
      } catch (err) {
        console.error("Failed to fetch dashboard stats", err);
      }
    };

    fetchStats();
  }, [customer]);

  const statItems = [
    {
      label: "Total Projects",
      value: stats.totalProjects ?? 0,
      color: "from-purple-50 to-purple-100 border-purple-200",
      iconBg: "bg-purple-100 text-purple-600 ring-purple-200",
      icon: <FaProjectDiagram />,
    },
    {
      label: "Active Projects",
      value: stats.activeProjects ?? 0,
      color: "from-indigo-50 to-indigo-100 border-indigo-200",
      iconBg: "bg-indigo-100 text-indigo-600 ring-indigo-200",
      icon: <FaSpinner />,
    },
    {
      label: "Completed Projects",
      value: stats.completedProjects ?? 0,
      color: "from-teal-50 to-teal-100 border-teal-200",
      iconBg: "bg-teal-100 text-teal-600 ring-teal-200",
      icon: <FaCheckCircle />,
    },
    {
      label: "Total Orders",
      value: stats.totalOrders ?? 0,
      color: "from-orange-50 to-orange-100 border-orange-200",
      iconBg: "bg-orange-100 text-orange-600 ring-orange-200",
      icon: <FaShoppingCart />,
    },
    {
      label: "Pending Orders",
      value: stats.pendingOrders ?? 0,
      color: "from-yellow-50 to-yellow-100 border-yellow-200",
      iconBg: "bg-yellow-100 text-yellow-600 ring-yellow-200",
      icon: <FaClock />,
    },
    {
      label: "Completed Orders",
      value: stats.completedOrders ?? 0,
      color: "from-green-50 to-green-100 border-green-200",
      iconBg: "bg-green-100 text-green-600 ring-green-200",
      icon: <FaCheckCircle />,
    },
    {
      label: "Total Tasks",
      value: stats.totalTasks ?? 0,
      color: "from-blue-50 to-blue-100 border-blue-200",
      iconBg: "bg-blue-100 text-blue-600 ring-blue-200",
      icon: <FaTasks />,
    },
    {
      label: "Completed Tasks",
      value: stats.completedTasks ?? 0,
      color: "from-green-50 to-green-100 border-green-200",
      iconBg: "bg-green-100 text-green-600 ring-green-200",
      icon: <FaCheckCircle />,
    },
    {
      label: "In Progress Tasks",
      value: stats.inProgressTasks ?? 0,
      color: "from-purple-50 to-purple-100 border-purple-200",
      iconBg: "bg-purple-100 text-purple-600 ring-purple-200",
      icon: <FaSpinner />,
    },
    {
      label: "Total Assets",
      value: stats.totalAssets ?? 0,
      color: "from-gray-50 to-gray-100 border-gray-200",
      iconBg: "bg-gray-200 text-gray-700 ring-gray-300",
      icon: <FaCubes />,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header With Logout */}
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800">Customer Dashboard</h2>
        <button
          onClick={handleSignOut}
          className="px-4 py-2 bg-red-600 text-white rounded-lg shadow hover:bg-red-700 transition"
        >
          Logout
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 justify-items-center">
        {statItems.map((stat) => (
          <div
            key={stat.label}
            className={`w-full max-w-xs rounded-xl border p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ${stat.color}`}
          >
            <div className="flex items-center gap-5">
              <div
                className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl ring-4 ring-opacity-30 ${stat.iconBg}`}
              >
                {stat.icon}
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500">
                  {stat.label}
                </p>
                <p className="mt-1 text-3xl font-extrabold text-gray-900">
                  {stat.value}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CustomerDashboard;
