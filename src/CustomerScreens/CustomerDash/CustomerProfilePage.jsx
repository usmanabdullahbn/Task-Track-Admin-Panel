import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CustomerSidebar from "./customer-sidebar";
import { apiClient } from "../../lib/api-client";
import { FaEdit, FaSave, FaTimes, FaEye, FaEyeSlash, FaUser, FaLock, FaCheckCircle, FaExclamationCircle } from "react-icons/fa";

const CustomerProfilePage = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
    });
    const [passwords, setPasswords] = useState({
        newPassword: "",
        confirmPassword: "",
    });
    const [showPasswords, setShowPasswords] = useState({
        newPassword: false,
        confirmPassword: false,
    });
    const [isEditing, setIsEditing] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    useEffect(() => {
        // Get user from localStorage
        try {
            const storedUserData = localStorage.getItem("User");
            if (storedUserData) {
                const parsedData = JSON.parse(storedUserData);
                // For customers, data is stored under 'customer' key
                // For admin/other users, it might be under 'user' key
                const userData = parsedData.customer || parsedData.user || parsedData;

                if (userData && userData._id) {
                    setUser(userData);
                    setFormData({
                        name: userData.name || "",
                        email: userData.email || "",
                        phone: userData.phone || "",
                    });
                }
            }
        } catch (err) {
            console.error("Error loading user from localStorage:", err);
        }
        setLoading(false);
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswords((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const togglePasswordVisibility = (field) => {
        setShowPasswords((prev) => ({
            ...prev,
            [field]: !prev[field],
        }));
    };

    const handleSaveProfile = async () => {
        try {
            setError(null);
            setSuccess(null);

            if (!formData.name || !formData.email || !formData.phone) {
                setError("All fields are required");
                return;
            }

            // Update customer through API using updateCustomer function
            await apiClient.updateCustomer(user._id, {
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
            });

            // Fetch updated customer details from API
            const updatedCustomerData = await apiClient.getCustomerById(user._id);
            const freshCustomerData = updatedCustomerData.customer || updatedCustomerData;

            // Update local state with fresh customer data from API
            setUser(freshCustomerData);

            // Update localStorage with the fresh customer data
            const storedUserData = JSON.parse(localStorage.getItem("User"));
            const updatedStoredData = {
                ...storedUserData,
                customer: freshCustomerData, // Save under 'customer' key for customer users
            };
            localStorage.setItem("User", JSON.stringify(updatedStoredData));

            // Update form data with fresh data
            setFormData({
                name: freshCustomerData.name || "",
                email: freshCustomerData.email || "",
                phone: freshCustomerData.phone || "",
            });

            setIsEditing(false);
            setSuccess("Profile updated successfully!");
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            console.error("Failed to update profile:", err);
            setError(err.message || "Failed to update profile");
        }
    };

    const handleChangePassword = async () => {
        try {
            setError(null);
            setSuccess(null);

            if (!passwords.newPassword || !passwords.confirmPassword) {
                setError("All password fields are required");
                return;
            }

            if (passwords.newPassword !== passwords.confirmPassword) {
                setError("New passwords do not match");
                return;
            }

            if (passwords.newPassword.length < 6) {
                setError("Password must be at least 6 characters");
                return;
            }

            await apiClient.changeCustomerPassword(user._id, {
                newPassword: passwords.newPassword,
            });

            // Update localStorage with new password
            const storedUserData = JSON.parse(localStorage.getItem("User"));
            const updatedStoredData = {
                ...storedUserData,
                customer: {
                    ...storedUserData.customer,
                    password: passwords.newPassword,
                },
            };
            localStorage.setItem("User", JSON.stringify(updatedStoredData));

            setPasswords({
                newPassword: "",
                confirmPassword: "",
            });
            setShowPasswords({
                newPassword: false,
                confirmPassword: false,
            });
            setShowPasswordModal(false);
            setSuccess("Password changed successfully!");
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            console.error("Failed to change password:", err);
            setError(err.message || "Failed to change password");
        }
    };

    if (loading) {
        return (
            <div className="flex h-screen bg-gray-50">
                <CustomerSidebar />
                <main className="flex-1 flex items-center justify-center">
                    <p className="text-gray-500">Loading profile...</p>
                </main>
            </div>
        );
    }

    if (!user) {
        const storedData = localStorage.getItem("customer");
        console.error("User not found. StoredData:", storedData);

        return (
            <div className="flex h-screen bg-gray-50">
                <CustomerSidebar />
                <main className="flex-1 flex items-center justify-center px-4">
                    <div className="text-center">
                        <p className="text-red-500 text-lg font-semibold mb-2">User not found</p>
                        <p className="text-gray-600 mb-4">Unable to load your profile. Please try logging in again.</p>
                        <button
                            onClick={() => window.location.href = "/login"}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Return to Login
                        </button>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="flex flex-col md:flex-row h-screen  from-gray-50 to-gray-100">
            <CustomerSidebar />

            <main className="flex-1 overflow-y-auto pt-16 md:pt-0">
                <div className="p-4 sm:p-6 md:p-8 max-w-1xl mx-auto">
                    {/* Header Section */}
                    <div className="mb-8">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-16 h-16  from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white">
                                <FaUser size={32} />
                            </div>
                            <div>
                                <h1 className="text-4xl font-bold text-gray-900">My Profile</h1>
                                <p className="text-gray-600 mt-1">
                                    {user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : "User"} Account
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Success Message */}
                    {success && (
                        <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 rounded-lg flex items-start gap-3">
                            <FaCheckCircle className="text-green-600 mt-0.5-shrink-0" size={20} />
                            <p className="text-green-700">{success}</p>
                        </div>
                    )}

                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg flex items-start gap-3">
                            <FaExclamationCircle className="text-red-600 mt-0.5" size={20} />
                            <p className="text-red-700">{error}</p>
                        </div>
                    )}

                    {/* Profile Information Card */}
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-8 hover:shadow-xl transition-shadow">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                    <FaUser className="text-blue-600" />
                                    Profile Information
                                </h2>
                                <p className="text-gray-500 text-sm mt-1">Update your personal details</p>
                            </div>
                            {!isEditing ? (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="flex items-center gap-2 px-6 py-3 from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-md hover:shadow-lg font-medium"
                                >
                                    <FaEdit size={16} />
                                    Edit Profile
                                </button>
                            ) : (
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleSaveProfile}
                                        className="flex items-center gap-2 px-6 py-3 from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-md hover:shadow-lg font-medium"
                                    >
                                        <FaSave size={16} />
                                        Save Changes
                                    </button>
                                    <button
                                        onClick={() => {
                                            setIsEditing(false);
                                            setFormData({
                                                name: user.name || "",
                                                email: user.email || "",
                                                phone: user.phone || "",
                                            });
                                        }}
                                        className="flex items-center gap-2 px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-all font-medium"
                                    >
                                        <FaTimes size={16} />
                                        Cancel
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Role (Read-only) */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Account Role
                                </label>
                                <input
                                    type="text"
                                    value={user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : ""}
                                    disabled
                                    className="w-full px-4 py-3 from-gray-50 to-gray-100 text-gray-700 rounded-lg border border-gray-200 font-medium cursor-not-allowed"
                                />
                            </div>

                            {/* Name */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    disabled={!isEditing}
                                    className={`w-full px-4 py-3 rounded-lg border-2 transition-all font-medium ${isEditing
                                        ? "bg-white border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        : "bg-gray-50 border-gray-200 text-gray-700 cursor-not-allowed"
                                        }`}
                                />
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    disabled={!isEditing}
                                    className={`w-full px-4 py-3 rounded-lg border-2 transition-all font-medium ${isEditing
                                        ? "bg-white border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        : "bg-gray-50 border-gray-200 text-gray-700 cursor-not-allowed"
                                        }`}
                                />
                            </div>

                            {/* Phone */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Phone Number
                                </label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    disabled={!isEditing}
                                    className={`w-full px-4 py-3 rounded-lg border-2 transition-all font-medium ${isEditing
                                        ? "bg-white border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        : "bg-gray-50 border-gray-200 text-gray-700 cursor-not-allowed"
                                        }`}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Security Card */}
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition-shadow">
                        <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                            <FaLock className="text-blue-600" />
                            Security Settings
                        </h2>
                        <p className="text-gray-500 text-sm mb-6">Manage your password and account security</p>

                        <button
                            onClick={() => setShowPasswordModal(true)}
                            className="px-8 py-3 from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-md hover:shadow-lg font-medium flex items-center gap-2"
                        >
                            <FaLock size={16} />
                            Change Password
                        </button>
                    </div>
                </div>
            </main>

            {/* Change Password Modal */}
            {showPasswordModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
                    <div className="absolute inset-0 backdrop-blur-sm z-40" />
                    <div className="relative bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg mx-2 z-50">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                <FaLock className="text-blue-600" size={20} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">
                                    Change Your Password
                                </h2>
                                <p className="text-gray-500 text-sm">Ensure your account is secure</p>
                            </div>
                        </div>

                        {/* Error Message in Modal */}
                        {error && (
                            <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 rounded flex items-start gap-2">
                                <FaExclamationCircle className="text-red-600 mt-0.5-shrink-0" size={18} />
                                <p className="text-red-700 text-sm">{error}</p>
                            </div>
                        )}

                        <div className="space-y-4 mb-6">
                            {/* New Password */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    New Password *
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPasswords.newPassword ? "text" : "password"}
                                        name="newPassword"
                                        value={passwords.newPassword}
                                        onChange={handlePasswordChange}
                                        placeholder="Enter a new password (min. 6 characters)"
                                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => togglePasswordVisibility("newPassword")}
                                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                                    >
                                        {showPasswords.newPassword ? (
                                            <FaEyeSlash size={18} />
                                        ) : (
                                            <FaEye size={18} />
                                        )}
                                    </button>
                                </div>
                                {passwords.newPassword && (
                                    <div className="mt-2 text-xs">
                                        <div className={`flex items-center gap-2 ${passwords.newPassword.length >= 6 ? "text-green-600" : "text-gray-500"}`}>
                                            {passwords.newPassword.length >= 6 ? <FaCheckCircle size={14} /> : <span className="w-4 h-4 border border-current rounded-full"></span>}
                                            <span>At least 6 characters</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Confirm Password */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Confirm Password *
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPasswords.confirmPassword ? "text" : "password"}
                                        name="confirmPassword"
                                        value={passwords.confirmPassword}
                                        onChange={handlePasswordChange}
                                        placeholder="Confirm your new password"
                                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => togglePasswordVisibility("confirmPassword")}
                                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                                    >
                                        {showPasswords.confirmPassword ? (
                                            <FaEyeSlash size={18} />
                                        ) : (
                                            <FaEye size={18} />
                                        )}
                                    </button>
                                </div>
                                {passwords.confirmPassword && passwords.newPassword && (
                                    <div className="mt-2 text-xs flex items-center gap-2">
                                        {passwords.newPassword === passwords.confirmPassword ? (
                                            <>
                                                <FaCheckCircle className="text-green-600" size={14} />
                                                <span className="text-green-600">Passwords match</span>
                                            </>
                                        ) : (
                                            <>
                                                <FaExclamationCircle className="text-red-600" size={14} />
                                                <span className="text-red-600">Passwords do not match</span>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => {
                                    setShowPasswordModal(false);
                                    setPasswords({
                                        newPassword: "",
                                        confirmPassword: "",
                                    });
                                    setShowPasswords({
                                        newPassword: false,
                                        confirmPassword: false,
                                    });
                                    setError(null);
                                }}
                                className="px-6 py-2 rounded-lg border-2 border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleChangePassword}
                                className="px-6 py-2 rounded-lg from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 transition-all shadow-md hover:shadow-lg font-medium"
                            >
                                Update Password
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomerProfilePage;
