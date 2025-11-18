import React from "react";
import {
  FaUsers,
  FaUserTie,
  FaProjectDiagram,
  FaCheckCircle,
  FaTasks,
  FaCubes,
  FaShoppingCart,
  FaSpinner,
  FaClock,
} from "react-icons/fa";

const DashboardStats = ({ stats = {} }) => {
  const statItems = [
    {
      label: "Total Users",
      value: stats.totalUsers || 13,
      color: "bg-blue-50 border-blue-200 text-blue-600",
      icon: <FaUsers />,
    },
    {
      label: "Total Customers",
      value: stats.totalCustomers || 10,
      color: "bg-green-50 border-green-200 text-green-600",
      icon: <FaUserTie />,
    },
    {
      label: "Total Projects",
      value: stats.totalProjects || 16,
      color: "bg-purple-50 border-purple-200 text-purple-600",
      icon: <FaProjectDiagram />,
    },
    {
      label: "Active Projects",
      value: stats.activeProjects || 7,
      color: "bg-indigo-50 border-indigo-200 text-indigo-600",
      icon: <FaSpinner />,
    },
    {
      label: "Completed Projects",
      value: stats.completedProjects || 16,
      color: "bg-teal-50 border-teal-200 text-teal-600",
      icon: <FaCheckCircle />,
    },
    {
      label: "Total Orders",
      value: stats.totalOrders || 9,
      color: "bg-orange-50 border-orange-200 text-orange-600",
      icon: <FaShoppingCart />,
    },
    {
      label: "Pending Orders",
      value: stats.pendingOrders || 8,
      color: "bg-yellow-50 border-yellow-200 text-yellow-600",
      icon: <FaClock />,
    },
    {
      label: "Completed Orders",
      value: stats.completedOrders || 15,
      color: "bg-green-50 border-green-200 text-green-600",
      icon: <FaCheckCircle />,
    },
    {
      label: "Total Tasks",
      value: stats.totalTasks || 16,
      color: "bg-blue-50 border-blue-200 text-blue-600",
      icon: <FaTasks />,
    },
    {
      label: "Completed Tasks",
      value: stats.completedTasks || 17,
      color: "bg-green-50 border-green-200 text-green-600",
      icon: <FaCheckCircle />,
    },
    {
      label: "In Progress Tasks",
      value: stats.inProgressTasks || 9,
      color: "bg-purple-50 border-purple-200 text-purple-600",
      icon: <FaSpinner />,
    },
    {
      label: "Total Assets",
      value: stats.totalAssets || 11,
      color: "bg-gray-50 border-gray-200 text-gray-700",
      icon: <FaCubes />,
    },
    {
      label: "Total Employees",
      value: stats.totalEmployees || 14,
      color: "bg-red-50 border-red-200 text-red-600",
      icon: <FaUserTie />,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
      {statItems.map((stat) => (
        <div
          key={stat.label}
          className={`rounded-xl border p-5 sm:p-6 shadow-sm hover:shadow-md transition-shadow ${stat.color}`}
        >
          <div className="flex items-center gap-3">
            <div className={`text-2xl ${stat.color.split(" ")[2]}`}>{stat.icon}</div>
            <div>
              <p className="text-sm font-medium text-gray-600">{stat.label}</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DashboardStats;
