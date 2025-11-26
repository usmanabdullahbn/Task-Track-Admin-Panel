import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiClient } from "../../lib/api-client";
import CustomerSidebar from "./customer-sidebar";

const CustomerDashboard = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Get customer ID from localStorage
  const getCustomerId = () => {
    try {
      const user = JSON.parse(localStorage.getItem("User"));
      // Extract ID from customer object
      const customerId = user?.customer?._id;
      console.log("Stored User Data:", user);
      console.log("Extracted Customer ID:", customerId);
      return customerId || null;
    } catch (e) {
      console.error("Error parsing User from localStorage:", e);
      return null;
    }
  };

  useEffect(() => {
    const fetchProjects = async () => {
      const customerId = getCustomerId();
      if (!customerId) {
        setError("Customer ID not found");
        setLoading(false);
        return;
      }

      try {
        const data = await apiClient.getProjectByCustomerId(customerId);
        setProjects(Array.isArray(data.projects) ? data.projects : data || []);
        console.log("Customer Projects:", data);
      } catch (err) {
        setError(err.message || "Failed to load projects");
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-50">
      {/* Customer Sidebar */}
      <CustomerSidebar />

      {/* Main content area */}
      <main className="flex-1 overflow-y-auto pt-20 md:pt-0">
        <div className="p-4 sm:p-6 md:p-8">
          {/* Page Header */}
          <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Dashboard
              </h1>
              <p className="mt-1 sm:mt-2 text-sm text-gray-600">
                Welcome back, Customer
              </p>
            </div>
          </div>

          {/* Loading */}
          {loading && (
            <p className="text-center text-gray-600 text-sm">Loading projects...</p>
          )}

          {/* Error */}
          {error && (
            <p className="text-center text-red-600 text-sm mb-4">{error}</p>
          )}

          {/* Projects Grid */}
          {!loading && !error && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {projects.length > 0 ? (
                projects.map((project) => (
                  <div 
                    key={project._id} 
                    onClick={() => navigate(`/project/${project._id}`)}
                    className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-lg transition-shadow p-6 cursor-pointer"
                  >
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Project Title</p>
                    
                    {/* Project Name */}
                    <h2 className="text-2xl font-bold text-gray-900 mb-3">{project.name}</h2>
                    
                    {/* Description */}
                    <p className="text-gray-700 text-sm mb-4">{project.description || "No description provided"}</p>
                    
                    {/* Status Badge */}
                    <div className="mb-4">
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                        project.status === 'completed' ? 'bg-green-100 text-green-800' :
                        project.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                        project.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {project.status || "N/A"}
                      </span>
                    </div>

                    {/* Assets & Orders Section */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="bg-blue-50 rounded-lg p-4">
                        <p className="text-xs text-gray-600 uppercase font-semibold">Assets</p>
                        <p className="text-2xl font-bold text-blue-600 mt-1">{project.assets?.length || 0}</p>
                      </div>
                      <div className="bg-purple-50 rounded-lg p-4">
                        <p className="text-xs text-gray-600 uppercase font-semibold">Orders</p>
                        <p className="text-2xl font-bold text-purple-600 mt-1">{project.orders?.length || 0}</p>
                      </div>
                    </div>

                    {/* Dates Section */}
                    <div className="border-t border-gray-200 pt-4 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Start Date:</span>
                        <span className="text-sm font-medium text-gray-900">{project.startDate ? new Date(project.startDate).toLocaleDateString() : "N/A"}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">End Date:</span>
                        <span className="text-sm font-medium text-gray-900">{project.endDate ? new Date(project.endDate).toLocaleDateString() : "N/A"}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-600 col-span-full py-8">No projects found for this customer</p>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default CustomerDashboard;
