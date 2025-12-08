import React, { useState, useEffect } from "react";
import Sidebar from "../component/sidebar";
import { Link, useNavigate } from "react-router-dom";
import { apiClient } from "../lib/api-client";

const NewOrderPage = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    customerId: "",
    customerName: "",
    projectId: "",
    projectName: "",
    employeeId: "",
    employeeName: "",
    orderTitle: "",
    erpNumber: "",
    amount: "",
    created_at: new Date().toISOString().split("T")[0],
    status: "Pending",
  });

  const [customers, setCustomers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch customers, projects, and employees
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Customers
        const customersResponse = await apiClient.getCustomers();
        const customersList = Array.isArray(customersResponse)
          ? customersResponse
          : customersResponse.customers || [];
        setCustomers(customersList);

        console.log("Fetched Customers:", customersList);

        // Projects
        const projectsResponse = await apiClient.getProjects();
        const projectsList = Array.isArray(projectsResponse.projects)
          ? projectsResponse.projects
          : [];
        setProjects(projectsList);

        // Employees
        const employeesResponse = await apiClient.getUsers();
        const employeesList = Array.isArray(employeesResponse)
          ? employeesResponse
          : employeesResponse.Users || [];
        setEmployees(employeesList);

        console.log("Fetched Employees:", employeesList);

        // Orders (for duplicate checking)
        // const ordersResponse = await apiClient.getOrders();
        // const ordersList = Array.isArray(ordersResponse)
        //   ? ordersResponse
        //   : ordersResponse.orders || [];
        // setAllOrders(ordersList);
      } catch (err) {
        console.error("Failed to fetch:", err);
        setError("Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handle Inputs - Customer selection with dependent project filtering
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Customer selection - filter projects for this customer
    if (name === "customerId") {
      const selectedCustomer = customers.find((c) => c._id === value);
      if (selectedCustomer) {
        // Filter projects for this customer
        const filtered = projects.filter(
          (p) => p.customer?._id === value
        );
        setFilteredProjects(filtered);

        setFormData((prev) => ({
          ...prev,
          customerId: value,
          customerName: selectedCustomer.name || "",
          projectId: "", // Reset project selection
          projectName: "",
        }));
      }
      return;
    }

    // Project selection
    if (name === "projectId") {
      const selectedProject = filteredProjects.find((p) => p._id === value);
      if (selectedProject) {
        setFormData((prev) => ({
          ...prev,
          projectId: value,
          projectName: selectedProject.name || "",
        }));
      }
      return;
    }

    // Employee selection
    if (name === "employeeId") {
      const selected = employees.find((e) => e._id === value);
      if (selected) {
        setFormData((prev) => ({
          ...prev,
          employeeId: selected._id,
          employeeName: selected.name || "",
        }));
      }
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };


  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <main className="p-8">Loading...</main>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-50">
      <Sidebar  />

      <main
        // className={`flex-1 overflow-y-auto pt-16 md:pt-0 ${showSuccessModal ? "blur-sm" : ""
        //   }`}
      >
        <div className="p-4 sm:p-6 md:p-8">
          {/* Header */}
          <div className="mb-6 flex items-center gap-4">
            <Link to="/orders" className="text-green-700 hover:text-green-900">
              ← Back
            </Link>
            <h1 className="text-2xl sm:text-3xl font-bold">Add Order</h1>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* FORM */}
            <div className="lg:col-span-2">
              <div className="rounded-lg border bg-white p-6 shadow-sm">
                {/* ASSET + CUSTOMER + PROJECT */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

                  {/* Asset - Dropdown to select
                  <div className="sm:col-span-2">
                    <label className="text-sm font-medium">
                      Asset <span className="text-red-600">*</span>
                    </label>
                    <select
                      name="assetId"
                      value={formData.assetId}
                      onChange={handleInputChange}
                      className="w-full border rounded-lg px-4 py-2 mt-1"
                    >
                      <option value="">Select Asset</option>
                      {assets.map((asset) => (
                        <option key={asset._id} value={asset._id}>
                          {asset.title}
                        </option>
                      ))}
                    </select>
                  </div> */}

                  {/* Customer - Dropdown */}
                  <div>
                    <label className="text-sm font-medium">
                      Customer <span className="text-red-600">*</span>
                    </label>
                    <select
                      name="customerId"
                      value={formData.customerId}
                      onChange={handleInputChange}
                      className="w-full border rounded-lg px-4 py-2 mt-1"
                    >
                      <option value="">Select Customer</option>
                      {customers.map((customer) => (
                        <option key={customer._id} value={customer._id}>
                          {customer.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Project - Dependent Dropdown */}
                  <div>
                    <label className="text-sm font-medium">
                      Project <span className="text-red-600">*</span>
                    </label>
                    <select
                      name="projectId"
                      value={formData.projectId}
                      onChange={handleInputChange}
                      disabled={!formData.customerId}
                      className="w-full border rounded-lg px-4 py-2 mt-1 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    >
                      <option value="">
                        {!formData.customerId
                          ? "Select customer first"
                          : "Select Project"}
                      </option>
                      {filteredProjects.map((project) => (
                        <option key={project._id} value={project._id}>
                          {project.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* ORDER TITLE & ERP */}
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium">
                      Order Title <span className="text-red-600">*</span>
                    </label>
                    <input
                      name="orderTitle"
                      value={formData.orderTitle}
                      onChange={handleInputChange}
                      className="w-full border rounded-lg px-4 py-2 mt-1"
                      placeholder="e.g., Maintenance Order"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Assign Employee</label>
                    <select
                      name="employeeId"
                      value={formData.employeeId}
                      onChange={handleInputChange}
                      className="w-full border rounded-lg px-4 py-2 mt-1"
                    >
                      <option value="">Select Employee</option>
                      {employees.map((employee) => (
                        <option key={employee._id} value={employee._id}>
                          {employee.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* ERP NUMBER */}
                <div className="mt-6">
                  <label className="text-sm font-medium">ERP Number</label>
                  <input
                    name="erpNumber"
                    value={formData.erpNumber}
                    onChange={handleInputChange}
                    className="w-full border rounded-lg px-4 py-2 mt-1"
                    placeholder="e.g., ERP-9001"
                  />
                </div>

                {/* AMOUNT & DATE */}
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium">Amount</label>
                    <input
                      type="number"
                      name="amount"
                      value={formData.amount}
                      onChange={handleInputChange}
                      className="w-full border rounded-lg px-4 py-2 mt-1"
                      placeholder="Amount"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Created Date</label>
                    <input
                      type="date"
                      name="created_at"
                      value={formData.created_at}
                      onChange={handleInputChange}
                      className="w-full border rounded-lg px-4 py-2 mt-1"
                    />
                  </div>
                </div>

                {/* STATUS */}
                <div className="mt-6">
                  <label className="text-sm font-medium">Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full border rounded-lg px-4 py-2 mt-1"
                  >
                    {" "}
                    <option value="Pending">Pending</option>
                    <option value="In Progcess">In Progcess</option>
                    {/* <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option> */}
                    <option value="Open">Open</option>
                  </select>
                </div>

                {/* BUTTONS */}
                <div className="mt-8 flex gap-4">
                  <button
                    onClick={() => navigate("/assets/add-with-tasks", { state: { orderData: formData } })}
                    disabled={!formData.customerId || !formData.projectId}
                    className="bg-green-700 text-white px-6 py-2 rounded-lg hover:bg-green-800 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    Add Assets
                  </button>

                  <Link
                    to="/orders"
                    className="px-6 py-2 border rounded-lg text-gray-700 hover:bg-gray-100"
                  >
                    Back
                  </Link>
                </div>
              </div>
            </div>

            {/* INFO CARD */}
            <div>
              <div className="rounded-lg border bg-white p-6 shadow-sm">
                <h3 className="font-semibold text-gray-800 mb-3">
                  Order Details
                </h3>
                <p className="text-gray-600 text-sm">
                  Fill in all required fields to create a new order. The order
                  will be linked to the selected customer & project.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default NewOrderPage;
