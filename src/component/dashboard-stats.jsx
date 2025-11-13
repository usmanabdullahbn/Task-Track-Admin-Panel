import React from "react";
import {
  FaUsers,
  FaProjectDiagram,
  FaShoppingCart,
  FaCubes,
  FaClock,
  FaSpinner,
  FaPauseCircle,
  FaFolderOpen,
  FaCalendarDay,
  FaExclamationCircle,
} from "react-icons/fa";

const DashboardStats = () => {
  const stats = [
    // --- Previous Boxes ---
    {
      label: "Total Customers",
      value: "12",
      color: "bg-blue-50 border-blue-200 text-blue-600",
      icon: <FaUsers />,
    },
    {
      label: "Active Projects",
      value: "8",
      color: "bg-purple-50 border-purple-200 text-purple-600",
      icon: <FaProjectDiagram />,
    },
    {
      label: "Pending Orders",
      value: "15",
      color: "bg-orange-50 border-orange-200 text-orange-600",
      icon: <FaShoppingCart />,
    },
    {
      label: "Assets",
      value: "45",
      color: "bg-green-50 border-green-200 text-green-600",
      icon: <FaCubes />,
    },

    // --- Work Order Status Boxes ---
    {
      label: "Pending",
      value: "8",
      color: "bg-yellow-50 border-yellow-200 text-yellow-600",
      icon: <FaClock />,
    },
    {
      label: "In Progress",
      value: "5",
      color: "bg-green-50 border-green-200 text-green-600",
      icon: <FaSpinner />,
    },
    {
      label: "On Hold",
      value: "3",
      color: "bg-purple-50 border-purple-200 text-purple-600",
      icon: <FaPauseCircle />,
    },
    {
      label: "Open",
      value: "10",
      color: "bg-blue-50 border-blue-200 text-blue-600",
      icon: <FaFolderOpen />,
    },
    {
      label: "Due Today",
      value: "2",
      color: "bg-orange-50 border-orange-200 text-orange-600",
      icon: <FaCalendarDay />,
    },
    {
      label: "Past Due",
      value: "4",
      color: "bg-red-50 border-red-200 text-red-600",
      icon: <FaExclamationCircle />,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
      {stats.map((stat) => (
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
