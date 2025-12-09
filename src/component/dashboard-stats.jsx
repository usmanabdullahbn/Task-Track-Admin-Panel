import React from "react";
import {
  FaUserTie,
  FaProjectDiagram,
  FaCheckCircle,
  FaTasks,
  FaCubes,
  FaShoppingCart,
  FaSpinner,
  FaClock,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const DashboardStats = ({ stats = {} }) => {
  const navigate = useNavigate();

  const statItems = [
    {
      label: "Total Employees",
      value: stats.totalEmployees ?? 0,
      color: "bg-red-50 border-red-200 text-red-600",
      icon: <FaUserTie />,
    },
    {
      label: "Total Customers",
      value: stats.totalCustomers ?? 0,
      color: "bg-green-50 border-green-200 text-green-600",
      icon: <FaUserTie />,
    },
    {
      label: "Total Assets",
      value: stats.totalAssets ?? 0,
      color: "bg-gray-50 border-gray-200 text-gray-700",
      icon: <FaCubes />,
    },
    {
      label: "Total Projects",
      value: stats.totalProjects ?? 0,
      color: "bg-purple-50 border-purple-200 text-purple-600",
      icon: <FaProjectDiagram />,
    },
    {
      label: "Active Projects",
      value: stats.activeProjects ?? 0,
      color: "bg-indigo-50 border-indigo-200 text-indigo-600",
      icon: <FaSpinner />,
    },
    {
      label: "Completed Projects",
      value: stats.completedProjects ?? 0,
      color: "bg-teal-50 border-teal-200 text-teal-600",
      icon: <FaCheckCircle />,
    },
    {
      label: "Total Orders",
      value: stats.totalOrders ?? 0,
      color: "bg-orange-50 border-orange-200 text-orange-600",
      icon: <FaShoppingCart />,
    },
    {
      label: "Pending Orders",
      value: stats.pendingOrders ?? 0,
      color: "bg-yellow-50 border-yellow-200 text-yellow-600",
      icon: <FaClock />,
    },
    {
      label: "Completed Orders",
      value: stats.completedOrders ?? 0,
      color: "bg-green-50 border-green-200 text-green-600",
      icon: <FaCheckCircle />,
    },
    {
      label: "Total Tasks",
      value: stats.totalTasks ?? 0,
      color: "bg-blue-50 border-blue-200 text-blue-600",
      icon: <FaTasks />,
    },
    {
      label: "Completed Tasks",
      value: stats.completedTasks ?? 0,
      color: "bg-green-50 border-green-200 text-green-600",
      icon: <FaCheckCircle />,
    },
    {
      label: "In Progress Tasks",
      value: stats.inProgressTasks ?? 0,
      color: "bg-purple-50 border-purple-200 text-purple-600",
      icon: <FaSpinner />,
    },
  ];

  // map specific stat labels to routes
  const routeMap = {
    "Total Employees": "/employees",
    "Total Customers": "/customers",
    "Total Assets": "/assets",
    "Total Projects": "/projects",
    "Total Projects": "/projects",
    "Total Orders": "/orders",
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
      {statItems.map((stat) => {
        const route = routeMap[stat.label];
        return (
          <div
            key={stat.label}
            onClick={route ? () => navigate(route) : undefined}
            onKeyDown={
              route
                ? (e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      navigate(route);
                    }
                  }
                : undefined
            }
            role={route ? "button" : undefined}
            tabIndex={route ? 0 : undefined}
            className={`rounded-xl border p-5 sm:p-6 shadow-sm hover:shadow-md transition-shadow ${stat.color} ${
              route ? "cursor-pointer focus:outline-none focus:ring-2 focus:ring-green-300" : ""
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`text-2xl ${stat.color.split(" ")[2]}`}>
                {stat.icon}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                <p className="mt-1 text-2xl font-bold text-gray-900">
                  {stat.value}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default DashboardStats;
