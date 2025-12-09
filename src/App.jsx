import React, { useEffect } from "react";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";

import AssetsPage from "./assets/Page";
import DashboardContent from "./component/dashboard";
import CustomersPage from "./customers/page";
import EmployeesPage from "./employees/page";
import OrdersPage from "./orders/page";
import ProjectsPage from "./projects/page";

// Asset pages
import EditAssetPage from "./assets/assert_id";
import NewAssetPage from "./assets/new_assert";
import AddAssetsPage from "./assets/add-assets-with-tasks";

// Task pages
import Login from "./component/LoginPage";
import ProtectedRoute from "./component/ProtectedRoute";
import EditCustomerPage from "./customers/customer_id";
import NewCustomerPage from "./customers/new-customer";
import EmployeeTimelinePage from "./employees/employees_id";
import NewEmployeePage from "./employees/new-employees";
import EditEmployeePage from "./employees/edit-employees";
import NewOrderPage from "./orders/new-order";
import EditOrderPage from "./orders/order_id";
import NewProjectPage from "./projects/new-project";
import EditProjectPage from "./projects/project_id";

// Customer screens
import CustomerDashboard from "./CustomerScreens/CustomerDash/customer-dashboard";
import CustomerAssets from "./CustomerScreens/CustomerDash/customer-assets";
import CustomerProjects from "./CustomerScreens/CustomerDash/customer-projects";
import CustomerOrder from "./CustomerScreens/CustomerDash/customer-order";


// Optional: A simple 404 page
const NotFoundPage = () => (
  <div className="flex h-screen items-center justify-center text-gray-600 text-xl">
    404 — Page Not Found
  </div>
);

const App = () => {
  const navigate = useNavigate();

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

  const user = JSON.parse(localStorage.getItem("User"));

  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        {/* Root route: redirect based on role */}
        <Route
          path="/"
          element={
            !user ? (
              <Navigate to="/login" replace />
            ) : user.role === "admin" ? (
              <ProtectedRoute allowedRoles={["admin"]}>
                <DashboardContent />
              </ProtectedRoute>
            ) : user.role === "customer" ? (
              <ProtectedRoute allowedRoles={["customer"]}>
                <CustomerDashboard />
              </ProtectedRoute>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Public Route */}
        <Route path="/login" element={<Login />} />

        {/* Customer Routes */}
        <Route
          path="/customer-dashboard"
          element={
            <ProtectedRoute allowedRoles={["customer"]}>
              <CustomerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/customer-projects"
          element={
            <ProtectedRoute allowedRoles={["customer"]}>
              <CustomerProjects />
            </ProtectedRoute>
          }
        />
        <Route
          path="/customer-orders"
          element={
            <ProtectedRoute allowedRoles={["customer"]}>
              <CustomerOrder />
            </ProtectedRoute>
          }
        />
        <Route
          path="/customer-assets"
          element={
            <ProtectedRoute allowedRoles={["customer"]}>
              <CustomerAssets />
            </ProtectedRoute>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/customers"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <CustomersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/projects"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <ProjectsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <OrdersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/assets"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AssetsPage />
            </ProtectedRoute>
          }
        />
        {/* <Route
          path="/tasks"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <TasksPage />
            </ProtectedRoute>
          }
        /> */}
        <Route
          path="/employees"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <EmployeesPage />
            </ProtectedRoute>
          }
        />

        {/* Customers routes (admin only) */}
        <Route
          path="/customers/new"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <NewCustomerPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/customers/:id"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <EditCustomerPage />
            </ProtectedRoute>
          }
        />

        {/* Orders routes (admin only) */}
        <Route
          path="/orders/new"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <NewOrderPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders/:id"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <EditOrderPage />
            </ProtectedRoute>
          }
        />

        {/* Project routes (admin only) */}
        <Route
          path="/projects/new"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <NewProjectPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/projects/:id"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <EditProjectPage />
            </ProtectedRoute>
          }
        />

        {/* Asset routes (admin only) */}
        <Route
          path="/assets/new"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <NewAssetPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/assets/:id"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <EditAssetPage />
            </ProtectedRoute>
          }
        />

        {/* Task routes (admin only) */}
        {/* <Route
          path="/tasks/new"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <NewTaskPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tasks/:id"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <EditTaskPage />
            </ProtectedRoute>
          }
        /> */}

        {/* Employee routes (admin only) */}
        <Route
          path="/employees/new"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <NewEmployeePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employees/:id"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <EditEmployeePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employees/timeline/:id"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <EmployeeTimelinePage />
            </ProtectedRoute>
          }
        />

        {/* 404 fallback */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </div>
  );
};

export default App;
