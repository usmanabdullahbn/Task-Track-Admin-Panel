import React from "react";
import { Route, Routes } from "react-router-dom";

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

// Optional: A simple 404 page
const NotFoundPage = () => (
  <div className="flex h-screen items-center justify-center text-gray-600 text-xl">
    404 — Page Not Found
  </div>
);

const App = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        {/* Dashboard */}
        <Route path="/" element={<DashboardContent />} />

        {/* Main sections */}
        <Route path="/customers" element={<CustomersPage />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/assets" element={<AssetsPage />} />
        <Route path="/tasks" element={<TasksPage />} />
        <Route path="/employees" element={<EmployeesPage />} />


        {/* Customers routes */}
        <Route path="/customers/new" element={<NewCustomerPage />} />
        <Route path="/customers/:id" element={<EditCustomerPage />} />

        {/* Orders routes */}
        <Route path="/orders/new" element={<NewOrderPage />} />
        <Route path="/orders/:id" element={<EditOrderPage />} />

        {/* project routes */}
        {/* <Route path="/projects/new" element={<NewProjectPage />} />
        <Route path="/projects/:id" element={<EditProjectPage/>} /> */}
        
        {/* Asset routes */}
        <Route path="/assets/new" element={<NewAssetPage />} />
        <Route path="/assets/:id" element={<EditAsset />} />
        
        {/* Task routes */}
        <Route path="/tasks/new" element={<NewTaskPage />} />
        <Route path="/tasks/:id" element={<EditTaskPage />} />

        {/* Task routes */}
        {/* <Route path="/employees/new" element={<NewEmployeePage />} />
        <Route path="/employees/:id" element={<EmployeeTimeline />} /> */}

        {/* 404 fallback */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </div>
  );
};

export default App;
