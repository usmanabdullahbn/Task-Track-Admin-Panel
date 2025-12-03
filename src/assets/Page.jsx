import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../component/sidebar";
import { FaEdit, FaTrash } from "react-icons/fa";
import { apiClient } from "../lib/api-client";

const AssetsPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [assetToDelete, setAssetToDelete] = useState(null);

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
  // LOAD ASSETS FROM API
  // -------------------------
  useEffect(() => {
    const fetchAssets = async () => {
      try {
        const res = await apiClient.getAssets();
        console.log("Assets API Response:", res);

        // Handle both array and { assets: [] } response shapes
        const assetsData = Array.isArray(res) ? res : res?.assets || [];
        setAssets(assetsData);
      } catch (err) {
        console.error("Failed to load assets", err);
        setAssets([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAssets();
  }, []);

  // -------------------------
  // DELETE ASSET
  // -------------------------
  const openDeleteModal = (asset) => {
    setAssetToDelete(asset);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setAssetToDelete(null);
  };

  const handleDelete = async (id) => {
    const idToDelete = id;
    setDeletingId(idToDelete);

    try {
      await apiClient.deleteAsset(idToDelete);
      setAssets((prev) =>
        prev.filter((asset) => (asset.id || asset._id) !== idToDelete)
      );
      closeDeleteModal();
    } catch (err) {
      console.error("Failed to delete asset:", err);
    } finally {
      setDeletingId(null);
    }
  };

  // -------------------------
  // FILTER
  // -------------------------
  const filteredAssets = assets.filter((asset) => {
    const title = asset.title || "";
    const customer = asset.customer?.name || asset.customer || "";
    const barcode = asset.barcode || "";
    const search = (searchTerm || "").toLowerCase();

    return (
      title.toLowerCase().includes(search) ||
      customer.toLowerCase().includes(search) ||
      barcode.toLowerCase().includes(search)
    );
  });

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
            {loading ? (
              <p className="text-center text-gray-500 py-6">Loading assets...</p>
            ) : filteredAssets.length === 0 ? (
              <p className="text-center text-gray-500 py-6">No assets found.</p>
            ) : (
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
                        key={asset.id || asset._id}
                        className="border-b border-gray-200 hover:bg-gray-50"
                      >
                        <td className="px-4 py-3 font-medium text-gray-900">
                          {asset.title}
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {asset.customer?.name || asset.customer || "-"}
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {asset.category || "-"}
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {asset.manufacturer || "-"}
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {asset.barcode || "-"}
                        </td>

                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            {/* EDIT (Admin + Manager) */}
                            {canEditAsset && (
                              <Link
                                to={`/assets/${asset.id || asset._id}`}
                                className="w-8 h-8 flex items-center justify-center rounded-md bg-teal-400 hover:bg-teal-500 text-white"
                              >
                                <FaEdit size={14} />
                              </Link>
                            )}

                            {/* DELETE (Admin + Manager) */}
                            {canDeleteAsset && (
                              <button
                                onClick={() => openDeleteModal(asset)}
                                disabled={deletingId === (asset.id || asset._id)}
                                className="w-8 h-8 flex items-center justify-center rounded-md bg-red-400 hover:bg-red-500 text-white disabled:opacity-50 disabled:cursor-not-allowed"
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
            )}
          </div>
        </div>
      </main>

      {/* DELETE CONFIRMATION MODAL */}
      {showDeleteModal && assetToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="rounded-lg bg-white shadow-lg max-w-sm w-full mx-4">
            {/* Header */}
            <div className="border-b border-gray-200 px-6 py-4">
              <h2 className="text-lg font-bold text-gray-900">Delete Asset</h2>
            </div>

            {/* Body */}
            <div className="px-6 py-4">
              <p className="text-gray-600 mb-2">
                Are you sure you want to delete this asset?
              </p>
              <p className="font-semibold text-gray-900">
                {assetToDelete.title}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                This action cannot be undone.
              </p>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 px-6 py-4 flex gap-3 justify-end">
              <button
                onClick={closeDeleteModal}
                disabled={deletingId === (assetToDelete.id || assetToDelete._id)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(assetToDelete.id || assetToDelete._id)}
                disabled={deletingId === (assetToDelete.id || assetToDelete._id)}
                className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 disabled:opacity-50"
              >
                {deletingId === (assetToDelete.id || assetToDelete._id)
                  ? "Deleting..."
                  : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssetsPage;
