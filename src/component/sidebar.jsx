import React from "react"
import { Link, useLocation } from "react-router-dom"

const menuItems = [
  { label: "Dashboard", href: "/" },
  { label: "Customers", href: "/customers" },
  { label: "Projects", href: "/projects" },
  { label: "Orders", href: "/orders" },
  { label: "Assets", href: "/assets" },
  { label: "Tasks", href: "/tasks" },
  { label: "Employees", href: "/employees" },
]

const Sidebar = () => {
  const location = useLocation()
  const pathname = location.pathname

  return (
    <aside className="w-64 bg-green-700 text-white shadow-lg h-screen relative">
      <div className="p-6">
        <h1 className="text-2xl font-bold">TaskTrack</h1>
      </div>
      <nav className="mt-8 space-y-1 px-4">
        {menuItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              to={item.href}
              className={`block rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                isActive ? "bg-green-600 text-white" : "text-green-50 hover:bg-green-600"
              }`}
            >
              {item.label}
            </Link>
          )
        })}
      </nav>
      <div className="absolute bottom-8 left-4 right-4 flex flex-col gap-4">
        <div className="border-t border-green-600 pt-4">
          <p className="text-xs text-green-100">© 2025 Bitsberg Technologies</p>
          <p className="text-xs text-green-100">All rights reserved.</p>
          <p className="mt-2 text-xs text-green-200">Version 1.0.0</p>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar
