import React, { useEffect, useState } from "react";


import { apiClient } from "../../lib/api-client";
import Sidebar from "../../component/sidebar";
import DashboardStats from "../../component/dashboard-stats";

const CustomerDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await apiClient.getDashboardStats();

        // IMPORTANT FIX ⬇️
        setStats(data.stats);

        console.log("Dashboard Stats:", data.stats);
      } catch (err) {
        setError(err.message || "Failed to load dashboard stats");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-50">
      {/* Sidebar - show minimal items for customers */}
      <Sidebar
        items={[
          { label: "Projects", to: "/projects" },
          { label: "Orders", to: "/orders" },
          { label: "Assets", to: "/assets" },
        ]}
      />

      {/* Main content area */}
      <main className="flex-1 overflow-y-auto pt-20 md:pt-0">
        <div className="p-4 sm:p-6 md:p-8">
          {/* Page Header */}
          <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Dashboard
              </h1>
              <p className="mt-1 sm:mt-2 text-sm text-gray-600">
                Welcome back, Customer
              </p>
            </div>
          </div>

          {/* Loading */}
          {loading && (
            <p className="text-center text-gray-600 text-sm">Loading stats...</p>
          )}

          {/* Error */}
          {error && (
            <p className="text-center text-red-600 text-sm mb-4">{error}</p>
          )}

          {/* Stats */}
          {!loading && !error && stats && <DashboardStats stats={stats} />}
        </div>
      </main>
    </div>
  );
};

export default CustomerDashboard;
