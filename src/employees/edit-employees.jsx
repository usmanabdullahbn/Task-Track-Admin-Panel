import React, { useEffect, useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import Sidebar from "../component/sidebar";
import { Link, useNavigate, useParams } from "react-router-dom";
import { apiClient } from "../lib/api-client";

const emailRe = /^[\w.-]+@[\w.-]+\.\w+$/;

const EditEmployeePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    designation: "",
    email: "",
    phone: "",
    password: "",
    role: "employee",
    is_active: true,
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [emailValidation, setEmailValidation] = useState({
    status: "idle",
    message: "",
  });

  // Success modal states
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [employeeName, setEmployeeName] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Fetch employee data
  const fetchEmployee = async () => {
    try {
      const response = await apiClient.getUserById(id);

      const emp = response?.user || response;

      setFormData({
        name: emp.name || "",
        designation: emp.designation || "",
        email: emp.email || "",
        phone: emp.phone || "",
        password: emp.password || "",
        role: emp.role || "employee",
        is_active: emp.is_active !== undefined ? emp.is_active : true,
      });
    } catch (err) {
      setError("Failed to load employee data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployee();
  }, [id]);

  useEffect(() => {
    const email = formData.email.trim();

    if (!email) {
      setEmailValidation({ status: "idle", message: "" });
      return;
    }

    if (!emailRe.test(email)) {
      setEmailValidation({
        status: "invalid",
        message: "Please provide a valid email",
      });
      return;
    }

    let canceled = false;
    const timeoutId = setTimeout(async () => {
      setEmailValidation({ status: "checking", message: "Checking mailbox..." });
      try {
        const result = await apiClient.validateUserMailbox(email, { ignoreUserId: id });
        if (canceled) return;
        setEmailValidation({
          status: result.mailboxExists ? "valid" : "invalid",
          message:
            result.message ||
            (result.mailboxExists ? "Mailbox verified." : "Mailbox does not exist"),
        });
      } catch (err) {
        if (canceled) return;
        setEmailValidation({
          status: "invalid",
          message: err.message || "Mailbox does not exist",
        });
      }
    }, 500);

    return () => {
      canceled = true;
      clearTimeout(timeoutId);
    };
  }, [formData.email, id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Submit Update
  const handleSubmit = async (e) => {
    if (e?.preventDefault) e.preventDefault();

    setError("");
    if (!formData.name.trim()) return setError("Please provide a name");
    if (!formData.designation.trim()) return setError("Please provide a designation");
    if (!emailRe.test(formData.email)) return setError("Please provide a valid email");
    if (emailValidation.status !== "valid") {
      return setError(
        emailValidation.status === "checking"
          ? "Please wait while email mailbox is being validated"
          : emailValidation.message || "Mailbox does not exist"
      );
    }

    setSubmitting(true);

    try {
      const payload = {
        ...formData,
        role: String(formData.role).toLowerCase(),
      };

      await apiClient.updateUser(id, payload);

      // Show success modal
      setEmployeeName(formData.name);
      setShowSuccessModal(true);
    } catch (err) {
      console.error("Update employee error:", err);
      setError(err.message || "Failed to update employee");
    } finally {
      setSubmitting(false);
    }
  };

  const isSubmitDisabled = submitting || emailValidation.status !== "valid";
  const disabledReason = submitting
    ? "Saving..."
    : emailValidation.status === "checking"
      ? "Checking mailbox..."
      : emailValidation.status === "invalid"
        ? emailValidation.message || "Mailbox does not exist"
        : "Enter a valid, existing mailbox to continue";

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    navigate("/employees");
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center text-lg">
        Loading employee data...
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-50">
      <Sidebar className={showSuccessModal ? "blur-sm" : ""} />

      <main
        className={`flex-1 overflow-y-auto pt-16 md:pt-0 ${
          showSuccessModal ? "blur-sm" : ""
        }`}
      >
        <div className="p-4 sm:p-6 md:p-8">
          <div className="mb-6 flex flex-wrap items-center gap-4">
            <Link
              to="/employees"
              className="text-green-700 hover:text-green-900"
            >
              ← Back
            </Link>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Edit User
            </h1>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm max-w-3xl">
            {/* Row 1 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  placeholder="Employee name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-green-700 focus:ring-green-700"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Designation
                </label>
                <input
                  type="text"
                  name="designation"
                  placeholder="Job designation"
                  value={formData.designation}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-green-700 focus:ring-green-700"
                />
              </div>
            </div>

            {/* Row 2 */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder="Email address"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-green-700 focus:ring-green-700"
                />
                {emailValidation.message && (
                  <p
                    className={`mt-1 text-xs ${
                      emailValidation.status === "valid"
                        ? "text-green-700"
                        : "text-red-600"
                    }`}
                  >
                    {emailValidation.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone
                </label>
                <input
                  type="text"
                  name="phone"
                  placeholder="Phone number"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-green-700 focus:ring-green-700"
                />
              </div>
            </div>

            {/* Row 3 - Password */}
            {/* Row 3 - Password */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>

                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="New password (leave blank to keep current)"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 pr-10 text-sm focus:border-green-700 focus:ring-green-700"
                  />

                  <span
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-500"
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </span>
                </div>
              </div>
            </div>

            {/* Role */}
            {/* <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Role
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-green-700 focus:ring-green-700"
              >
                <option value="admin">Admin</option>
                <option value="manager">Manager</option>
                <option value="supervisor">Supervisor</option>
                <option value="technician">Technician</option>
                // <option value="employee">Employee</option> 
              </select>
            </div> */}

            {/* Is Active */}
            <div className="mt-6">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      is_active: e.target.checked,
                    }))
                  }
                  className="w-5 h-5 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 focus:ring-2"
                />
                <span className="text-sm font-medium text-gray-700">
                  Is Active
                </span>
              </label>
              <p className="text-xs text-gray-500 mt-1">
                Uncheck to deactivate this employee
              </p>
            </div>

            {/* Error Message */}
            {error && <div className="text-red-600 text-sm mt-4">{error}</div>}

            {/* Buttons */}
            <div className="mt-8 flex flex-wrap gap-4">
              <div className="relative group inline-block">
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitDisabled}
                  className="rounded-lg bg-green-700 px-6 py-2 text-sm font-medium text-white hover:bg-green-800 transition disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {submitting ? "Saving..." : "Save Changes"}
                </button>
                {isSubmitDisabled && (
                  <div className="pointer-events-none absolute left-1/2 top-full mt-2 -translate-x-1/2 whitespace-nowrap rounded bg-red-600 px-3 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
                    {disabledReason}
                  </div>
                )}
              </div>

              <Link
                to="/employees"
                className="rounded-lg border border-gray-300 px-6 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
              >
                Cancel
              </Link>
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
              Employee <span className="font-bold">{employeeName}</span> has
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
    </div>
  );
};

export default EditEmployeePage;
