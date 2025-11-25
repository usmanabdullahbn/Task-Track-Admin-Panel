import React, { useState } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../component/sidebar";
import { orders as mockOrders } from "../lib/mock-data";
import { FaEdit, FaTrash } from "react-icons/fa";

const OrdersPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchField, setSearchField] = useState("order");
  const [orders] = useState(mockOrders);

  const filteredOrders = orders.filter((order) => {
    const searchValue = searchTerm.toLowerCase();
    switch (searchField) {
      case "order":
        return order.orderNumber.toLowerCase().includes(searchValue);
      case "erp":
        return order.erpNumber.toLowerCase().includes(searchValue);
      case "customer":
        return order.customer.toLowerCase().includes(searchValue);
      case "project":
        return order.project.toLowerCase().includes(searchValue);
      case "amount":
        return order.amount.includes(searchTerm);
      default:
        return true;
    }
  });

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <main className="flex-1 overflow-y-auto pt-16 md:pt-0">
        <div className="p-4 sm:p-6 md:p-8">
          {/* Header */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Work Orders Management
            </h1>
            <Link
              to="/orders/new"
              className="rounded-lg bg-green-700 px-4 py-2 text-sm font-medium text-white hover:bg-green-800 transition-colors"
            >
              + Add Order
            </Link>
          </div>

          {/* Search Section */}
          <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-200 p-4 sm:p-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                {[
                  { field: "order", placeholder: "Search Order #" },
                  { field: "erp", placeholder: "Search ERP #" },
                  { field: "customer", placeholder: "Search Customer" },
                  { field: "project", placeholder: "Search Project" },
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

            {/* Orders Table */}
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] text-sm sm:text-base">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-medium text-gray-700 uppercase">
                      Order #
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-medium text-gray-700 uppercase">
                      ERP #
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-medium text-gray-700 uppercase">
                      Customer
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-medium text-gray-700 uppercase">
                      Project
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-medium text-gray-700 uppercase">
                      Amount
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-medium text-gray-700 uppercase">
                      Created
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-medium text-gray-700 uppercase">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => (
                    <tr
                      key={order.id}
                      className="border-b border-gray-200 hover:bg-gray-50"
                    >
                      <td className="px-4 sm:px-6 py-3 text-gray-900 font-medium">
                        {order.orderNumber}
                      </td>
                      <td className="px-4 sm:px-6 py-3 text-gray-600">
                        {order.erpNumber}
                      </td>
                      <td className="px-4 sm:px-6 py-3 text-gray-600">
                        {order.customer}
                      </td>
                      <td className="px-4 sm:px-6 py-3 text-gray-600">
                        {order.project}
                      </td>
                      <td className="px-4 sm:px-6 py-3 text-gray-600">
                        {order.amount}
                      </td>
                      <td className="px-4 sm:px-6 py-3 text-gray-600">
                        {order.created}
                      </td>
                      <td className="px-4 sm:px-6 py-3">
                        <div className="flex items-center gap-2">
                          {/* Edit Button */}
                          <Link
                            // to={`/customers/${customer._id}`}
                            className="w-8 h-8 flex items-center justify-center rounded-md bg-teal-400 hover:bg-teal-500 text-white text-sm" // brighter teal
                          >
                            <FaEdit size={14} />
                          </Link>

                          {/* Delete Button */}
                          <button
                            onClick={() => handleDelete(customer._id)}
                            className="w-8 h-8 flex items-center justify-center rounded-md bg-red-400 hover:bg-red-500 text-white text-sm" // brighter red
                          >
                            <FaTrash size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Empty State */}
            {filteredOrders.length === 0 && (
              <p className="text-center text-gray-500 py-6 text-sm sm:text-base">
                No orders found.
              </p>
            )}

            {/* Footer Pagination */}
            <div className="border-t border-gray-200 px-4 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm text-gray-600">
                Showing 1 to 5 of {orders.length} entries
              </p>
              <div className="flex gap-2">
                <button className="text-sm text-green-700 hover:text-green-900 font-medium">
                  Previous
                </button>
                <button className="text-sm text-green-700 hover:text-green-900 font-medium">
                  1
                </button>
                <button className="text-sm text-green-700 hover:text-green-900 font-medium">
                  2
                </button>
                <button className="text-sm text-green-700 hover:text-green-900 font-medium">
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default OrdersPage;
