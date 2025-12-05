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

const CustomerDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem("User"));
  const customer = user?.customer;
  console.log(customer)

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
          apiClient.getAssetsByCustomerId(customer._id),
        ]);

        console.log("Projects:", projectsRes);
        console.log("Orders:", ordersRes);

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
    // {
    //   label: "Total Tasks",
    //   value: stats.totalTasks ?? 0,
    //   color: "from-blue-50 to-blue-100 border-blue-200",
    //   iconBg: "bg-blue-100 text-blue-600 ring-blue-200",
    //   icon: <FaTasks />,
    // },
    // {
    //   label: "Completed Tasks",
    //   value: stats.completedTasks ?? 0,
    //   color: "from-green-50 to-green-100 border-green-200",
    //   iconBg: "bg-green-100 text-green-600 ring-green-200",
    //   icon: <FaCheckCircle />,
    // },
    // {
    //   label: "In Progress Tasks",
    //   value: stats.inProgressTasks ?? 0,
    //   color: "from-purple-50 to-purple-100 border-purple-200",
    //   iconBg: "bg-purple-100 text-purple-600 ring-purple-200",
    //   icon: <FaSpinner />,
    // },
    {
      label: "Total Assets",
      value: stats.totalAssets ?? 0,
      color: "from-gray-50 to-gray-100 border-gray-200",
      iconBg: "bg-gray-200 text-gray-700 ring-gray-300",
      icon: <FaCubes />,
    },
  ];

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
    <div className="flex flex-col md:flex-row h-screen bg-gray-50">
      <CustomerSidebar />
      <main className="flex-1 overflow-y-auto pt-16 md:pt-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {/* Header With Logout */}
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-gray-800">Customer Dashboard</h2>
            {/* <button
              onClick={handleSignOut}
              className="px-4 py-2 bg-red-600 text-white rounded-lg shadow hover:bg-red-700 transition"
            >
              Logout
            </button> */}
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
      </main>
    </div>
  );
};

export default CustomerDashboard;
