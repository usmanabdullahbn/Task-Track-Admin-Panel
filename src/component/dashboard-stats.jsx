import React from "react";
import {
  FaUserTie,
  FaUsers,
  FaCubes,
  FaProjectDiagram,
  FaCheckCircle,
  FaClock,
  FaSpinner,
  FaTrash,
  FaListUl,
  FaPauseCircle,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const DashboardStats = ({ stats = {} }) => {
  const navigate = useNavigate();

  const topRoutes = {
    "Total Employees": "/employees",
    "Total Customers": "/customers",
    "Total Assets": "/assets",
    "Total Projects": "/projects",
  };

  const orderRoutes = {
    "Completed Orders": "/orders?status=completed",
    "Pending Orders": "/orders?status=pending",
    "In Progress Orders": "/orders?status=in-progress",
    "Cancelled Orders": "/orders?status=cancelled",
  };

  const taskRoutes = {
    "Completed Tasks": "/tasks?status=completed",
    "Todo Tasks": "/tasks?status=todo",
    "In Progress Tasks": "/tasks?status=in-progress",
    "On Hold Tasks": "/tasks?status=on-hold",
  };

  return (
    <div className="space-y-10">
      {/* ===== TOP SUMMARY ===== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: "Total Employees", value: stats.totalEmployees, icon: <FaUserTie /> },
          { title: "Total Customers", value: stats.totalCustomers, icon: <FaUsers /> },
          { title: "Total Assets", value: stats.totalAssets, icon: <FaCubes /> },
          { title: "Total Projects", value: stats.totalProjects, icon: <FaProjectDiagram /> },
        ].map((item) => (
          <TopCard
            key={item.title}
            {...item}
            onClick={() => navigate(topRoutes[item.title])}
          />
        ))}
      </div>

      {/* ===== WORK ORDERS ===== */}
      <Section title={`Total work orders  ${stats.totalOrders ?? 0}`}>
        {[
          { title: "Completed Orders", value: stats.completedOrders, color: "green", icon: <FaCheckCircle /> },
          { title: "Pending Orders", value: stats.pendingOrders, color: "yellow", icon: <FaClock /> },
          { title: "In Progress Orders", value: stats.inProgressOrders, color: "purple", icon: <FaSpinner /> },
          { title: "Cancelled Orders", value: stats.cancelledOrders, color: "red", icon: <FaTrash /> },
        ].map((item) => (
          <StatusCard
            key={item.title}
            {...item}
            onClick={() => navigate(orderRoutes[item.title])}
          />
        ))}
      </Section>

      {/* ===== TASKS ===== */}
      <Section title={`Total Task  ${stats.totalTasks ?? 0}`}>
        {[
          { title: "Completed Tasks", value: stats.completedTasks, color: "green", icon: <FaCheckCircle /> },
          { title: "Pending Tasks", value: stats.todoTasks, color: "blue", icon: <FaListUl /> },
          { title: "In Progress Tasks", value: stats.inProgressTasks, color: "purple", icon: <FaSpinner /> },
          { title: "Cancelled Task", value: stats.onHoldTasks, color: "red", icon: <FaTrash />},
        ].map((item) => (
          <StatusCard
            key={item.title}
            {...item}
            // onClick={() => navigate(taskRoutes[item.title])}
          />
        ))}
      </Section>
    </div>
  );
};

export default DashboardStats;

/* ===============================
   Components
================================ */

const TopCard = ({ title, value = 0, icon, onClick }) => (
  <div
    onClick={onClick}
    role="button"
    tabIndex={0}
    onKeyDown={(e) => e.key === "Enter" && onClick()}
    className="rounded-xl border bg-white p-5 shadow-sm cursor-pointer
               hover:shadow-md transition focus:outline-none focus:ring-2 focus:ring-green-300"
  >
    <div className="flex items-center gap-3">
      <div className="text-xl text-gray-600">{icon}</div>
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-2xl font-semibold text-gray-900">{value ?? 0}</p>
      </div>
    </div>
  </div>
);

const Section = ({ title, children }) => (
  <div>
    <h2 className="mb-4 text-lg font-semibold text-gray-900">{title}</h2>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {children}
    </div>
  </div>
);

const colorMap = {
  green: "bg-green-50 border-green-200 text-green-600",
  yellow: "bg-yellow-50 border-yellow-200 text-yellow-600",
  purple: "bg-purple-50 border-purple-200 text-purple-600",
  red: "bg-red-50 border-red-200 text-red-600",
  blue: "bg-blue-50 border-blue-200 text-blue-600",
};

const StatusCard = ({ title, value = 0, icon, color, onClick }) => (
  <div
    onClick={onClick}
    role="button"
    tabIndex={0}
    onKeyDown={(e) => e.key === "Enter" && onClick()}
    className={`rounded-xl border p-5 cursor-pointer
      hover:shadow-md transition focus:outline-none focus:ring-2 focus:ring-green-300
      ${colorMap[color]}`}
  >
    <div className="flex items-center gap-3">
      <div className="text-xl">{icon}</div>
      <div>
        <p className="text-sm font-medium">{title}</p>
        <p className="text-2xl font-semibold text-gray-900">{value}</p>
      </div>
    </div>
  </div>
);
