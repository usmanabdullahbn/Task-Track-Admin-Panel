import React, { useEffect, useState } from "react";
import Sidebar from "./sidebar";
import DashboardStats from "./dashboard-stats";
import { apiClient } from "../lib/api-client";
import banner from "../images/SGI_Logo_biling.png"

const DashboardContent = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const user = JSON.parse(localStorage.getItem("User"))?.user;
  console.log(user)


  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await apiClient.getDashboardStats();

        // IMPORTANT FIX ⬇️
        setStats(data.stats);

        // console.log("Dashboard Stats:", data.stats);
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
          {/* REPLACED: Banner instead of Dashboard title and subtitle */}
          <div className="mb-6 sm:mb-8 flex items-center justify-center">
            <img
              src={banner}
              alt="Company banner"
              className="h-16 sm:h-20 md:h-24 object-contain"
            />
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

export default DashboardContent;
