import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import Sidebar from "../component/sidebar";
import MapComponent from "../component/map";
import LeafletLocationPickerModal from "../component/LeafletLocationPickerModal";
import { apiClient } from "../lib/api-client";

const EditProjectPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    customer: "",
    title: "",
    location: "",
    latitude: "",
    longitude: "",
    contactName: "",
    contactPhone: "",
    contactEmail: "",
  });

  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);

  // Fetch project data and customers
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // Fetch project details
        const projectResponse = await apiClient.getProjectById(id);
        const projectData = projectResponse?.project || projectResponse;
        console.log("Loaded project data:", projectData);

        setFormData({
          customer: projectData.customer.name || "",
          title: projectData.title || "",
          location: projectData.map_location || "",
          latitude: projectData.latitude.$numberDecimal || "",
          longitude: projectData.longitude.$numberDecimal || "",
          contactName: projectData.contact_name || "",
          contactPhone: projectData.contact_phone || "",
          contactEmail: projectData.contact_email || "",
          status: projectData.status || "",
        });

        // Fetch customers list
        const customersResponse = await apiClient.getCustomers();
        const customersList = Array.isArray(customersResponse)
          ? customersResponse
          : customersResponse.customers || [];
        setCustomers(customersList);
      } catch (err) {
        setError(err.message || "Failed to load project data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async () => {
    try {
      setSubmitting(true);

      // Map form data to API format (snake_case)
      const updateData = {
        title: formData.title,
        map_location: formData.location,
        latitude: formData.latitude,
        longitude: formData.longitude,
        contact_name: formData.contactName,
        contact_phone: formData.contactPhone,
        contact_email: formData.contactEmail,
      };

      await apiClient.updateProject(id, updateData);
      setShowSuccessModal(true);
    } catch (err) {
      setError(err.message || "Failed to update project");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    navigate("/projects");
  };

  if (loading) {
    return (
      <div className="flex flex-col md:flex-row h-screen bg-gray-50">
        <Sidebar />
        <main className="flex-1 overflow-y-auto pt-16 md:pt-0 p-4 sm:p-6 md:p-8">
          <p className="text-gray-600">Loading project data...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-50">
      <Sidebar className={showSuccessModal ? "blur-sm" : ""} />
      <main
        className={`flex-1 overflow-y-auto pt-16 md:pt-0 ${showSuccessModal ? "blur-sm" : ""
          }`}
      >
        <div className="p-4 sm:p-6 md:p-8">
          {/* Header */}
          <div className="mb-6 flex flex-wrap items-center gap-4">
            <Link
              to="/projects"
              className="text-green-700 hover:text-green-900"
            >
              ← Back
            </Link>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Edit Project
            </h1>
          </div>

          {error && (
            <div className="mb-6 bg-red-100 border border-red-300 text-red-600 p-3 rounded">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form Section */}
            <div className="lg:col-span-2">
              <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                {/* Customer Dropdown */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Customer Name
                    </label>
                    <input
                      type="text"
                      name="title"
                      disabled='true'
                      value={formData.customer || ""}
                      readOnly
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm bg-gray-100 cursor-not-allowed text-gray-600"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Project Title
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title || ""}
                      onChange={handleInputChange}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-green-700 focus:outline-none focus:ring-1 focus:ring-green-700"
                    />
                  </div>
                </div>

                {/* Contact Fields */}
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contact Name
                    </label>
                    <input
                      type="text"
                      name="contactName"
                      disabled
                      value={formData.contactName || ""}
                      onChange={handleInputChange}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm bg-gray-100 cursor-not-allowed text-gray-600 disabled:opacity-60"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contact Phone
                    </label>
                    <input
                      type="text"
                      name="contactPhone"
                      disabled
                      value={formData.contactPhone || ""}
                      onChange={handleInputChange}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm bg-gray-100 cursor-not-allowed text-gray-600 disabled:opacity-60"
                    />
                  </div>
                </div>

                {/* Email and Location */}
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contact Email
                    </label>
                    <input
                      type="email"
                      name="contactEmail"
                      disabled
                      value={formData.contactEmail || ""}
                      onChange={handleInputChange}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm bg-gray-100 cursor-not-allowed text-gray-600 disabled:opacity-60"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location || ""}
                      onChange={handleInputChange}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-green-700 focus:outline-none focus:ring-1 focus:ring-green-700"
                    />
                  </div>
                </div>

                {/* Coordinates */}
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Latitude
                    </label>
                    <input
                      type="text"
                      name="latitude"
                      value={formData.latitude || ""}
                      onChange={handleInputChange}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-green-700 focus:outline-none focus:ring-1 focus:ring-green-700"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Longitude
                    </label>
                    <input
                      type="text"
                      name="longitude"
                      value={formData.longitude || ""}
                      onChange={handleInputChange}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-green-700 focus:outline-none focus:ring-1 focus:ring-green-700"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-medium text-gray-700 mb-1">
                    Status
                  </label>

                  <select
                    name="status"
                    value={formData.status || ""}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border-gray-300 focus:border-green-700 focus:ring-green-700 shadow-sm px-3 py-2"
                  >

                    <option value="Active">Active</option>
                    <option value="On Hold">On Hold</option>
                    <option value="Completed">Processing</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>

                {/* Buttons */}
                <div className="mt-8 flex flex-wrap gap-4">
                  <button
                    onClick={handleUpdate}
                    disabled={submitting}
                    className="rounded-lg bg-green-700 px-6 py-2 text-sm font-medium text-white hover:bg-green-800 transition-colors disabled:opacity-60"
                  >
                    {submitting ? "Updating..." : "Update"}
                  </button>
                  <Link
                    to="/projects"
                    className="rounded-lg border border-gray-300 px-6 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Back
                  </Link>
                </div>
              </div>
            </div>

            {/* Map Section */}
            <div className="lg:col-span-1">
              <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm h-96">
                <MapComponent
                  lat={parseFloat(formData.latitude) || 31.3700}
                  lng={parseFloat(formData.longitude) || 74.2200}
                />
              </div>
              <button
                type="button"
                onClick={() => setShowLocationPicker(true)}
                className="mt-4 w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
              >
                Pick Location on Map
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* SUCCESS MODAL */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="absolute inset-0 backdrop-blur-sm z-40"></div>

          <div className="relative bg-white rounded-lg shadow-xl p-6 w-full max-w-sm mx-2 z-50">
            <h2 className="text-lg font-semibold mb-4 text-green-600">
              Success
            </h2>

            <p className="mb-6 text-gray-700">
              Project <span className="font-bold">{formData.title}</span> has
              been edited successfully
            </p>

            <div className="flex justify-end">
              <button
                onClick={handleCloseSuccessModal}
                className="px-4 py-2 rounded bg-green-700 text-white hover:bg-green-800"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      <LeafletLocationPickerModal
        isOpen={showLocationPicker}
        initialLat={parseFloat(formData.latitude)}
        initialLng={parseFloat(formData.longitude)}
        onClose={() => setShowLocationPicker(false)}
        onSelectLocation={({ latitude, longitude }) => {
          setFormData(prev => ({
            ...prev,
            latitude: latitude.toString(),
            longitude: longitude.toString(),
          }))
        }}
      />
    </div>
  );
};

export default EditProjectPage;
