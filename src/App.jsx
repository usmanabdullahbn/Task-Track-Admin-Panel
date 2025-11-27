import React, { useEffect } from "react";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";

import AssetsPage from "./assets/Page";
import DashboardContent from "./component/dashboard";
import CustomersPage from "./customers/page";
import EmployeesPage from "./employees/page";
import OrdersPage from "./orders/page";
import ProjectsPage from "./projects/page";
import TasksPage from "./tasks/page";

// Asset pages
import EditAsset from "./assets/assert_id";
import NewAssetPage from "./assets/new_assert";

// Task pages
import EditCustomerPage from "./customers/customer_id";
import NewCustomerPage from "./customers/new-customer";
import NewOrderPage from "./orders/new-order";
import EditOrderPage from "./orders/order_id";
import NewTaskPage from "./tasks/new-task";
import EditTaskPage from "./tasks/task_id";
import NewProjectPage from "./projects/new-project";
import EditProjectPage from "./projects/project_id";
import EmployeeTimelinePage from "./employees/employees_id";
import NewEmployeePage from "./employees/new-employees";
import Login from "./component/LoginPage";
import ProtectedRoute from "./component/ProtectedRoute";

// Customer screens
import CustomerDashboard from "./CustomerScreens/CustomerDash/customer-dashboard";
import CustomerProjects from "./CustomerScreens/CustomerDash/customer-projects";
<<<<<<< HEAD
import EditEmployeePage from "./employees/edit-employees";
=======
import CustomerProjectDetail from "./CustomerScreens/CustomerDash/customer-project-detail";
>>>>>>> 93098915fc4cebe111c42f73d57d0cfa38d9d009

// Optional: A simple 404 page
const NotFoundPage = () => (
  <div className="flex h-screen items-center justify-center text-gray-600 text-xl">
    404 — Page Not Found
  </div>
);

const App = () => {
  const navigate = useNavigate();

  // On mount, if admin exists redirect to root. Also listen for storage
  // events so cross-tab logins/logouts will route appropriately.
useEffect(() => {
  const onStorage = (e) => {
    if (e.key === "User") {
      if (e.newValue) {
        navigate("/", { replace: true });
      } else {
        navigate("/login", { replace: true });
      }
    }
  };

  window.addEventListener("storage", onStorage);
  return () => window.removeEventListener("storage", onStorage);
}, [navigate]);

  return (
    <div className="min-h-screen bg-gray-50">

      <Routes>
        {/* Root: if admin in localStorage -> dashboard, else -> /login */}
        <Route
          path="/"
          element={
            localStorage.getItem("User") ? (
              <ProtectedRoute>
                <DashboardContent />
              </ProtectedRoute>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Public Route */}
        <Route path="/login" element={<Login />} />

        {/* Customer Dashboard */}
        <Route
          path="/customer-dashboard"
          element={
            <ProtectedRoute>
              <CustomerDashboard />
            </ProtectedRoute>
          }
        />

        {/* Customer Projects (customer-facing) */}
        <Route
          path="/customer-projects"
          element={
            <ProtectedRoute>
              <CustomerProjects />
            </ProtectedRoute>
          }
        />

        {/* Customer Project Detail */}
        <Route
          path="/project/:projectId"
          element={
            <ProtectedRoute>
              <CustomerProjectDetail />
            </ProtectedRoute>
          }
        />

        {/* Main sections (protected) */}
        <Route path="/customers" element={<ProtectedRoute><CustomersPage /></ProtectedRoute>} />
        <Route path="/projects" element={<ProtectedRoute><ProjectsPage /></ProtectedRoute>} />
        <Route path="/orders" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
        <Route path="/assets" element={<ProtectedRoute><AssetsPage /></ProtectedRoute>} />
        <Route path="/tasks" element={<ProtectedRoute><TasksPage /></ProtectedRoute>} />
        <Route path="/employees" element={<ProtectedRoute><EmployeesPage /></ProtectedRoute>} />

        {/* Customers routes (protected) */}
        <Route path="/customers/new" element={<ProtectedRoute><NewCustomerPage /></ProtectedRoute>} />
        <Route path="/customers/:id" element={<ProtectedRoute><EditCustomerPage /></ProtectedRoute>} />

        {/* Orders routes (protected) */}
        <Route path="/orders/new" element={<ProtectedRoute><NewOrderPage /></ProtectedRoute>} />
        <Route path="/orders/:id" element={<ProtectedRoute><EditOrderPage /></ProtectedRoute>} />

        {/* project routes (protected) */}
        <Route path="/projects/new" element={<ProtectedRoute><NewProjectPage /></ProtectedRoute>} />
        <Route path="/projects/:id" element={<ProtectedRoute><EditProjectPage /></ProtectedRoute>} />

        {/* Asset routes (protected) */}
        <Route path="/assets/new" element={<ProtectedRoute><NewAssetPage /></ProtectedRoute>} />
        <Route path="/assets/:id" element={<ProtectedRoute><EditAsset /></ProtectedRoute>} />

        {/* Task routes (protected) */}
        <Route path="/tasks/new" element={<ProtectedRoute><NewTaskPage /></ProtectedRoute>} />
        <Route path="/tasks/:id" element={<ProtectedRoute><EditTaskPage /></ProtectedRoute>} />

        {/* Employee routes (protected) */}
        <Route path="/employees/new" element={<ProtectedRoute><NewEmployeePage /></ProtectedRoute>} />
        <Route path="/employees/:id" element={<ProtectedRoute><EditEmployeePage /></ProtectedRoute>} />
        <Route path="/employees/timeline/:id" element={<ProtectedRoute><EmployeeTimelinePage /></ProtectedRoute>} />

        {/* 404 fallback */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </div>
  );
};

export default App;
