import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../component/sidebar";
import { FaEdit, FaTrash, FaPrint } from "react-icons/fa";
import { apiClient } from "../lib/api-client";

const OrdersPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchField, setSearchField] = useState("order");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // per-order print states
  const [printData, setPrintData] = useState(null);
  const [showPrintPreview, setShowPrintPreview] = useState(false);

  // -------------------------
  // PRINT DOCUMENT GENERATOR (styled like asset report)
  // -------------------------
  const generatePrintDocument = (o) => {
    if (!o) return "";
    const now = new Date();
    const generatedAt = now.toLocaleString();
    const created = o.created_at ? new Date(o.created_at).toLocaleString() : "-";
    const cust = o.customer?.name || o.customer_name || o.customer_id || "-";
    const proj = o.project?.name || o.project?.title || o.project_name || o.project_id || "-";
    const amt = o.amount?.$numberDecimal ?? o.amount?.value ?? "-";
    const status = o.status || "-";
    const title = o.title || "-";
    const description = o.description ? String(o.description).replace(/</g, "&lt;").replace(/>/g, "&gt;") : "";

    return `
      <!doctype html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Order Report - ${o.order_number || o._id}</title>
          <style>
            :root{--bg:#f8fafc;--card:#ffffff;--muted:#6b7280;--accent:#065f46}
            html,body{height:100%;margin:0;background:var(--bg);font-family:Inter,ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,"Helvetica Neue",Arial;}
            .wrap{max-width:900px;margin:24px auto;padding:20px}
            .card{background:var(--card);border-radius:10px;box-shadow:0 6px 18px rgba(15,23,42,0.06);overflow:hidden}
            .header{display:flex;align-items:center;justify-content:space-between;padding:20px 24px;border-bottom:1px solid #eef2f6}
            .title{font-size:20px;color:var(--accent);margin:0;font-weight:700}
            .meta{color:var(--muted);font-size:13px}
            .grid{display:grid;grid-template-columns:repeat(2,1fr);gap:14px;padding:18px 24px}
            .item .label{font-size:11px;color:var(--accent);text-transform:uppercase;font-weight:700;margin-bottom:6px}
            .item .value{font-size:15px;color:#111827}
            .desc{padding:0 24px 18px;color:#111827;font-size:14px;line-height:1.5}
            table{width:100%;border-collapse:collapse;margin:0 24px 24px}
            th,td{padding:10px;border:1px solid #e6eef3;text-align:left;font-size:13px}
            th{background:#fbfdff;color:#374151;font-weight:700;text-transform:none}
            .footer{padding:12px 24px;border-top:1px solid #eef2f6;color:var(--muted);font-size:12px;text-align:right}
            @media print {
              body{background:#fff}
              .wrap{margin:0;padding:0;max-width:100%}
              .card{box-shadow:none;border-radius:0}
              .header .title{font-size:18px}
            }
          </style>
        </head>
        <body>
          <div class="wrap">
            <div class="card">
              <div class="header">
                <div>
                  <div class="title">Order ${o.order_number || o._id}</div>
                  <div class="meta">Generated: ${generatedAt} • Order ID: ${o._id || "-"}</div>
                </div>
                <div style="text-align:right">
                  <div style="font-size:12px;color:${status === 'Completed' ? '#059669' : status === 'Active' ? '#0369a1' : '#b45309'};font-weight:700">${status}</div>
                  <div style="font-size:12px;color:var(--muted);margin-top:6px">${cust}</div>
                </div>
              </div>

              <div class="grid">
                <div class="item">
                  <div class="label">Title</div>
                  <div class="value">${title}</div>
                </div>
                <div class="item">
                  <div class="label">Customer</div>
                  <div class="value">${cust}</div>
                </div>

                <div class="item">
                  <div class="label">Project</div>
                  <div class="value">${proj}</div>
                </div>
                <div class="item">
                  <div class="label">Amount</div>
                  <div class="value">${amt}</div>
                </div>

                <div class="item">
                  <div class="label">Created At</div>
                  <div class="value">${created}</div>
                </div>
              </div>

              ${description ? `<div class="desc"><strong>Description</strong><div style="margin-top:8px">${description}</div></div>` : ""}

              <table>
                <thead>
                  <tr>
                    <th style="width:40%">Field</th>
                    <th>Value</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td>Title</td><td>${title}</td></tr>
                  <tr><td>Order #</td><td>${o.order_number || "-"}</td></tr>
                  <tr><td>ERP #</td><td>${o.erp_number || "-"}</td></tr>
                  <tr><td>Customer</td><td>${cust}</td></tr>
                  <tr><td>Project</td><td>${proj}</td></tr>
                  <tr><td>Amount</td><td>${amt}</td></tr>
                  <tr><td>Status</td><td>${status}</td></tr>
                  <tr><td>Created</td><td>${created}</td></tr>
                </tbody>
              </table>

              <div class="footer">TaskTrack — Order Report</div>
            </div>
          </div>
        </body>
      </html>
    `;
  };

  // -------------------------
  // GET USER ROLE
  // -------------------------
  const getUserRole = () => {
    try {
      const user = JSON.parse(localStorage.getItem("User"))?.user;
      return (user?.role || "").toLowerCase();
    } catch (err) {
      return "";
    }
  };

  const role = getUserRole();

  // -------------------------
  // PERMISSIONS BASED ON AUTH MATRIX
  // -------------------------
  const canAddOrder =
    role === "admin" || role === "manager" || role === "supervisor";

  const canEditOrder = role === "admin" || role === "manager";

  const canDeleteOrder = role === "admin" || role === "manager";

  // -------------------------
  // FETCH WORK ORDERS
  // -------------------------
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const data = await apiClient.getOrders();
        console.log(data);

        setOrders(Array.isArray(data.orders) ? data.orders : []);
      } catch (err) {
        setError(err.message);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  // -------------------------
  // DELETE ORDER
  // -------------------------
  const handleDeleteClick = (order) => {
    setSelectedOrder(order);
    setShowConfirmModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedOrder) return;

    try {
      await apiClient.deleteOrder(selectedOrder._id);
      setOrders((prev) =>
        prev.filter((order) => order._id !== selectedOrder._id)
      );
      setShowConfirmModal(false);
      setShowSuccessModal(true);
    } catch (err) {
      console.error("Failed to delete order:", err);
      setError("Failed to delete order");
      setShowConfirmModal(false);
    }
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    setSelectedOrder(null);
  };

  // -------------------------
  // FILTERING
  // -------------------------
  const filteredOrders = orders.filter((order) => {
    const searchValue = searchTerm.toLowerCase();

    switch (searchField) {
      case "order":
        return order.order_number?.toLowerCase().includes(searchValue);
      case "erp":
        return order.erp_number?.toLowerCase().includes(searchValue);
      case "customer":
        return order.customer_id?.toLowerCase().includes(searchValue);
      case "project":
        return order.project_id?.toLowerCase().includes(searchValue);
      case "amount":
        return order.amount?.value?.toString().includes(searchTerm);
      default:
        return true;
    }
  });

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-50">
      <Sidebar
        className={showConfirmModal || showSuccessModal ? "blur-sm" : ""}
      />

      <main
        className={`flex-1 overflow-y-auto pt-16 md:pt-0 ${
          showConfirmModal || showSuccessModal ? "blur-sm" : ""
        }`}
      >
        <div className="p-4 sm:p-6 md:p-8">
          {/* HEADER */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Work Orders Management
            </h1>

            {/* ADD ORDER BUTTON */}
            {canAddOrder && (
              <Link
                to="/orders/new"
                className="rounded-lg bg-green-700 px-4 py-2 text-sm font-medium text-white hover:bg-green-800 transition-colors"
              >
                + Add Order
              </Link>
            )}
          </div>

          {/* LOADING / ERROR */}
          {loading && <p className="text-gray-500">Loading orders...</p>}
          {error && <p className="text-red-500">Error: {error}</p>}

          {!loading && !error && (
            <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
              {/* SEARCH SECTION */}
              <div className="border-b border-gray-200 p-4 sm:p-6">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                  {[
                    { field: "order", placeholder: "Search Order #" },
                    { field: "erp", placeholder: "Search ERP #" },
                    { field: "customer", placeholder: "Search Customer ID" },
                    { field: "project", placeholder: "Search Project ID" },
                    { field: "amount", placeholder: "Search Amount" },
                  ].map(({ field, placeholder }) => (
                    <input
                      key={field}
                      type="text"
                      placeholder={placeholder}
                      value={searchField === field ? searchTerm : ""}
                      onChange={(e) => {
                        setSearchField(field);
                        setSearchTerm(e.target.value);
                      }}
                      className="rounded-lg border border-gray-300 px-3 py-2 text-sm sm:text-base focus:border-green-700 focus:outline-none focus:ring-1 focus:ring-green-700"
                    />
                  ))}
                </div>
              </div>

              {/* TABLE */}
              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px] text-sm sm:text-base">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="px-4 py-3">Customer</th>
                      <th className="px-4 py-3">Project</th>
                      <th className="px-4 py-3">Title</th>
                      <th className="px-4 py-3">Order #</th>
                      <th className="px-4 py-3">ERP #</th>
                      <th className="px-4 py-3">Amount</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Created</th>
                      <th className="px-4 py-3">Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredOrders.map((order) => (
                      <tr
                        key={order._id}
                        className="border-b border-gray-200 hover:bg-gray-50"
                      >
                        <td className="px-4 py-3">{order.customer.name}</td>
                        <td className="px-4 py-3">{order.project?.name || order.project?.title || "-"}</td>
                        <td className="px-4 py-3 font-medium text-gray-900">
                          {order.title || "-"}
                        </td>
                        <td className="px-4 py-3">{order.order_number}</td>
                        <td className="px-4 py-3">{order.erp_number || "-"}</td>
                        <td className="px-4 py-3">
                          {order.amount?.$numberDecimal || "-"}
                        </td>
                        <td className="px-4 py-3">{order.status}</td>

                        <td className="px-4 py-3">
                          {order.created_at
                            ? new Date(order.created_at).toLocaleDateString()
                            : "-"}
                        </td>

                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            {/* PRINT BUTTON (per-order) */}
                            <button
                              onClick={() => {
                                setPrintData(order);
                                setShowPrintPreview(true);
                              }}
                              className="w-8 h-8 flex items-center justify-center rounded-md bg-gray-200 hover:bg-gray-300 text-gray-800"
                              title="Print order"
                            >
                              <FaPrint size={14} />
                            </button>

                            {/* EDIT BUTTON (Admin + Manager) */}
                            {canEditOrder && (
                              <Link
                                to={`/orders/${order._id}`}
                                className="w-8 h-8 flex items-center justify-center rounded-md bg-teal-400 hover:bg-teal-500 text-white"
                              >
                                <FaEdit size={14} />
                              </Link>
                            )}

                            {/* DELETE BUTTON (Admin + Manager) */}
                            {canDeleteOrder && (
                              <button
                                onClick={() => handleDeleteClick(order)}
                                className="w-8 h-8 flex items-center justify-center rounded-md bg-red-400 hover:bg-red-500 text-white"
                              >
                                <FaTrash size={14} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredOrders.length === 0 && (
                <p className="text-center text-gray-500 py-6 sm:text-base">
                  No orders found.
                </p>
              )}
            </div>
          )}
        </div>
      </main>

      {/* CONFIRM DELETE MODAL */}
      {showConfirmModal && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="absolute inset-0 backdrop-blur-sm z-40"></div>

          <div className="relative bg-white rounded-lg shadow-xl p-6 w-full max-w-sm mx-2 z-50">
            <h2 className="text-lg font-semibold mb-4 text-gray-900">
              Confirm Delete
            </h2>

            <p className="mb-6 text-gray-700">
              Are you sure you want to delete order{" "}
              <span className="font-bold">
                {selectedOrder.order_name || selectedOrder.order_number}
              </span>
              ?
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUCCESS DELETE MODAL */}
      {showSuccessModal && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="absolute inset-0 backdrop-blur-sm z-40"></div>

          <div className="relative bg-white rounded-lg shadow-xl p-6 w-full max-w-sm mx-2 z-50">
            <h2 className="text-lg font-semibold mb-4 text-green-600">
              Success
            </h2>

            <p className="mb-6 text-gray-700">
              Order{" "}
              <span className="font-bold">
                {selectedOrder.order_name || selectedOrder.order_number}
              </span>{" "}
              has been deleted successfully.
            </p>

            <div className="flex justify-end">
              <button
                onClick={handleCloseSuccessModal}
                className="px-4 py-2 rounded bg-green-700 text-white hover:bg-green-800 transition-colors"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PRINT PREVIEW (per-order) */}
      {showPrintPreview && printData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="absolute inset-0 backdrop-blur-sm z-40"></div>

          <div className="relative bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl mx-2 z-50">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Print Order</h2>
              <button onClick={() => { setShowPrintPreview(false); setPrintData(null); }} className="text-2xl text-gray-500">×</button>
            </div>

            <div className="h-[70vh] overflow-auto border p-2">
              <iframe
                title="Order Print Preview"
                srcDoc={generatePrintDocument(printData)}
                style={{ width: "100%", height: "100%", border: 0 }}
              />
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => { setShowPrintPreview(false); setPrintData(null); }} className="px-4 py-2 rounded bg-gray-100 text-gray-700">Close</button>
              <button onClick={() => {
                const w = window.open("", "_blank", "noopener,noreferrer");
                w.document.write(generatePrintDocument(printData));
                w.document.close();
                w.print();
              }} className="px-4 py-2 rounded bg-blue-600 text-white">Print</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
