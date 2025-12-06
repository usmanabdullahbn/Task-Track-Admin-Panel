import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Sidebar from "../component/sidebar";
import { apiClient } from "../lib/api-client";

const EditOrderPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const [originalOrder, setOriginalOrder] = useState(null);

  const [formData, setFormData] = useState({
    order_number: "",
    erp_number: "",
    amount: "",
    order_date: "",
    delivery_date: "",
    status: "",
    notes: "",
    customer: "",
    project: "",
    employee: "",
    title: "",
  });

  // -------------------------------------------------
  // LOAD ORDER BY ID
  // -------------------------------------------------
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await apiClient.getOrderById(id);
        const order = res.order;

        // console.log(order);
        setOriginalOrder(order);

        setFormData({
          order_number: order.order_number || "",
          title: order.title || "",
          erp_number: order.erp_number || "",
          amount: order.amount?.$numberDecimal || "",
          order_date: order.order_date?.substring(0, 10) || "",
          delivery_date: order.delivery_date?.substring(0, 10) || "",
          status: order.status || "",
          notes: order.notes || "",
          customer: order.customer?.name || "",
          project: order.project?.name || "",
          employee: order.employee?.name || "",
        });

        setLoading(false);
      } catch (err) {
        console.error(err);
        setError("Failed to load order");
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  // -------------------------------------------------
  // HANDLE INPUT CHANGE
  // -------------------------------------------------
  const handleInput = (e) => {
    setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  // -------------------------------------------------
  // SUBMIT UPDATE
  // -------------------------------------------------
  const handleSubmit = async () => {
    try {
      setSaving(true);

      const payload = {
        // order_number: formData.order_number,
        title: formData.title,
        erp_number: formData.erp_number,
        amount: formData.amount,
        order_date: formData.order_date,
        delivery_date: formData.delivery_date,
        status: formData.status,
        notes: formData.notes,
        customer: originalOrder.customer
          ? { id: originalOrder.customer.id, name: formData.customer }
          : null,
        project: originalOrder.project
          ? { id: originalOrder.project.id, name: formData.project }
          : null,
        employee: originalOrder.employee
          ? { id: originalOrder.employee.id, name: formData.employee }
          : null,
      };

      await apiClient.updateOrder(id, payload);
      setShowSuccess(true);
    } catch (err) {
      console.error(err);
      setError("Failed to update order");
    } finally {
      setSaving(false);
    }
  };

  // -------------------------------------------------
  // UI
  // -------------------------------------------------
  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <main className="flex-1 flex items-center justify-center">
          Loading...
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-100 text-gray-800">
      {/* LEFT SIDEBAR */}
      <Sidebar className={showSuccess ? "blur-sm" : ""} />

      {/* MAIN CONTENT */}
      <main
        className={`flex-1 overflow-y-auto pt-16 md:pt-0 transition-all ${
          showSuccess ? "blur-sm" : ""
        }`}
      >
        <div className="p-4 sm:p-6 md:p-10 max-w-5xl mx-auto">
          {/* HEADER */}
          <div className="mb-8 flex items-center gap-4">
            <Link
              to="/orders"
              className="text-green-700 hover:text-green-900 font-medium transition"
            >
              ← Back
            </Link>

            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
              Edit Order
            </h1>
          </div>

          {/* ERROR MESSAGE */}
          {error && (
            <div className="mb-6 bg-red-100 border border-red-300 text-red-700 p-4 rounded-lg shadow-sm">
              {error}
            </div>
          )}

          {/* FORM CARD */}
          <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-md space-y-8">
             <div>
                <label className="block font-medium text-gray-700 mb-1">
                  Order Number
                </label>
                <input
                  name="order_number"
                  value={formData.order_number}
                  readOnly
                  className="w-full rounded-lg border-gray-300 bg-gray-100 text-gray-700 px-3 py-2"
                />
              </div>
            {/* GRID 1: ORDER + ERP */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block font-medium text-gray-700 mb-1">
                  Customer
                </label>
                <input
                  name="customer"
                  value={formData.customer}
                  readOnly
                  className="w-full rounded-lg border-gray-300 bg-gray-100 text-gray-700 px-3 py-2"
                />
              </div>

              <div>
                <label className="block font-medium text-gray-700 mb-1">
                  Project
                </label>
                <input
                  name="project"
                  value={formData.project}
                  readOnly
                  className="w-full rounded-lg border-gray-300 bg-gray-100 text-gray-700 px-3 py-2"
                />
              </div>
             
            </div>

            {/* GRID 2: ORDER + ERP */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block font-medium text-gray-700 mb-1">
                  Order Title
                </label>
                <input
                  name="title"                     // <-- changed from "order_title"
                  value={formData.title}
                  onChange={handleInput}
                  className="w-full rounded-lg border-gray-300 focus:border-green-700 focus:ring-green-700 shadow-sm px-3 py-2"
                />
              </div>

              <div>
                <label className="block font-medium text-gray-700 mb-1">
                  ERP Number
                </label>
                <input
                  name="erp_number"
                  value={formData.erp_number}
                  onChange={handleInput}
                  className="w-full rounded-lg border-gray-300 focus:border-green-700 focus:ring-green-700 shadow-sm px-3 py-2"
                />
              </div>
            </div>

            {/* GRID 2: CUSTOMER / PROJECT */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block font-medium text-gray-700 mb-1">
                  Customer
                </label>
                <input
                  name="customer"
                  value={formData.customer}
                  onChange={handleInput}
                  className="w-full rounded-lg border-gray-300 focus:border-green-700 focus:ring-green-700 shadow-sm px-3 py-2"
                />
              </div>

              <div>
                <label className="block font-medium text-gray-700 mb-1">
                  Project
                </label>
                <input
                  name="project"
                  value={formData.project}
                  onChange={handleInput}
                  className="w-full rounded-lg border-gray-300 focus:border-green-700 focus:ring-green-700 shadow-sm px-3 py-2"
                />
              </div>
            </div>

            {/* GRID 3: AMOUNT / EMPLOYEE */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block font-medium text-gray-700 mb-1">
                  Amount
                </label>
                <input
                  name="amount"
                  type="number"
                  value={formData.amount}
                  onChange={handleInput}
                  className="w-full rounded-lg border-gray-300 focus:border-green-700 focus:ring-green-700 shadow-sm px-3 py-2"
                />
              </div>

              <div>
                <label className="block font-medium text-gray-700 mb-1">
                  Employee
                </label>
                <input
                  name="employee"
                  value={formData.employee}
                  onChange={handleInput}
                  className="w-full rounded-lg border-gray-300 focus:border-green-700 focus:ring-green-700 shadow-sm px-3 py-2"
                />
              </div>
            </div>

            {/* GRID 4: DATES */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block font-medium text-gray-700 mb-1">
                  Order Date
                </label>
                <input
                  name="order_date"
                  type="date"
                  value={formData.order_date}
                  onChange={handleInput}
                  className="w-full rounded-lg border-gray-300 focus:border-green-700 focus:ring-green-700 shadow-sm px-3 py-2"
                />
              </div>

              <div>
                <label className="block font-medium text-gray-700 mb-1">
                  Delivery Date
                </label>
                <input
                  name="delivery_date"
                  type="date"
                  value={formData.delivery_date}
                  onChange={handleInput}
                  className="w-full rounded-lg border-gray-300 focus:border-green-700 focus:ring-green-700 shadow-sm px-3 py-2"
                />
              </div>
            </div>

            {/* STATUS */}
            <div>
              <label className="block font-medium text-gray-700 mb-1">
                Status
              </label>

              <select
                name="status"
                value={formData.status}
                onChange={handleInput}
                className="w-full rounded-lg border-gray-300 focus:border-green-700 focus:ring-green-700 shadow-sm px-3 py-2"
              >
                <option value="Pending">Pending</option>
                <option value="In Progcess">In Progcess</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            {/* NOTES */}
            <div>
              <label className="block font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInput}
                className="w-full rounded-lg border-gray-300 focus:border-green-700 focus:ring-green-700 shadow-sm px-3 py-2 min-h-[110px]"
              />
            </div>

            {/* BUTTONS */}
            <div className="flex flex-wrap gap-4 pt-4">
              <button
                onClick={handleSubmit}
                disabled={saving}
                className="bg-green-700 hover:bg-green-800 text-white font-semibold px-6 py-3 rounded-lg shadow-md transition disabled:opacity-60"
              >
                {saving ? "Updating..." : "Update Order"}
              </button>

              <Link
                to="/orders"
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold px-6 py-3 rounded-lg shadow transition"
              >
                Cancel
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* SUCCESS MODAL */}
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl p-7 w-full max-w-sm mx-4">
            <h2 className="text-xl font-semibold mb-4 text-green-700">
              Order Updated!
            </h2>

            <p className="mb-6 text-gray-700">
              Order <span className="font-bold">{formData.order_number}</span>{" "}
              has been updated successfully.
            </p>

            <div className="flex justify-end">
              <button
                onClick={() => navigate("/orders")}
                className="bg-green-700 hover:bg-green-800 text-white px-6 py-2 rounded-lg font-medium shadow-md transition"
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

export default EditOrderPage;
