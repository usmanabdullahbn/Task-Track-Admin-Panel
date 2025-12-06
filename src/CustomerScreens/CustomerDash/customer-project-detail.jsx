import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { apiClient } from "../../lib/api-client";
import CustomerSidebar from "./customer-sidebar";

const CustomerProjectDetail = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProjectDetails = async () => {
      try {
        setLoading(true);
        const data = await apiClient.getd(projectId);
        setProject(data.project || data);
        console.log("Project Details:", data);
      } catch (err) {
        setError(err.message || "Failed to load project details");
        console.error("Error fetching project:", err);
      } finally {
        setLoading(false);
      }
    };

    if (projectId) {
      fetchProjectDetails();
    }
  }, [projectId]);

  if (loading) {
    return (
      <div className="flex flex-col md:flex-row h-screen bg-gray-50">
        <CustomerSidebar />
        <main className="flex-1 overflow-y-auto pt-20 md:pt-0">
          <div className="p-4 sm:p-6 md:p-8">
            <p className="text-center text-gray-600">Loading project details...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col md:flex-row h-screen bg-gray-50">
        <CustomerSidebar />
        <main className="flex-1 overflow-y-auto pt-20 md:pt-0">
          <div className="p-4 sm:p-6 md:p-8">
            <p className="text-center text-red-600">{error}</p>
            <button
              onClick={() => navigate(-1)}
              className="mt-4 mx-auto block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Go Back
            </button>
          </div>
        </main>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex flex-col md:flex-row h-screen bg-gray-50">
        <CustomerSidebar />
        <main className="flex-1 overflow-y-auto pt-20 md:pt-0">
          <div className="p-4 sm:p-6 md:p-8">
            <p className="text-center text-gray-600">Project not found</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-50">
      <CustomerSidebar />

      <main className="flex-1 overflow-y-auto pt-20 md:pt-0">
        <div className="p-4 sm:p-6 md:p-8">
          {/* Header with Back Button */}
          <div className="mb-6 flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              ← Back
            </button>
            <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
          </div>

          {/* Project Details Container */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 sm:p-8">
            {/* Status Badge */}
            <div className="mb-6">
              <span className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${
                project.status === 'completed' ? 'bg-green-100 text-green-800' :
                project.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                project.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {project.status || "N/A"}
              </span>
            </div>

            {/* Description */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Description</h2>
              <p className="text-gray-700">{project.description || "No description provided"}</p>
            </div>

            {/* Key Dates */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 uppercase font-semibold mb-2">Start Date</p>
                <p className="text-lg font-medium text-gray-900">
                  {project.startDate ? new Date(project.startDate).toLocaleDateString() : "N/A"}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 uppercase font-semibold mb-2">End Date</p>
                <p className="text-lg font-medium text-gray-900">
                  {project.endDate ? new Date(project.endDate).toLocaleDateString() : "N/A"}
                </p>
              </div>
            </div>

            {/* Assets */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Assets ({project.assets?.length || 0})</h3>
              {project.assets && project.assets.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {project.assets.map((asset) => (
                    <div key={asset._id} className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                      <p className="font-medium text-gray-900">{asset.name || "Unnamed Asset"}</p>
                      <p className="text-sm text-gray-600 mt-1">{asset.description || "No description"}</p>
                      {asset.type && <p className="text-xs text-gray-500 mt-2">Type: {asset.type}</p>}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">No assets available</p>
              )}
            </div>

            {/* Orders */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Orders ({project.orders?.length || 0})</h3>
              {project.orders && project.orders.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {project.orders.map((order) => (
                    <div key={order._id} className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                      <p className="font-medium text-gray-900">{order.name || "Unnamed Order"}</p>
                      <p className="text-sm text-gray-600 mt-1">{order.description || "No description"}</p>
                      {order.status && <p className="text-xs text-gray-500 mt-2">Status: {order.status}</p>}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">No orders available</p>
              )}
            </div>

            {/* Additional Details */}
            {Object.keys(project).length > 0 && (
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {Object.entries(project).map(([key, value]) => {
                    // Skip rendering complex objects and already displayed fields
                    if (
                      key === '_id' ||
                      key === 'name' ||
                      key === 'description' ||
                      key === 'status' ||
                      key === 'startDate' ||
                      key === 'endDate' ||
                      key === 'assets' ||
                      key === 'orders' ||
                      typeof value === 'object'
                    ) {
                      return null;
                    }
                    return (
                      <div key={key} className="bg-gray-50 rounded p-3">
                        <p className="text-xs text-gray-600 uppercase font-semibold">{key}</p>
                        <p className="text-sm text-gray-900 mt-1">{String(value)}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default CustomerProjectDetail;
