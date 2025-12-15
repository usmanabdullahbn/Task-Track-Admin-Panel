import React, { useEffect, useState } from "react";
import { apiClient } from "../lib/api-client";
import DashboardStats from "./dashboard-stats";
import Sidebar from "./sidebar";

import Logo1 from "../images/logo 1.png";
import Logo2 from "../images/logo 2.png";

const DashboardContent = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const user = JSON.parse(localStorage.getItem("User"))?.user;

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await apiClient.getDashboardStats();
        setStats(response.stats);
      } catch (err) {
        setError(err.message || "Failed to load dashboard stats");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main */}
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

          {/* Loading */}
          {loading && (
            <p className="text-center text-sm text-gray-500">
              Loading dashboard stats...
            </p>
          )}

          {/* Error */}
          {error && (
            <p className="mb-4 text-center text-sm text-red-600">
              {error}
            </p>
          )}

          {/* Dashboard */}
          {!loading && !error && stats && (
            <DashboardStats stats={stats} />
          )}
        </div>
      </main>
    </div>
  );
};

export default DashboardContent;
