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
    order: "",
    title: "",
    serialNumber: "",
    barcode: "",
    model: "",
    category: "",
    manufacturer: "",
    description: "",
  });

  const [customers, setCustomers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Fetch dropdown data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingData(true);

        const customersResponse = await apiClient.getCustomers();
        setCustomers(
          Array.isArray(customersResponse)
            ? customersResponse
            : customersResponse.customers || []
        );

        const projectsResponse = await apiClient.getProjects();
        setProjects(
          Array.isArray(projectsResponse.projects)
            ? projectsResponse.projects
            : []
        );

        const ordersResponse = await apiClient.getOrders();
        const ordersList = Array.isArray(ordersResponse.orders)
          ? ordersResponse.orders
          : [];

        setOrders(ordersList);
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

    // When Order changes → Autofill Customer + Project
    if (name === "order") {
      const selected = orders.find((o) => o._id === value);

      if (selected) {
        setFormData((prev) => ({
          ...prev,
          order: selected._id,
          order_number: selected._id,
          customer: selected.customer?.id || "",
          customerName: selected.customer?.name || "",
          project: selected.project?.id || "",
          projectName: selected.project?.name || "",
        }));
      }
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Submit Handler
  const handleSubmit = async () => {
    if (!formData.title || !formData.order || !formData.customer) {
      setError("Please fill in all required fields.");
      return;
    }

    const selectedOrder = orders.find((o) => o._id === formData.order);
    const orderNumber = selectedOrder?.order_number || "";

    if (!orderNumber) {
      setError("Order number missing from selected order.");
      return;
    }

    const payload = {

      customer_id :formData.customer,
      customer_name: formData.customerName,
      employee_id: "",
      employee_name: "",
      project_id: formData.project,
      project_name: formData.projectName,
      order_id: formData.order,
      order_number: orderNumber,
     
      title: formData.title,
      description: formData.description,
      model: formData.model,
      manufacturer: formData.manufacturer,
      serial_number: formData.serialNumber,
      category: formData.category,
      barcode: formData.barcode,
    };

    console.log("FINAL PAYLOAD:", payload);
    console.log(formData);

    try {
      setSubmitting(true);
      setError("");

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

              <div>
                <label className="block text-sm font-medium mb-2">Customer</label>
                <input
                  type="text"
                  value={formData.customerName}
                  readOnly
                  className="w-full rounded-lg border px-4 py-2 bg-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Project</label>
                <input
                  type="text"
                  value={formData.projectName}
                  readOnly
                  className="w-full rounded-lg border px-4 py-2 bg-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Order</label>
                <select
                  name="order"
                  value={formData.order}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border px-4 py-2"
                >
                  <option value="">Select an order</option>

                  {orders.map((order) => (
                    <option key={order._id} value={order._id}>
                      {order.order_number}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={() => navigate("/orders/new")}
                  className="mt-2 w-full border border-green-700 py-2 rounded-lg text-green-700 hover:bg-green-50"
                >
                  + Add New Order
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border px-4 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Serial Number
                </label>
                <input
                  type="text"
                  name="serialNumber"
                  value={formData.serialNumber}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border px-4 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Barcode</label>
                <input
                  type="text"
                  name="barcode"
                  value={formData.barcode}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border px-4 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Model</label>
                <input
                  type="text"
                  name="model"
                  value={formData.model}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border px-4 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Category
                </label>
                <input
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border px-4 py-2"
                />
              </div>
            </div>

            {/* SINGLE COLUMN FIELDS */}
            <div className="mt-6">
              <label className="block text-sm font-medium mb-2">
                Manufacturer
              </label>
              <input
                type="text"
                name="manufacturer"
                value={formData.manufacturer}
                onChange={handleInputChange}
                className="w-full rounded-lg border px-4 py-2"
              />
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="w-full rounded-lg border px-4 py-2"
                rows={4}
              />
            </div>

            {/* ACTION BUTTONS */}
            <div className="mt-8 flex gap-4">
              <button
                onClick={handleSubmit}
                className="bg-green-700 text-white px-6 py-2 rounded-lg hover:bg-green-800"
              >
                Add Asset
              </button>

              <Link
                to="/assets"
                className="border border-gray-300 px-6 py-2 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Back
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
              Asset <strong>{formData.title}</strong> has been added successfully.
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
