import React from "react"
import Sidebar from "./sidebar"
import DashboardStats from "./dashboard-stats"

const DashboardContent = () => {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="mt-2 text-gray-600">Welcome back, Admin</p>
            </div>
            <button className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors">
              Sign Out
            </button>
          </div>
          <DashboardStats />
        </div>
      </main>
    </div>
  )
}

export default DashboardContent
