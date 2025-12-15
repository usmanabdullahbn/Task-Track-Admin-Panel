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
} from "react-icons/fa";

/* ===============================
   Dashboard Stats
================================ */
const DashboardStats = ({ stats = {} }) => {
  return (
    <div className="space-y-10">
      {/* ===== TOP SUMMARY ===== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <TopCard
          title="Total Employees"
          value={stats.totalEmployees ?? 0}
          icon={<FaUserTie />}
        />
        <TopCard
          title="Total Customers"
          value={stats.totalCustomers ?? 0}
          icon={<FaUsers />}
        />
        <TopCard
          title="Total Assets"
          value={stats.totalAssets ?? 0}
          icon={<FaCubes />}
        />
        <TopCard
          title="Total Projects"
          value={stats.totalProjects ?? 0}
          icon={<FaProjectDiagram />}
        />
      </div>

      {/* ===== WORK ORDERS ===== */}
      <Section title={`Total work orders  ${stats.totalOrders ?? 0}`}>
        <StatusCard
          title="Completed Orders"
          value={stats.completedOrders ?? 0}
          color="green"
          icon={<FaCheckCircle />}
        />
        <StatusCard
          title="Pending Orders"
          value={stats.pendingOrders ?? 0}
          color="yellow"
          icon={<FaClock />}
        />
        <StatusCard
          title="In Progress Orders"
          value={stats.inProgressOrders ?? 0}
          color="purple"
          icon={<FaSpinner />}
        />
        <StatusCard
          title="Cancelled Orders"
          value={stats.cancelledOrders ?? 0}
          color="red"
          icon={<FaTrash />}
        />
      </Section>

      {/* ===== TASKS ===== */}
      <Section title={`Total Task  ${stats.totalTasks ?? 0}`}>
        <StatusCard
          title="Completed Tasks"
          value={stats.completedTasks ?? 0}
          color="green"
          icon={<FaCheckCircle />}
        />
        <StatusCard
          title="Pending Tasks"
          value={stats.pendingTasks ?? 0}
          color="yellow"
          icon={<FaClock />}
        />
        <StatusCard
          title="In Progress Tasks"
          value={stats.inProgressTasks ?? 0}
          color="purple"
          icon={<FaSpinner />}
        />
        <StatusCard
          title="Cancelled Tasks"
          value={stats.cancelledTasks ?? 0}
          color="red"
          icon={<FaTrash />}
        />
      </Section>
    </div>
  );
};

export default DashboardStats;

/* ===============================
   Components
================================ */

const TopCard = ({ title, value, icon }) => (
  <div className="rounded-xl border bg-gray-100 p-5 shadow-sm">
    <div className="flex items-center gap-3">
      <div className="text-xl text-gray-600">{icon}</div>
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-2xl font-semibold text-gray-900">{value}</p>
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
};

const StatusCard = ({ title, value, icon, color }) => (
  <div className={`rounded-xl border p-5 ${colorMap[color]}`}>
    <div className="flex items-center gap-3">
      <div className="text-xl">{icon}</div>
      <div>
        <p className="text-sm font-medium">{title}</p>
        <p className="text-2xl font-semibold text-gray-900">{value}</p>
      </div>
    </div>
  </div>
);
