import React, { useState, useEffect } from "react";
import Sidebar from "../component/sidebar";
import { Link, useNavigate } from "react-router-dom";
import { apiClient } from "../lib/api-client";

const NewTaskPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    customer: "",
    customerName: "",
    project: "",
    projectName: "",
    order: "",
    orderNumber: "",
    asset: "",
    assetName: "",
    employee: "",
    employeeName: "",
    title: "",
    description: "",
    duration: "",
    planStart: "",
    planEnd: "",
    actualStart: "",
    actualEnd: "",
    completed: false,
    status: "pending",
  });

  const [assets, setAssets] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingData(true);
        const [assetsRes, usersRes] = await Promise.all([
          apiClient.getAssets(),
          apiClient.getUsers(),
        ]);

        setAssets(
          Array.isArray(assetsRes) ? assetsRes : assetsRes?.assets || []
        );
        setEmployees(
          Array.isArray(usersRes) ? usersRes : usersRes?.users || []
        );
      } catch (err) {
        console.error("Error loading form data:", err);
        setError("Failed to load form data");
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    // When asset selected -> autofill customer/project/order fields (read-only)
    if (name === "asset") {
      const assetId = value;
      if (!assetId) {
        // clear autofill
        setFormData((prev) => ({
          ...prev,
          asset: "",
          assetName: "",
          customer: "",
          customerName: "",
          project: "",
          projectName: "",
          order: "",
          orderNumber: "",
        }));
        return;
      }

      const assetObj = assets.find((a) => (a.id || a._id) === assetId);
      if (assetObj) {
        const customerId =
          assetObj.customer?.id ||
          assetObj.customer?._id ||
          assetObj.customer ||
          "";
        const customerName =
          assetObj.customer?.name ||
          (typeof assetObj.customer === "string" ? assetObj.customer : "");
        const projectId =
          assetObj.project?.id ||
          assetObj.project?._id ||
          assetObj.project ||
          "";
        const projectName =
          assetObj.project?.name ||
          (typeof assetObj.project === "string" ? assetObj.project : "");
        const orderId =
          assetObj.order?.id || assetObj.order?._id || assetObj.order || "";
        const orderNumber =
          assetObj.order?.order_number || assetObj.orderNumber || "";

        setFormData((prev) => ({
          ...prev,
          asset: assetId,
          assetName: assetObj.title || assetObj.name || "",
          customer: customerId,
          customerName: customerName || "",
          project: projectId,
          projectName: projectName || "",
          order: orderId,
          orderNumber: orderNumber || "",
        }));
      } else {
        // asset id not found: just set id
        setFormData((prev) => ({ ...prev, asset: assetId }));
      }
      return;
    }

    if (name === "employee") {
      const empId = value;
      const empObj = employees.find((e) => (e.id || e._id) === empId);
      const empName = empObj ? `${empObj.firstName || ""} ${empObj.lastName || ""}`.trim() : "";
      setFormData((prev) => ({ ...prev, employee: empId, employeeName: empName }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      if (!formData.title) {
        setError("Task title is required");
        setSubmitting(false);
        return;
      }

      if (!formData.asset) {
        setError(
          "Please select an Asset (customer/project/order will be auto-filled)."
        );
        setSubmitting(false);
        return;
      }

      const payload = {
        customer: {
          id: formData.customer,
          name: formData.customerName,
        },
        project: {
          id: formData.project,
          name: formData.projectName,
        },
        order: {
          id: formData.order,
          order_number: formData.orderNumber,
        },
        asset: {
          id: formData.asset,
          name: formData.assetName || "",
        },
        employee: {
          id: formData.employee,
          name: formData.employeeName || "",
        },
        title: formData.title,
        description: formData.description,
        plan_duration: formData.duration ? parseInt(formData.duration) : 0,

        status: formData.status,
      };

      // console.log(payload);

      await apiClient.createTask(payload);
      navigate("/tasks");
    } catch (err) {
      console.error("Failed to create task:", err);
      setError(err.message || "Failed to create task");
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingData) {
    return (
      <div className="flex flex-col md:flex-row h-screen bg-gray-50">
        <Sidebar />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-gray-500">Loading...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-y-auto pt-16 md:pt-0">
        <div className="p-6">
          <div className="mb-6 flex items-center gap-4">
            <Link to="/tasks" className="text-green-700 hover:text-green-900">
              ← Back
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Add Task</h1>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-100 border border-red-300 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm max-w-4xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Customer
                </label>
                <input
                  type="text"
                  value={formData.customerName}
                  readOnly
                  placeholder="Auto-filled from selected asset"
                  className="w-full rounded-lg border px-4 py-2 bg-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Project
                </label>
                <input
                  type="text"
                  value={formData.projectName}
                  readOnly
                  placeholder="Auto-filled from selected asset"
                  className="w-full rounded-lg border px-4 py-2 bg-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Order</label>
                <input
                  type="text"
                  value={formData.orderNumber}
                  readOnly
                  placeholder="Auto-filled from selected asset"
                  className="w-full rounded-lg border px-4 py-2 bg-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Asset</label>
                <select
                  name="asset"
                  value={formData.asset}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border px-4 py-2"
                >
                  <option value="">Select an asset</option>
                  {assets.map((a) => (
                    <option key={a.id || a._id} value={a.id || a._id}>
                      {a.title}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={() => navigate("/assets/new")}
                  className="mt-2 w-full border border-green-700 py-2 rounded-lg text-green-700 hover:bg-green-50"
                >
                  + Add New Asset
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Employee
                </label>
                <select
                  name="employee"
                  value={formData.employee}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border px-4 py-2"
                >
                  <option value="">Select Employee</option>
                  {employees.map((emp) => (
                    <option key={emp.id || emp._id} value={emp.id || emp._id}>
                      {emp.firstName} {emp.lastName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium mb-2">
                  Task Title
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border px-4 py-2"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full rounded-lg border px-4 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Duration (Hours)
                </label>
                <input
                  type="number"
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border px-4 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border px-4 py-2"
                >
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="on-hold">On Hold</option>
                </select>
              </div>
            </div>

            <div className="mt-6 flex gap-4">
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="bg-green-700 text-white px-6 py-2 rounded-lg hover:bg-green-800 disabled:opacity-50"
              >
                {submitting ? "Creating..." : "Add Task"}
              </button>

              <Link
                to="/tasks"
                className="border border-gray-300 px-6 py-2 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Back
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default NewTaskPage;
