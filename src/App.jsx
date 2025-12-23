import React, { useEffect } from "react";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";

import AssetsPage from "./assets/Page";
import DashboardContent from "./component/dashboard";
import CustomersPage from "./customers/page";
import EmployeesPage from "./employees/page";
import OrdersPage from "./orders/page";
import ProjectsPage from "./projects/page";
import EmployeeDayTimelinePage from "./component/EmployeeDayTimelinePage";
import ProfilePage from "./component/ProfilePage";
import CustomerProfilePage from "./CustomerScreens/CustomerDash/CustomerProfilePage";


// Asset pages
import EditAssetPage from "./assets/assert_id";
import NewAssetPage from "./assets/new_assert";

// Task pages
import Login from "./component/LoginPage";
import ProtectedRoute from "./component/ProtectedRoute";
import EditCustomerPage from "./customers/customer_id";
import NewCustomerPage from "./customers/new-customer";
import EditEmployeePage from "./employees/edit-employees";
import EmployeeTimelinePage from "./employees/employees_id";
import NewEmployeePage from "./employees/new-employees";
import NewOrderPage from "./orders/new-order";
import EditOrderPage from "./orders/order_id";
import OrderDetailsPage from "./orders/order-details";
import NewProjectPage from "./projects/new-project";
import EditProjectPage from "./projects/project_id";

// Customer screens
import CustomerAssets from "./CustomerScreens/CustomerDash/customer-assets";
import CustomerDashboard from "./CustomerScreens/CustomerDash/customer-dashboard";
import CustomerOrder from "./CustomerScreens/CustomerDash/customer-order";
import CustomerProjects from "./CustomerScreens/CustomerDash/customer-projects";
import AddAssetsPage from "./orders/add-assets-with-tasks";
import SchedulePage from "./Schedule/schedule";


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
            ) : user.role === "admin" || user.role === "manager" || user.role === "supervisor" || user.role === "technician" ? (
              <ProtectedRoute allowedRoles={["admin", "manager", "supervisor", "technician"]}>
                <DashboardContent />
              </ProtectedRoute>
            ) : user.role === "customer" || user.role === "employee" ? (
              <ProtectedRoute allowedRoles={["customer", "employee"]}>
                <CustomerDashboard />
              </ProtectedRoute>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Public Route */}
        <Route path="/login" element={<Login />} />

        {/* Profile Route (for both admin and customer) */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute allowedRoles={["admin", "manager", "supervisor", "technician", "customer", "employee"]}>
              <ProfilePage />
            </ProtectedRoute>
          }
        />

        {/* Customer Profile Route */}
        <Route
          path="/customer-profile"
          element={
            <ProtectedRoute allowedRoles={["customer", "employee"]}>
              <CustomerProfilePage />
            </ProtectedRoute>
          }
        />

        {/* Customer Routes */}
        <Route
          path="/customer-dashboard"
          element={
            <ProtectedRoute allowedRoles={["customer", "employee"]}>
              <CustomerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/customer-projects"
          element={
            <ProtectedRoute allowedRoles={["customer", "employee"]}>
              <CustomerProjects />
            </ProtectedRoute>
          }
        />
        <Route
          path="/customer-orders"
          element={
            <ProtectedRoute allowedRoles={["customer", "employee"]}>
              <CustomerOrder />
            </ProtectedRoute>
          }
        />
        <Route
          path="/customer-assets"
          element={
            <ProtectedRoute allowedRoles={["customer", "employee"]}>
              <CustomerAssets />
            </ProtectedRoute>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={["admin", "manager", "supervisor", "technician"]}>
              <DashboardContent />
            </ProtectedRoute>
          }
        />
        <Route
          path="/customers"
          element={
            <ProtectedRoute allowedRoles={["admin", "manager", "supervisor", "technician"]}>
              <CustomersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/projects"
          element={
            <ProtectedRoute allowedRoles={["admin", "manager", "supervisor", "technician"]}>
              <ProjectsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders"
          element={
            <ProtectedRoute allowedRoles={["admin", "manager", "supervisor", "technician"]}>
              <OrdersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/assets"
          element={
            <ProtectedRoute allowedRoles={["admin", "manager", "supervisor", "technician"]}>
              <AssetsPage />
            </ProtectedRoute>
          }
        />
        {/* <Route
          path="/tasks"
          element={
            <ProtectedRoute allowedRoles={["admin", "manager", "supervisor", "technician"]}>
              <TasksPage />
            </ProtectedRoute>
          }
        /> */}
        <Route
          path="/employees"
          element={
            <ProtectedRoute allowedRoles={["admin", "manager", "supervisor", "technician"]}>
              <EmployeesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/schedule"
          element={
            <ProtectedRoute allowedRoles={["admin", "manager", "supervisor", "technician"]}>
              <SchedulePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/timeline"
          element={
            <ProtectedRoute allowedRoles={["admin", "manager", "supervisor", "technician"]}>
              <EmployeeDayTimelinePage />
            </ProtectedRoute>
          }
        />

        {/* Customers routes (admin only) */}
        <Route
          path="/customers/new"
          element={
            <ProtectedRoute allowedRoles={["admin", "manager", "supervisor", "technician"]}>
              <NewCustomerPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/customers/:id"
          element={
            <ProtectedRoute allowedRoles={["admin", "manager", "supervisor", "technician"]}>
              <EditCustomerPage />
            </ProtectedRoute>
          }
        />

        {/* Orders routes (admin only) */}
        <Route
          path="/orders/new"
          element={
            <ProtectedRoute allowedRoles={["admin", "manager", "supervisor", "technician"]}>
              <NewOrderPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders/new/add-assert"
          element={
            <ProtectedRoute allowedRoles={["admin", "manager", "supervisor", "technician"]}>
              <AddAssetsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders/details/:id"
          element={
            <ProtectedRoute allowedRoles={["admin", "manager", "supervisor", "technician"]}>
              <OrderDetailsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders/:id"
          element={
            <ProtectedRoute allowedRoles={["admin", "manager", "supervisor", "technician"]}>
              <EditOrderPage />
            </ProtectedRoute>
          }
        />

        {/* Project routes (admin only) */}
        <Route
          path="/projects/new"
          element={
            <ProtectedRoute allowedRoles={["admin", "manager", "supervisor", "technician"]}>
              <NewProjectPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/projects/:id"
          element={
            <ProtectedRoute allowedRoles={["admin", "manager", "supervisor", "technician"]}>
              <EditProjectPage />
            </ProtectedRoute>
          }
        />

        {/* Asset routes (admin only) */}
        <Route
          path="/assets/new"
          element={
            <ProtectedRoute allowedRoles={["admin", "manager", "supervisor", "technician"]}>
              <NewAssetPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/assets/:id"
          element={
            <ProtectedRoute allowedRoles={["admin", "manager", "supervisor", "technician"]}>
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
        {/* <Route
          path="/employees-timeline/:id"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <EmployeeTimelinePage />
            </ProtectedRoute>
          }
        /> */}

        {/* 404 fallback */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </div>
  );
};

export default App;
