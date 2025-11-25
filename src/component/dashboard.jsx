import React, { useEffect, useState } from "react";
import Sidebar from "./sidebar";
import DashboardStats from "./dashboard-stats";
import { apiClient } from "../lib/api-client"

const DashboardContent = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await apiClient.getDashboardStats();
        setStats(data);
        console.log(data)
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
      {/* Sidebar */}
      <Sidebar />

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
                Welcome back, Admin
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

          {/* Stats Section */}
          {!loading && !error && stats && <DashboardStats stats={stats} />}
        </div>
      </main>
    </div>
  );
};

export default DashboardContent;
