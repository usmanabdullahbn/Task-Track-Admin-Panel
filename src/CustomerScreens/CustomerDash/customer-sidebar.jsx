import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FiLogOut } from "react-icons/fi";
import { useIsMobile } from "../../component/useIsMobile";

const customerMenuItems = [
  { label: "Dashboard", href: "/customer-dashboard" },
  { label: "Projects", href: "/customer-projects" },
  { label: "Assets", href: "/customer-assets" },
  { label: "Orders", href: "/customer-orders" },
];

const CustomerSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);

  const handleSignOut = () => {
    try {
      localStorage.removeItem("User");
    } catch (e) {
      // ignore
    }
    navigate("/login", { replace: true });
  };

  if (isMobile) {
    return (
      <>
        {/* Top bar for mobile with hamburger + signout */}
        <div
          className={`fixed top-0 left-0 right-0 z-50 -mb-2 flex items-center justify-between p-4 border-b-2 md:hidden transition-colors duration-300 
    ${isOpen ? "bg-green-700 border-none" : "bg-gray-50 border-gray-200"}`}
        >
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="bg-green-700 text-white px-4 py-3 rounded-lg text-lg font-bold"
          >
            {isOpen ? "✕" : "☰"}
          </button>

          <button
            onClick={handleSignOut}
            className="text-white bg-red-700 p-3 rounded-lg"
            title="Sign out"
          >
            <FiLogOut size={22} />
          </button>
        </div>

        {/* Mobile menu */}
        {isOpen && (
          <aside className="fixed inset-0 z-40 bg-green-700 text-white pt-20 px-4 md:hidden">
            <nav className="space-y-1">
              {customerMenuItems.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`block rounded-lg px-4 py-3 text-sm font-medium transition-colors ${isActive
                      ? "bg-green-600 text-white"
                      : "text-green-50 hover:bg-green-600"
                      }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="mt-8 border-t border-green-600 pt-4">
              <p className="text-xs text-green-100">
                © 2025 Bitsberg Technologies
              </p>
              <p className="text-xs text-green-100">All rights reserved.</p>
              <p className="mt-2 text-xs text-green-200">Version 1.0.0</p>
            </div>
          </aside>
        )}
      </>
    );
  }

  // Desktop sidebar with customer-specific styling (blue theme)
  return (
    <aside className="w-64 bg-green-700 text-white shadow-lg relative flex flex-col justify-between">
      <div>
        <div className="p-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Customer Panel</h1>
        </div>

        <nav className="space-y-2 px-4">
          {customerMenuItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                className={`block rounded-lg px-4 py-3 text-sm font-medium transition-colors ${isActive
                  ? "bg-green-600 text-white"
                  : "text-green-50 hover:bg-green-600"
                  }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-green-600 space-y-3">
        <button
          onClick={handleSignOut}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <FiLogOut size={18} />
          Sign Out
        </button>

        <div className="text-xs text-green-100 space-y-1 text-center">
          <p>© 2025 Bitsberg Technologies</p>
          <p>All rights reserved.</p>
          <p className="text-green-200">Version 1.0.0</p>
        </div>
      </div>
    </aside>
  );
};

export default CustomerSidebar;
