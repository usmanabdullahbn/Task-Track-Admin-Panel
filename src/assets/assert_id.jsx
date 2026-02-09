import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Sidebar from "../component/sidebar";
import { apiClient } from "../lib/api-client";

const EditAssetPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const [originalAsset, setOriginalAsset] = useState(null);

  const [selectedFiles, setSelectedFiles] = useState([]);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    model: "",
    manufacturer: "",
    serial_number: "",
    category: "",
    barcode: "",
  });

  // Fetch asset by ID
  useEffect(() => {
    const fetchAsset = async () => {
      try {
        const res = await apiClient.getAssetById(id);
        const asset = res.asset || res;

        // console.log(asset)
        setOriginalAsset(asset);

        setFormData({
          title: asset.title || "",
          description: asset.description || "",
          model: asset.model || "",
          manufacturer: asset.manufacturer || "",
          serial_number: asset.serial_number || "",
          category: asset.category || "",
          barcode: asset.barcode || "",
        });

        setLoading(false);
      } catch (err) {
        console.error(err);
        setError("Failed to load asset");
        setLoading(false);
      }
    };

    fetchAsset();
  }, [id]);

  // Handle input change
  const handleInputChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Submit update
  const handleSubmit = async () => {
    if (!formData.title) {
      setError("Please fill in all required fields");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const payload = {
        title: formData.title,
        description: formData.description,
        model: formData.model,
        manufacturer: formData.manufacturer,
        serial_number: formData.serial_number,
        category: formData.category,
        barcode: formData.barcode,
      };

      if (selectedFiles && selectedFiles.length > 0) {
        const fd = new FormData();
        Object.keys(payload).forEach((k) => {
          if (payload[k] !== undefined && payload[k] !== null) fd.append(k, payload[k]);
        });

        selectedFiles.forEach((file) => fd.append('files', file));

        await apiClient.updateAsset(id, fd);
      } else {
        await apiClient.updateAsset(id, payload);
      }

      setShowSuccess(true);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to update asset");
    } finally {
      setSaving(false);
    }
  };

  const closeModal = () => {
    setShowSuccess(false);
    navigate("/assets");
  };

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
    <div className="flex flex-col md:flex-row h-screen bg-gray-50">
      <Sidebar className={showSuccess ? "blur-sm" : ""} />

      <main
        className={`flex-1 overflow-y-auto pt-16 md:pt-0 ${
          showSuccess ? "blur-sm" : ""
        }`}
      >
        <div className="p-4 sm:p-6 md:p-8">
          <div className="mb-6 flex flex-wrap items-center gap-4">
            <Link to="/assets" className="text-green-700 hover:text-green-900">
              ← Back
            </Link>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Edit Asset
            </h1>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-100 border border-red-300 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm max-w-4xl">
            {/* Form Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-green-700 focus:outline-none focus:ring-1 focus:ring-green-700"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Serial Number
                </label>
                <input
                  type="text"
                  name="serial_number"
                  value={formData.serial_number}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-green-700 focus:outline-none focus:ring-1 focus:ring-green-700"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Barcode
                </label>
                <input
                  type="text"
                  name="barcode"
                  value={formData.barcode}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-green-700 focus:outline-none focus:ring-1 focus:ring-green-700"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Panel Builder
                </label>
                <input
                  type="text"
                  name="model"
                  value={formData.model}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-green-700 focus:outline-none focus:ring-1 focus:ring-green-700"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <input
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-green-700 focus:outline-none focus:ring-1 focus:ring-green-700"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Manufacturer
                </label>
                <input
                  type="text"
                  name="manufacturer"
                  value={formData.manufacturer}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-green-700 focus:outline-none focus:ring-1 focus:ring-green-700"
                />
              </div>
            </div>

            {/* Single Column Fields */}
            <div className="mt-6 grid grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-green-700 focus:outline-none focus:ring-1 focus:ring-green-700"
                />
              </div>
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
                accept=".pdf,.doc,.docx,.csv"
                onChange={(e) => {
                  const files = Array.from(e.target.files);
                  console.log("Selected Files:", files);
                  setSelectedFiles(files);
                }}
                className="w-full border-2 border-gray-300 rounded-lg px-4 py-2.5 bg-white
               text-gray-900 file:bg-green-700 file:text-white 
               file:border-none file:px-4 file:py-2 file:mr-4 
               file:rounded-md file:cursor-pointer
               hover:file:bg-green-800 transition cursor-pointer"
              />
              <p className="text-xs text-gray-500 mt-1">
                You can select multiple PDF, Word, or CSV files.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex flex-wrap gap-4">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={saving}
                className="rounded-lg bg-green-700 px-6 py-2 text-sm font-medium text-white hover:bg-green-800 transition-colors disabled:opacity-60"
              >
                {saving ? "Updating..." : "Update Asset"}
              </button>
              <Link
                to="/assets"
                className="rounded-lg border border-gray-300 px-6 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Back
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* SUCCESS MODAL */}
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="absolute inset-0 backdrop-blur-sm z-40"></div>

          <div className="relative bg-white rounded-lg shadow-xl p-6 w-full max-w-sm mx-2 z-50">
            <h2 className="text-lg font-semibold mb-4 text-green-600">
              Success
            </h2>

            <p className="mb-6 text-gray-700">
              Asset <span className="font-bold">{formData.title}</span> has been
              updated successfully.
            </p>

            <div className="flex justify-end">
              <button
                onClick={closeModal}
                className="px-4 py-2 rounded bg-green-700 text-white hover:bg-green-800 transition-colors"
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

export default EditAssetPage;
