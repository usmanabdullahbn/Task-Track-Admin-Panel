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
import CustomerSidebar from "./customer-sidebar";
import Logo1 from "../../images/logo 1.png";
import Logo2 from "../../images/logo 2.png";

const CustomerDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem("User"));
  const customer = user?.user;
  console.log(customer._id)

  useEffect(() => {
    const fetchStats = async () => {
      if (!customer?._id) {
        console.log("No customer found");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const [projectsRes, ordersRes, assetsRes] = await Promise.all([
          apiClient.getProjectByCustomerId(customer._id),
          apiClient.getOrdersByCustomerId(customer._id),
          apiClient.getAssetByCustomerId(customer._id),
        ]);

        const projects = Array.isArray(projectsRes) ? projectsRes : (projectsRes.projects || []);
        const orders = Array.isArray(ordersRes) ? ordersRes : (ordersRes.orders || []);
        const assets = Array.isArray(assetsRes) ? assetsRes : (assetsRes.assets || []);

        const totalProjects = projects.length;
        const activeProjects = projects.filter(p => p.status === "Active").length;
        const completedProjects = projects.filter(p => p.status === "Completed").length;

        const totalOrders = orders.length;
        const pendingOrders = orders.filter(o => o.status === "Pending").length;
        const completedOrders = orders.filter(o => o.status === "Completed").length;

        const totalAssets = assets.length;

        setStats({
          totalProjects,
          activeProjects,
          completedProjects,
          totalOrders,
          pendingOrders,
          completedOrders,
          totalAssets,
        });
      } catch (err) {
        console.error("Failed to fetch dashboard stats:", err);
        setStats({
          totalProjects: 0,
          activeProjects: 0,
          completedProjects: 0,
          totalOrders: 0,
          pendingOrders: 0,
          completedOrders: 0,
          totalAssets: 0,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [customer?._id]);

  const topRoutes = {
    "Total Projects": "/customer-projects",
    "Total Orders": "/customer-orders",
    "Total Assets": "/customer-assets",
  };

  const orderRoutes = {
    "Completed Orders": "/customer-orders",
    "Pending Orders": "/customer-orders",
  };

  const projectRoutes = {
    "Active Projects": "/customer-projects",
    "Completed Projects": "/customer-projects",
  };

  if (loading) {
    return (
      <div className="flex flex-col md:flex-row h-screen bg-gray-50">
        <CustomerSidebar />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-gray-600">Loading dashboard...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <CustomerSidebar />
      <main className="flex-1 overflow-y-auto pt-20 md:pt-0">
        <div className="p-4 sm:p-6 md:p-8">
          {/* Header Logos */}
          <div className="mb-6 flex items-center justify-between rounded-lg bg-white p-4 shadow-sm">
            <img
              src={Logo1}
              alt="Company Logo"
              className="h-10 md:h-16 object-contain"
            />
            <img
              src={Logo2}
              alt="Brand Logo"
              className="h-10 md:h-16 object-contain"
            />
          </div>

          <div className="space-y-10">
            {/* ===== TOP SUMMARY ===== */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { title: "Total Projects", value: stats.totalProjects, icon: <FaProjectDiagram /> },
                { title: "Total Orders", value: stats.totalOrders, icon: <FaShoppingCart /> },
                { title: "Total Assets", value: stats.totalAssets, icon: <FaCubes /> },
              ].map((item) => (
                <TopCard
                  key={item.title}
                  {...item}
                  onClick={() => navigate(topRoutes[item.title])}
                />
              ))}
            </div>

            {/* ===== PROJECTS ===== */}
            <Section title={`Total Projects  ${stats.totalProjects ?? 0}`}>
              {[
                { title: "Active Projects", value: stats.activeProjects, color: "purple", icon: <FaSpinner /> },
                { title: "Completed Projects", value: stats.completedProjects, color: "green", icon: <FaCheckCircle /> },
              ].map((item) => (
                <StatusCard
                  key={item.title}
                  {...item}
                  onClick={() => navigate(projectRoutes[item.title])}
                />
              ))}
            </Section>

            {/* ===== ORDERS ===== */}
            <Section title={`Total Orders  ${stats.totalOrders ?? 0}`}>
              {[
                { title: "Completed Orders", value: stats.completedOrders, color: "green", icon: <FaCheckCircle /> },
                { title: "Pending Orders", value: stats.pendingOrders, color: "yellow", icon: <FaClock /> },
              ].map((item) => (
                <StatusCard
                  key={item.title}
                  {...item}
                  onClick={() => navigate(orderRoutes[item.title])}
                />
              ))}
            </Section>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CustomerDashboard;

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
