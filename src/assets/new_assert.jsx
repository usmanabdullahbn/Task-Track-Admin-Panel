import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Sidebar from "../component/sidebar";
import { apiClient } from "../lib/api-client";

const NewAssetPage = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    customer: "",
    customerName: "",
    project: "",
    projectName: "",
    // order: "",
    title: "",
    serialNumber: "",
    barcode: "",
    model: "",
    category: "",
    manufacturer: "",
    area: "",
    description: "",
  });

  const [customers, setCustomers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Fetch customers on mount (projects will be loaded when a customer is selected)
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingData(true);

        const customersResponse = await apiClient.getCustomers();
        const customersList = Array.isArray(customersResponse)
          ? customersResponse
          : customersResponse.customers || [];
        setCustomers(customersList);

        // Do not fetch all projects here. Projects will be fetched per-customer.
        setProjects([]);
      } catch (err) {
        console.error("Failed to load dropdown data:", err);
        setError("Error loading dropdown data.");
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();
  }, []);

  // Input handler
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // When Customer changes → load projects for that customer
    if (name === "customer") {
      const selected = customers.find((c) => c._id === value) || {};
      setFormData((prev) => ({
        ...prev,
        customer: value,
        customerName: selected.name || "",
        // clear project selection when customer changes
        project: "",
        projectName: "",
      }));

      // fetch projects for selected customer
      (async () => {
        try {
          setLoadingData(true);
          setError("");

          // try common apiClient method names (server might export either)
          let projectsResponse;
          if (typeof apiClient.getProjectsByCustomerId === "function") {
            projectsResponse = await apiClient.getProjectsByCustomerId(value);
          } else if (typeof apiClient.getProjectByCustomerId === "function") {
            projectsResponse = await apiClient.getProjectByCustomerId(value);
          } else {
            // fallback to getProjects and filter client-side (least preferred)
            const all = await apiClient.getProjects();
            projectsResponse = all;
          }

          const list =
            Array.isArray(projectsResponse)
              ? projectsResponse
              : projectsResponse.projects || [];
          setProjects(list);
        } catch (err) {
          console.error("Failed to load projects for customer:", err);
          setProjects([]);
          setError("Error loading projects for selected customer.");
        } finally {
          setLoadingData(false);
        }
      })();

      return;
    }

    // When Project changes → set project fields (do not override selected customer)
    if (name === "project") {
      const selected = projects.find((p) => p._id === value) || {};
      setFormData((prev) => ({
        ...prev,
        project: value,
        projectName: selected.title || "",
      }));
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Submit Handler
  const handleSubmit = async () => {
    // Get the selected project to extract employee details
    const selectedProject = projects.find((p) => p._id === formData.project) || {};
    const employeeId = selectedProject.employee?.id || "";
    const employeeName = selectedProject.employee?.name || "";

    const payload = {
      customer_id: formData.customer,
      customer_name: formData.customerName,
      employee_id: employeeId,
      employee_name: employeeName,
      project_id: formData.project,
      project_name: formData.projectName,
      // order_id: formData.order,
      // order_number: orderNumber,

      title: formData.title,
      description: formData.description,
      model: formData.model,
      manufacturer: formData.manufacturer,
      serial_number: formData.serialNumber,
      category: formData.category,
      barcode: formData.barcode,
      area: formData.area,
    };

    try {
      setSubmitting(true);
      setError("");

      console.log("Asset Payload:", payload);
      await apiClient.createAsset(payload);
      setShowSuccessModal(true);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to create asset.");
    } finally {
      setSubmitting(false);
    }
  };

  const closeModal = () => {
    setShowSuccessModal(false);
    navigate("/assets");
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-50">
      <Sidebar />

      <main className="flex-1 overflow-y-auto pt-16 md:pt-0">
        <div className="p-6">
          <div className="mb-6 flex items-center gap-4">
            <Link to="/assets" className="text-green-700 hover:text-green-900">
              ← Back
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Add Asset</h1>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-100 border border-red-300 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm max-w-4xl">
            {/* FORM */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Customer - now a select to load projects for selected customer */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Customer <span className="text-red-600">*</span>
                </label>
                <select
                  name="customer"
                  value={formData.customer}
                  onChange={handleInputChange}
                  className="w-full border-2 border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 transition-colors"
                >
                  <option value="">Select a customer</option>
                  {customers.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name || c.title || c._id}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => navigate("/customers/new")}
                  className="mt-2 w-full rounded-lg border-2 border-green-600 px-4 py-2 text-sm font-semibold text-green-600 hover:bg-green-50 transition-colors"
                >
                  + Add New Customer
                </button>
              </div>

              {/* Project Selection (projects filtered by selected customer) */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Project <span className="text-red-600">*</span>
                </label>
                <select
                  name="project"
                  value={formData.project}
                  onChange={handleInputChange}
                  className="w-full border-2 border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 transition-colors"
                  disabled={!formData.customer || loadingData}
                >
                  <option value="">
                    {formData.customer
                      ? loadingData
                        ? "Loading projects..."
                        : "Select a project"
                      : "Select a customer first"}
                  </option>
                  {projects.map((project) => (
                    <option key={project._id} value={project._id}>
                      {project.title}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => navigate("/projects/new")}
                  className="mt-2 w-full rounded-lg border-2 border-green-600 px-4 py-2 text-sm font-semibold text-green-600 hover:bg-green-50 transition-colors"
                >
                  + Add New Project
                </button>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Asset Title <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Enter asset title"
                  className="w-full border-2 border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 transition-colors"
                />
              </div>

              {/* Manufacturer */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Manufacturer <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  name="manufacturer"
                  value={formData.manufacturer}
                  onChange={handleInputChange}
                  placeholder="Enter manufacturer"
                  className="w-full border-2 border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 transition-colors"
                />
              </div>

              {/* Barcode */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Barcode <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  name="barcode"
                  value={formData.barcode}
                  onChange={handleInputChange}
                  placeholder="Enter unique barcode number"
                  className="w-full border-2 border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 transition-colors"
                />
              </div>

              {/* Area */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Area <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  name="area"
                  value={formData.area}
                  onChange={handleInputChange}
                  placeholder="Enter area"
                  className="w-full border-2 border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 transition-colors"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Category <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  placeholder="Enter category"
                  className="w-full border-2 border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 transition-colors"
                />
              </div>

              {/* Model */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Model
                </label>
                <input
                  type="text"
                  name="model"
                  value={formData.model}
                  onChange={handleInputChange}
                  placeholder="Enter model"
                  className="w-full border-2 border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 transition-colors"
                />
              </div>

              {/* Serial Number */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Serial Number
                </label>
                <input
                  type="text"
                  name="serialNumber"
                  value={formData.serialNumber}
                  onChange={handleInputChange}
                  placeholder="Enter unique serial number"
                  className="w-full border-2 border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 transition-colors"
                />
              </div>
            </div>

            {/* Description */}
            <div className="mt-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Enter asset description"
                rows={4}
                className="w-full border-2 border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 transition-colors resize-none"
              />
            </div>

            {/* File Upload (Multiple) */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Upload Files
              </label>

              <input
                type="file"
                multiple
                name="files"
                onChange={(e) => {
                  const files = Array.from(e.target.files);
                  console.log("Selected Files:", files);
                }}
                className="w-full border-2 border-gray-300 rounded-lg px-4 py-2.5 bg-white
               text-gray-900 file:bg-green-700 file:text-white 
               file:border-none file:px-4 file:py-2 file:mr-4 
               file:rounded-md file:cursor-pointer
               hover:file:bg-green-800 transition cursor-pointer"
              />
              <p className="text-xs text-gray-500 mt-1">
                You can select multiple files.
              </p>
            </div>

            {/* ACTION BUTTONS */}
            <div className="mt-8 flex gap-4">
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="bg-green-700 hover:bg-green-800 text-white font-semibold px-6 py-2.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? "Adding..." : "Add Asset"}
              </button>

              <Link
                to="/assets"
                className="border-2 border-gray-300 px-6 py-2.5 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition-colors inline-flex items-center justify-center"
              >
                Cancel
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* SUCCESS MODAL */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm shadow-xl">
            <h2 className="text-lg font-semibold text-green-700 mb-4">
              Success
            </h2>
            <p className="mb-6">
              Asset <strong>{formData.title}</strong> has been added
              successfully.
            </p>

            <button
              onClick={closeModal}
              className="bg-green-700 text-white px-4 py-2 rounded hover:bg-green-800"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewAssetPage;
