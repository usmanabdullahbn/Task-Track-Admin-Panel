import React from "react"

const DashboardStats = () => {
  const stats = [
    { label: "Total Customers", value: "12", color: "bg-blue-50 border-blue-200" },
    { label: "Active Projects", value: "8", color: "bg-purple-50 border-purple-200" },
    { label: "Pending Orders", value: "15", color: "bg-orange-50 border-orange-200" },
    { label: "Assets", value: "45", color: "bg-green-50 border-green-200" },
  ]

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <div key={stat.label} className={`rounded-lg border p-6 ${stat.color}`}>
          <p className="text-sm font-medium text-gray-600">{stat.label}</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{stat.value}</p>
        </div>
      ))}
    </div>
  )
}

export default DashboardStats
