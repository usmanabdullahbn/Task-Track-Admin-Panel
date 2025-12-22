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
    orderTitle: "",
    erpNumber: "",
    amount: "",
    created_at: new Date().toISOString().split("T")[0],
    status: "Pending",
  });

  const [customers, setCustomers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [error, setError] = useState("");

  // Fetch all customers on mount
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setLoading(true);

        // Fetch all customers
        const customersResponse = await apiClient.getCustomers();
        const customersList = Array.isArray(customersResponse)
          ? customersResponse
          : customersResponse.customers || [];
        setCustomers(customersList);

        console.log("Fetched Customers:", customersList);
      } catch (err) {
        console.error("Failed to fetch customers:", err);
        setError("Failed to load customers");
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  // Handle Inputs - Customer selection with dependent project fetching
  const handleInputChange = async (e) => {
    const { name, value } = e.target;

    // Customer selection - fetch projects for this customer
    if (name === "customerId") {
      const selectedCustomer = customers.find((c) => c._id === value);
      if (selectedCustomer) {
        setFormData((prev) => ({
          ...prev,
          customerId: value,
          customerName: selectedCustomer.name || "",
          projectId: "", // Reset project selection
          projectName: "",
        }));

        // Fetch projects for selected customer
        try {
          setLoadingProjects(true);
          setError("");

          // Try common apiClient method names
          let projectsResponse;
          if (typeof apiClient.getProjectsByCustomerId === "function") {
            projectsResponse = await apiClient.getProjectsByCustomerId(value);
          } else if (typeof apiClient.getProjectByCustomerId === "function") {
            projectsResponse = await apiClient.getProjectByCustomerId(value);
          } else {
            // Fallback to getProjects (if available)
            projectsResponse = await apiClient.getProjects();
          }

          const projectsList = Array.isArray(projectsResponse)
            ? projectsResponse
            : projectsResponse.projects || [];

          setProjects(projectsList);
          console.log("Fetched Projects for Customer:", projectsList);
        } catch (err) {
          console.error("Failed to fetch projects:", err);
          setProjects([]);
          setError("Failed to load projects for selected customer");
        } finally {
          setLoadingProjects(false);
        }
      }
      return;
    }

    // Project selection
    if (name === "projectId") {
      const selectedProject = projects.find((p) => p._id === value);
      if (selectedProject) {
        setFormData((prev) => ({
          ...prev,
          projectId: value,
          projectName: selectedProject.title || selectedProject.name || "",
        }));
      }
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Create order via apiClient.createOrder and then navigate to Add Assets
  const handleCreateOrder = async () => {
    // Basic validation - make amount required
    if (!formData.customerId || !formData.projectId || !formData.orderTitle || !formData.amount) {
      setError("Please select customer, project, provide an order title, and enter an amount.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      // Get the selected project to extract employee details
      const selectedProject = projects.find((p) => p._id === formData.projectId) || {};
      const employeeId = selectedProject.employee?.id || "";
      const employeeName = selectedProject.employee?.name || "";

      // Prepare payload - include only relevant fields expected by backend
      const payload = {
        customer: {
          id: formData.customerId,
          name: formData.customerName,
        },
        project: {
          id: formData.projectId,
          name: formData.projectName,
        },
        employee: {
          id: employeeId,
          name: employeeName,
        },
        title: formData.orderTitle,
        erpNumber: formData.erpNumber,
        amount: formData.amount,
        created_at: formData.created_at,
        status: formData.status,
      };

      console.log("Order Payload:", payload);
      const response = await apiClient.createOrder(payload);

      // Accept common response shapes
      const createdOrder =
        (response && (response.order || response.data || response)) || null;

      if (!createdOrder) {
        throw new Error("Unexpected response from createOrder");
      }

      // Prepare order data to pass to next page
      const orderDataToPass = {
        id: createdOrder._id || createdOrder.id,
        title: createdOrder.title || formData.orderTitle,
        customer: {
          id: formData.customerId,
          name: formData.customerName,
        },
        project: {
          id: formData.projectId,
          name: formData.projectName,
        },
        erpNumber: createdOrder.erpNumber,
        amount: createdOrder.amount,
        created_at: createdOrder.created_at,
        status: createdOrder.status,
      };

      // Navigate to add-assets page with created order
      navigate("/orders/new/add-assert", { state: { orderData: orderDataToPass } });
    } catch (err) {
      console.error("Failed to create order:", err);
      setError(
        err?.message || "Failed to create order. Please try again later."
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <main className="flex-1 p-8 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-700"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-50">
      <Sidebar />

      <main className="flex-1 overflow-y-auto pt-16 md:pt-0">
        <div className="p-4 sm:p-6 md:p-8">
          {/* Header */}
          <div className="mb-6 flex items-center gap-4">
            <Link to="/orders" className="text-green-700 hover:text-green-900">
              ← Back
            </Link>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Create New Order
            </h1>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-100 border border-red-300 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* FORM */}
            <div className="lg:col-span-2">
              <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                {/* CUSTOMER & PROJECT */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                  {/* Customer - Dropdown */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Customer <span className="text-red-600">*</span>
                    </label>
                    <select
                      name="customerId"
                      value={formData.customerId}
                      onChange={handleInputChange}
                      className="w-full border-2 border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 transition-colors"
                    >
                      <option value="">Select a customer</option>
                      {customers.map((customer) => (
                        <option key={customer._id} value={customer._id}>
                          {customer.name || customer.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Project - Dependent Dropdown */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Project <span className="text-red-600">*</span>
                    </label>
                    <select
                      name="projectId"
                      value={formData.projectId}
                      onChange={handleInputChange}
                      disabled={!formData.customerId || loadingProjects}
                      className="w-full border-2 border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
                    >
                      <option value="">
                        {!formData.customerId
                          ? "Select customer first"
                          : loadingProjects
                            ? "Loading projects..."
                            : "Select a project"}
                      </option>
                      {projects.map((project) => (
                        <option key={project._id} value={project._id}>
                          {project.title || project.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* ORDER TITLE */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Order Title <span className="text-red-600">*</span>
                  </label>
                  <input
                    name="orderTitle"
                    value={formData.orderTitle}
                    onChange={handleInputChange}
                    className="w-full border-2 border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 transition-colors"
                    placeholder="e.g., Maintenance Order"
                  />
                </div>

                {/* ERP NUMBER */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    ERP Number
                  </label>
                  <input
                    name="erpNumber"
                    value={formData.erpNumber}
                    onChange={handleInputChange}
                    className="w-full border-2 border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 transition-colors"
                    placeholder="e.g., ERP-9001"
                  />
                </div>

                {/* AMOUNT & DATE */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Amount <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="number"
                      name="amount"
                      value={formData.amount}
                      onChange={handleInputChange}
                      className="w-full border-2 border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 transition-colors"
                      placeholder="Enter amount"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Created Date
                    </label>
                    <input
                      type="date"
                      name="created_at"
                      value={formData.created_at}
                      onChange={handleInputChange}
                      className="w-full border-2 border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 transition-colors"
                    />
                  </div>
                </div>

                {/* STATUS */}
                <div className="mb-8">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full border-2 border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 transition-colors"
                  >
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Open">Open</option>
                  </select>
                </div>

                {/* BUTTONS */}
                <div className="flex gap-4">
                  <button
                    onClick={handleCreateOrder}
                    disabled={
                      !formData.customerId || !formData.projectId || !formData.orderTitle || !formData.amount || loading
                    }
                    className="bg-green-700 text-white px-6 py-2.5 rounded-lg hover:bg-green-800 disabled:opacity-60 disabled:cursor-not-allowed font-semibold transition-colors"
                  >
                    {loading ? "Creating..." : "Add Assets"}
                  </button>

                  <Link
                    to="/orders"
                    className="border-2 border-gray-300 text-gray-700 px-6 py-2.5 rounded-lg hover:bg-gray-50 font-semibold transition-colors"
                  >
                    Cancel
                  </Link>
                </div>
              </div>
            </div>

            {/* INFO CARD */}
            <div>
              <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm h-fit">
                <h3 className="font-semibold text-gray-800 mb-3">
                  Order Information
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Create a new order by selecting a customer and project. After
                  filling in the order details, click "Add Assets" to assign
                  assets to this order.
                </p>
                <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-xs text-blue-800">
                    <strong>Tip:</strong> Select a customer first to see
                    available projects for that customer.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default NewOrderPage;
