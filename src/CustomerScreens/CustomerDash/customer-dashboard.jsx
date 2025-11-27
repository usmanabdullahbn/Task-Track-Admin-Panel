import React from "react";
import {
  FaProjectDiagram,
  FaCheckCircle,
  FaTasks,
  FaCubes,
  FaShoppingCart,
  FaSpinner,
  FaClock,
} from "react-icons/fa";

const CustomerDashboard = ({ stats = {} }) => {
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
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-8">
        Customer Dashboard
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 justify-items-center">
        {statItems.map((stat) => (
          <div
            key={stat.label}
            className={`w-full max-w-xs rounded-xl border p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 bg-gradient-to-br ${stat.color}`}
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
