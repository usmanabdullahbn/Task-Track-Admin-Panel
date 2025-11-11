import React from "react"
import Sidebar from "./sidebar"
import DashboardStats from "./dashboard-stats"

const DashboardContent = () => {
  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-50">
      {/* Sidebar (fixed width on desktop, collapsible on mobile) */}
      <Sidebar />

      {/* Main content area */}
      <main className="flex-1 overflow-y-auto pt-20 md:pt-0">
        <div className="p-4 sm:p-6 md:p-8">
          {/* Header */}
          <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="mt-1 sm:mt-2 text-sm text-gray-600">Welcome back, Admin</p>
            </div>
          </div>

          {/* Stats Section */}
          <DashboardStats />
        </div>
      </main>
    </div>
  )
}

export default DashboardContent
