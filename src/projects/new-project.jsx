import React, { useState, useEffect } from "react";
import Sidebar from "../component/sidebar";
import MapComponent from "../component/map";
import { useNavigate } from "react-router-dom";
import { apiClient } from "../lib/api-client";
import { toast } from "react-toastify";
import LocationPickerModal from "../component/LeafletLocationPickerModal";

const NewProjectPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [loadingCustomers, setLoadingCustomers] = useState(true);
  const [employees, setEmployees] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);

  const [formData, setFormData] = useState({
    customerName: "",
    customerId: "",
    employeeName: "",
    employeeId: "",
    title: "",
    map_location: "",
    latitude: "31.3700",
    longitude: "74.2200",
    contact_name: "",
    contact_phone: "",
    contact_email: "",
    status: "active",
  });

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);

  // Fetch customers on component mount
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setLoadingCustomers(true);
        const response = await apiClient.getCustomers();
        const customersList = Array.isArray(response)
          ? response
          : response.customers || [];
        setCustomers(customersList);
      } catch (err) {
        console.error("Failed to fetch customers:", err);
        toast.error("Failed to load customers");
      } finally {
        setLoadingCustomers(false);
      }
    };

    fetchCustomers();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // If changing customer, auto-populate customer ID and name, and fetch employees
    if (name === "customerName") {
      const selectedCustomer = customers.find((c) => c._id === value);
      if (selectedCustomer) {
        setFormData((prev) => ({
          ...prev,
          customerName: selectedCustomer.name,
          customerId: selectedCustomer._id,
          employeeName: "", // Reset employee when customer changes
          employeeId: "",
        }));

        // Fetch employees for this customer
        fetchEmployeesForCustomer(selectedCustomer._id);
      }
    } else if (name === "employeeName") {
      // Handle employee selection
      const selectedEmployee = employees.find((emp) => emp._id === value);
      if (selectedEmployee) {
        setFormData((prev) => ({
          ...prev,
          employeeName: selectedEmployee.name,
          employeeId: selectedEmployee._id,
          contact_name: selectedEmployee.name,
          contact_phone: selectedEmployee.phone || "",
          contact_email: selectedEmployee.email || "",
        }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Fetch employees for a specific customer
  const fetchEmployeesForCustomer = async (customerId) => {
    try {
      setLoadingEmployees(true);
      const response = await apiClient.getUsersByCustomerId(customerId);
      console.log("getUsersByCustomerId response:", response);

      const employeesList = Array.isArray(response)
        ? response
        : response.users || [];

      console.log("Employees list:", employeesList);
      setEmployees(employeesList);
    } catch (err) {
      console.error("Failed to fetch employees:", err);
      setEmployees([]);
    } finally {
      setLoadingEmployees(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.customerName) {
      toast.error("Customer and Title are required");
      return;
    }

    const projectPayload = {
      customer: {
        id: formData.customerId,
        name: formData.customerName,
      },
      employee: {
        id: formData.employeeId || "0",
        name: formData.employeeName || "Not Assigned",
      },
      title: formData.title,
      map_location: formData.map_location,
      contact_name: formData.contact_name,
      contact_phone: formData.contact_phone,
      contact_email: formData.contact_email,
      status: formData.status,
      latitude: Number(formData.latitude),
      longitude: Number(formData.longitude),
    };

    try {
      setLoading(true);
      await apiClient.createProject(projectPayload);
      setShowSuccessModal(true);
    } catch (err) {
      console.log(err);
      toast.error("Failed to create project");
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    window.location.href = "/projects";
  };


  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-50">
      <Sidebar className={showSuccessModal ? "blur-sm" : ""} />

      <main className={`flex-1 overflow-y-auto pt-16 md:pt-0 ${showSuccessModal ? "blur-sm" : ""}`}>
        <div className="p-4 sm:p-6 md:p-8">

          {/* Header */}
          <div className="mb-6 flex items-center gap-4">
            <button
              onClick={() => window.history.back()}
              className="text-green-700 hover:text-green-900 font-medium"
            >
              ← Back
            </button>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Add Project
            </h1>
          </div>

          {/* FORM + MAP GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* FORM SECTION */}
            <div className="lg:col-span-2">
              <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">

                {/* Row 1 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Customer
                    </label>
                    <select
                      name="customerName"
                      value={formData.customerId}
                      onChange={handleInputChange}
                      disabled={loadingCustomers}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:ring-green-700 focus:border-green-700 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    >
                      <option value="">Select a customer</option>
                      {customers.map((customer) => (
                        <option key={customer._id} value={customer._id}>
                          {customer.name}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => navigate("/customers/new")}
                      className="mt-2 w-full rounded-lg border border-green-700 px-4 py-2 text-sm font-medium text-green-700 hover:bg-green-50 transition-colors"
                    >
                      + Add New Customer
                    </button>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Assigned Employee
                    </label>
                    <select
                      name="employeeName"
                      value={formData.employeeId}
                      onChange={handleInputChange}
                      disabled={loadingEmployees || !formData.customerId}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:ring-green-700 focus:border-green-700 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    >
                      <option value="">
                        {formData.customerId ? (loadingEmployees ? "Loading employees..." : "Select an employee") : "Select customer first"}
                      </option>
                      {employees.map((employee) => (
                        <option key={employee._id} value={employee._id}>
                          {employee.name}
                        </option>
                      ))}
                    </select>
                    {formData.customerId && !loadingEmployees && employees.length === 0 && (
                      <button
                        type="button"
                        onClick={() => navigate("/employee/new")}
                        className="mt-2 w-full rounded-lg border border-green-700 px-4 py-2 text-sm font-medium text-green-700 hover:bg-green-50 transition-colors"
                      >
                        + Add New Employee
                      </button>
                    )}


                  </div>
                </div>

                {/* Row 2 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Project Title
                    </label>
                    <input
                      name="title"
                      placeholder="Enter project title"
                      value={formData.title}
                      onChange={handleInputChange}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:ring-green-700 focus:border-green-700"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Project Location (Text)
                    </label>
                    <input
                      name="map_location"
                      placeholder="Location summary"
                      value={formData.map_location}
                      onChange={handleInputChange}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:ring-green-700 focus:border-green-700"
                    />
                  </div>
                </div>

                {/* Row 3 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contact Person
                    </label>
                    <input
                      name="contact_name"
                      placeholder="Enter contact name"
                      value={formData.contact_name}
                      onChange={handleInputChange}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:ring-green-700 focus:border-green-700"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contact Phone
                    </label>
                    <input
                      name="contact_phone"
                      placeholder="Phone number"
                      value={formData.contact_phone}
                      onChange={handleInputChange}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:ring-green-700 focus:border-green-700"
                    />
                  </div>
                </div>

                {/* Row 4 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contact Email
                    </label>
                    <input
                      type="email"
                      name="contact_email"
                      placeholder="Email address"
                      value={formData.contact_email}
                      onChange={handleInputChange}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:ring-green-700 focus:border-green-700"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:ring-green-700 focus:border-green-700"
                    >
                      <option value="active">Active</option>
                      <option value="completed">Completed</option>
                      <option value="on-hold">On Hold</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>

                {/* Row 5 - Lat/Lng */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Latitude
                    </label>
                    <input
                      name="latitude"
                      value={formData.latitude}
                      onChange={handleInputChange}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:ring-green-700 focus:border-green-700"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Longitude
                    </label>
                    <input
                      name="longitude"
                      value={formData.longitude}
                      onChange={handleInputChange}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:ring-green-700 focus:border-green-700"
                    />
                  </div>
                </div>

                {/* Buttons */}
                <div className="mt-8 flex gap-4">
                  <button
                    onClick={handleSubmit}
                    className="rounded-lg bg-green-700 px-6 py-2 text-sm font-medium text-white hover:bg-green-800 transition"
                  >
                    Add Project
                  </button>

                  <button
                    onClick={() => window.history.back()}
                    className="rounded-lg border border-gray-300 px-6 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 transition"
                  >
                    Back
                  </button>
                </div>
              </div>
            </div>

            {/* MAP SECTION */}
            <div className="lg:col-span-1">
              <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm h-96">
                <MapComponent
                  lat={parseFloat(formData.latitude)}
                  lng={parseFloat(formData.longitude)}
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
            <h2 className="text-lg font-semibold mb-4 text-green-600">Success</h2>

            <p className="mb-6 text-gray-700">
              Project <span className="font-bold">{formData.title}</span> has been created successfully
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
      <LocationPickerModal
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

}

export default NewProjectPage