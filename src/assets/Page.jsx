import React, { useState } from "react";
import { assets as mockAssets } from "../lib/mock-data";
import { Link } from "react-router-dom";
import Sidebar from "../component/sidebar";
import { FaEdit, FaTrash } from "react-icons/fa";

const AssetsPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [assets, setAssets] = useState(mockAssets);

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
  // PERMISSIONS (ASSETS)
  // -------------------------
  const canAddAsset =
    role === "admin" || role === "manager" || role === "supervisor";

  const canEditAsset = role === "admin" || role === "manager";

  const canDeleteAsset = role === "admin" || role === "manager";

  // -------------------------
  // DELETE ASSET (mock)
  // -------------------------
  const handleDelete = (id) => {
    setAssets((prev) => prev.filter((asset) => asset.id !== id));
  };

  // -------------------------
  // FILTER
  // -------------------------
  const filteredAssets = assets.filter(
    (asset) =>
      asset.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.barcode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-50">
      <Sidebar />

      <main className="flex-1 overflow-y-auto pt-16 md:pt-0">
        <div className="p-4 sm:p-6 md:p-8">
          {/* Header */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Assets
            </h1>

            {/* ADD ASSET (Admin + Manager + Supervisor) */}
            {canAddAsset && (
              <Link
                to="/assets/new"
                className="rounded-lg bg-green-700 px-4 py-2 text-sm font-medium text-white hover:bg-green-800 transition-colors"
              >
                + Add Asset
              </Link>
            )}
          </div>

          {/* Search */}
          <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-200 p-4 sm:p-6">
              <input
                type="text"
                placeholder="Search assets by title, customer, or barcode..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm sm:text-base focus:border-green-700 focus:outline-none focus:ring-1 focus:ring-green-700"
              />
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] text-sm sm:text-base">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="px-4 py-3 text-left">Title</th>
                    <th className="px-4 py-3 text-left">Customer</th>
                    <th className="px-4 py-3 text-left">Category</th>
                    <th className="px-4 py-3 text-left">Manufacturer</th>
                    <th className="px-4 py-3 text-left">Barcode</th>
                    <th className="px-4 py-3 text-left">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredAssets.map((asset) => (
                    <tr
                      key={asset.id}
                      className="border-b border-gray-200 hover:bg-gray-50"
                    >
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {asset.title}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {asset.customer}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {asset.category}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {asset.manufacturer}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {asset.barcode}
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {/* EDIT (Admin + Manager) */}
                          {canEditAsset && (
                            <Link
                              to={`/assets/${asset.id}/edit`}
                              className="w-8 h-8 flex items-center justify-center rounded-md bg-teal-400 hover:bg-teal-500 text-white"
                            >
                              <FaEdit size={14} />
                            </Link>
                          )}

                          {/* DELETE (Admin + Manager) */}
                          {canDeleteAsset && (
                            <button
                              onClick={() => handleDelete(asset.id)}
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

            {/* Empty State */}
            {filteredAssets.length === 0 && (
              <p className="text-center text-gray-500 py-6">
                No assets found.
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AssetsPage;
