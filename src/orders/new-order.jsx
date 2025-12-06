import React, { useState, useEffect } from "react";
import Sidebar from "../component/sidebar";
import { Link, useNavigate } from "react-router-dom";
import { apiClient } from "../lib/api-client";

const NewOrderPage = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    assetId: "",
    assetTitle: "",
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
  const [assets, setAssets] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [allOrders, setAllOrders] = useState([]);

  // Fetch customers, projects, assets, and employees
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

        // Assets
        const assetsResponse = await apiClient.getAssets();
        const assetsList = Array.isArray(assetsResponse)
          ? assetsResponse
          : assetsResponse.assets || [];
        setAssets(assetsList);

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

  // Handle Inputs (with auto-fill customer and project details from asset)
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Asset selection - auto-fill customer and project from asset
   if (name === "assetId") {
  const selected = assets.find((a) => a._id === value);

  if (selected) {
    setFormData((prev) => ({
      ...prev,
      assetId: selected._id,
      assetTitle: selected.title || "",
      customerId: selected.customer?.id || "",
      customerName: selected.customer?.name || "",
      projectId: selected.project?.id || "",
      projectName: selected.project?.name || "",
    }));

    console.log("Selected Asset:", selected); // ✅ now inside the if
  }

  return;
}

    // Employee selection - set employee id and name
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

  // Submit Order
  const handleSubmit = async () => {
    // if (!formData.orderTitle || !formData.customerId || !formData.projectId || !formData.assetId) {
    //   setError("Order Title, Asset, Customer, and Project are required");
    //   return;
    // }

    const payload = {
      // order_number: "", // or generate one if needed?
      title: formData.orderTitle,
      erp_number: formData.erpNumber,
      amount: Number(formData.amount) || 0,
      status: formData.status,
      created_at: formData.created_at,
      customer: {
        id: formData.customerId,
        name: formData.customerName,
      },
      project: {
        id: formData.projectId,
        name: formData.projectName,
      },
      asset: {
        id: formData.assetId,
        name: formData.assetTitle,
      },
      user: {
        id: formData.employeeId || "0",
        name: formData.employeeName || "Not Assigned",
      },
    };

    console.log("Submitting Order:", payload);

    try {
      setSubmitting(true);
      setError("");

      await apiClient.createOrder(payload);

      setShowSuccessModal(true);
    } catch (err) {
      console.log(err);
      setError(err.message || "Failed to create order");
    } finally {
      setSubmitting(false);
    }
  };

  const closeModal = () => {
    setShowSuccessModal(false);
    navigate("/orders");
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
      <Sidebar className={showSuccessModal ? "blur-sm" : ""} />

      <main
        className={`flex-1 overflow-y-auto pt-16 md:pt-0 ${
          showSuccessModal ? "blur-sm" : ""
        }`}
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
                  {/* Asset - Dropdown to select */}
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
                  </div>

                  {/* Customer - Read Only */}
                  <div>
                    <label className="text-sm font-medium">
                      Customer <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.customerName}
                      disabled
                      readOnly
                      className="w-full border rounded-lg px-4 py-2 mt-1 bg-gray-100 text-gray-600 cursor-not-allowed"
                      placeholder="Auto-filled from asset selection"
                    />
                  </div>

                  {/* Project - Read Only */}
                  <div>
                    <label className="text-sm font-medium">
                      Project <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.projectName}
                      disabled
                      readOnly
                      className="w-full border rounded-lg px-4 py-2 mt-1 bg-gray-100 text-gray-600 cursor-not-allowed"
                      placeholder="Auto-filled from asset selection"
                    />
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
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="bg-green-700 text-white px-6 py-2 rounded-lg hover:bg-green-800 disabled:opacity-60"
                  >
                    {submitting ? "Adding..." : "Add Order"}
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

      {/* SUCCESS MODAL */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-sm">
            <h2 className="text-lg font-semibold text-green-600">Success</h2>
            <p className="mt-3 text-gray-700">
              Order <strong>{formData.orderTitle}</strong> has been created
              successfully.
            </p>

            <div className="mt-6 flex justify-end">
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-green-700 text-white rounded hover:bg-green-800"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewOrderPage;
