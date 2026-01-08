import React, { useState, useEffect } from "react";
import { FaTimes, FaPlus } from "react-icons/fa";
import { apiClient } from "../lib/api-client";

const AddTaskModal = ({ isOpen, onClose, onSubmit, orderId }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "Medium",
    status: "Todo",
    asset: "",
    assigned_to: "Unassigned",
    start_time: "",
    end_time: "",
    remarks: "",
    attachment: null,
    // order data
    order: {
      id: "",
      title: "",
    },
    // customer data
    customer: {
      id: "",
      name: "",
    },
    // user data
    user: {
      id: "",
      name: "",
    },
    // project data
    project: {
      id: "",
      name: "",
    },
  });

  // order detail state
  const [orderDetail, setOrderDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [detailError, setDetailError] = useState(null);

  // assets state
  const [assets, setAssets] = useState([]);
  const [loadingAssets, setLoadingAssets] = useState(false);

  // users state
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // submit state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);

  useEffect(() => {
    let mounted = true;
    
    // Fetch order details
    const fetchDetail = async () => {
      if (!orderId) {
        setOrderDetail(null);
        return;
      }
      setLoadingDetail(true);
      setDetailError(null);
      try {
        const data = await apiClient.getOrderById(orderId);
        const fetched = data?.order ?? data;
        console.log("getOrderById ->", fetched);

        if (mounted) {
          setOrderDetail(fetched);

          // populate formData with order data
          setFormData((prev) => ({
            ...prev,
            order: {
              id: fetched._id || "",
              title: fetched.title || "",
            },
            customer: {
              id: fetched.customer?.id || fetched.customer?._id || "",
              name: fetched.customer?.name || "",
            },
            user: {
              id: fetched.user?.id || "",
              name: fetched.user?.name || "",
            },
            project: {
              id: fetched.project?.id || "",
              name: fetched.project?.name || "",
            },
          }));

          // Fetch assets for this project
          const projectId = fetched.project?.id || fetched.project?._id;
          if (projectId) {
            fetchAssets(projectId);
          }
        }
      } catch (err) {
        console.error("AddTaskModal: failed to fetch order detail", err);
        if (mounted) setDetailError("Failed to load order details");
      } finally {
        if (mounted) setLoadingDetail(false);
      }
    };

    // Fetch assets for the project
    const fetchAssets = async (projectId) => {
      if (!projectId) {
        setAssets([]);
        return;
      }
      setLoadingAssets(true);
      try {
        // Try to fetch assets by project ID first
        let assetsList = [];
        try {
          const data = await apiClient.getAssetsByProjectId(projectId);
          assetsList = data?.assets || data || [];
        } catch (err) {
          console.warn("Failed to fetch assets by project ID, falling back to all assets", err);
          // Fallback: fetch all assets and filter by project
          const allData = await apiClient.getAssets();
          const allAssets = allData?.assets || allData || [];
          assetsList = allAssets.filter((asset) => {
            return (
              asset.project_id === projectId ||
              asset.project?._id === projectId ||
              asset.project?.id === projectId ||
              asset.projectId === projectId
            );
          });
        }
        
        if (mounted) {
          setAssets(assetsList);
          console.log("Fetched assets for project:", projectId, assetsList);
        }
      } catch (err) {
        console.error("AddTaskModal: failed to fetch assets", err);
        setAssets([]);
      } finally {
        if (mounted) setLoadingAssets(false);
      }
    };

    // Fetch all users
    const fetchUsers = async () => {
      setLoadingUsers(true);
      try {
        const data = await apiClient.getUsers();
        console.log("Raw getUsers response:", data);
        
        let usersList = [];
        
        // Try different response formats
        if (Array.isArray(data)) {
          usersList = data;
          console.log("Response is direct array");
        } else if (data && typeof data === 'object') {
          // Try common nested structures
          if (Array.isArray(data.users)) {
            usersList = data.users;
            console.log("Response has users property");
          } else if (Array.isArray(data.data)) {
            usersList = data.data;
            console.log("Response has data property");
          } else if (Array.isArray(data.results)) {
            usersList = data.results;
            console.log("Response has results property");
          } else if (data.data && Array.isArray(data.data.users)) {
            usersList = data.data.users;
            console.log("Response has data.users property");
          } else {
            // Last resort: find first array in the object
            const firstArray = Object.values(data).find(val => Array.isArray(val));
            if (firstArray) {
              usersList = firstArray;
              console.log("Found array in response values");
            }
          }
        }
        
        console.log("Final users list:", usersList);
        
        if (mounted) {
          setUsers(usersList || []);
        }
      } catch (err) {
        console.error("AddTaskModal: failed to fetch users", err);
        if (mounted) {
          setUsers([]);
        }
      } finally {
        if (mounted) setLoadingUsers(false);
      }
    };

    fetchDetail();
    fetchUsers();
    
    return () => {
      mounted = false;
    };
  }, [orderId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((s) => ({ ...s, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e && e.preventDefault();
    
    // Validate required fields
    if (!formData.title || !formData.asset) {
      setSubmitError("Please fill in all required fields (Task Title and Asset)");
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Find the selected user from the users list
      const selectedUser = users.find((user) => {
        const userName = user.name || user.fullName || user.full_name || user.email || "";
        return userName === formData.assigned_to;
      });

      // Build task payload matching the structure from add-assets-with-tasks.jsx
      const taskPayload = {
        title: formData.title,
        description: formData.description,
        priority: formData.priority || "Medium",
        status: formData.status || "Todo",

        order: {
          id: formData.order.id,
          title: formData.order.title,
        },

        customer: {
          id: formData.customer.id,
          name: formData.customer.name,
        },

        user: {
          id: selectedUser?._id || selectedUser?.id || "",
          name: formData.assigned_to,
        },

        project: {
          id: formData.project.id,
          name: formData.project.name,
        },

        asset: {
          id: formData.asset,
          name: assets.find((a) => (a._id || a.id) === formData.asset)?.title || "",
        },

        start_time: formData.start_time
          ? new Date(formData.start_time).toISOString()
          : null,
        end_time: formData.end_time
          ? new Date(formData.end_time).toISOString()
          : null,

        remarks: formData.remarks || "",
        attachment_name: formData.attachment ? formData.attachment.name : "",
      };

      console.log("Task Payload:", taskPayload);

      // If files are selected, use FormData for multipart upload
      if (selectedFiles.length > 0) {
        const fd = new FormData();

        // Append nested fields properly for multer parsing
        fd.append('customer[id]', taskPayload.customer.id);
        fd.append('customer[name]', taskPayload.customer.name);
        fd.append('project[id]', taskPayload.project.id);
        fd.append('project[name]', taskPayload.project.name);
        fd.append('order[id]', taskPayload.order.id);
        fd.append('order[title]', taskPayload.order.title);
        fd.append('asset[id]', taskPayload.asset.id);
        fd.append('asset[name]', taskPayload.asset.name);
        fd.append('user[id]', taskPayload.user.id);
        fd.append('user[name]', taskPayload.user.name);

        fd.append('title', taskPayload.title);
        fd.append('description', taskPayload.description || '');
        fd.append('priority', taskPayload.priority || 'Medium');
        fd.append('status', taskPayload.status || 'Todo');
        fd.append('start_time', taskPayload.start_time || '');
        fd.append('end_time', taskPayload.end_time || '');
        fd.append('remarks', taskPayload.remarks || '');

        selectedFiles.forEach((file) => fd.append('files', file));

        const result = await apiClient.createTask(fd);
        console.log("Task created with files successfully:", result);
      } else {
        // No files, use regular JSON API
        const result = await apiClient.createTask(taskPayload);
        console.log("Task created successfully:", result);
      }

      // Call the callback if provided
      if (onSubmit) {
        onSubmit(taskPayload);
      }

      // Reset form
      setFormData({
        title: "",
        description: "",
        priority: "Medium",
        status: "Todo",
        asset: "",
        assigned_to: "Unassigned",
        start_time: "",
        end_time: "",
        remarks: "",
        attachment: null,
        order: {
          id: formData.order.id,
          title: formData.order.title,
        },
        customer: {
          id: formData.customer.id,
          name: formData.customer.name,
        },
        user: {
          id: "",
          name: "",
        },
        project: {
          id: formData.project.id,
          name: formData.project.name,
        },
      });
      setSelectedFiles([]);

      onClose();
    } catch (error) {
      console.error("Failed to create task:", error);
      setSubmitError(error.message || "Failed to create task. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Add New Task</h2>
            {loadingDetail ? (
              <div className="text-sm text-gray-500">Loading order...</div>
            ) : detailError ? (
              <div className="text-sm text-red-500">{detailError}</div>
            ) : orderDetail ? (
              <div className="text-sm text-gray-600">
                Order:{" "}
                <span className="font-medium">
                  {orderDetail.order_number || orderDetail._id}
                </span>
                {orderDetail.title ? ` — ${orderDetail.title}` : ""}
              </div>
            ) : orderId ? (
              <div className="text-sm text-gray-600">
                Order ID:{" "}
                <span className="font-medium">{orderId}</span>
              </div>
            ) : null}
          </div>

          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <FaTimes size={20} />
          </button>
        </div>

        {/* FORM - SCROLLABLE */}
        <div className="flex-1 overflow-y-auto p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* ERROR MESSAGE */}
            {submitError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
                {submitError}
              </div>
            )}

            {/* ASSET SELECTION - TOP PRIORITY */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Select Asset <span className="text-red-500">*</span>
              </label>
              <select
                name="asset"
                required
                value={formData.asset}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">Choose Asset</option>
                {loadingAssets ? (
                  <option disabled>Loading assets...</option>
                ) : assets.length > 0 ? (
                  assets.map((asset) => (
                    <option key={asset._id || asset.id} value={asset._id || asset.id}>
                      {asset.title}
                    </option>
                  ))
                ) : (
                  <option disabled>No assets available</option>
                )}
              </select>
            </div>

            {/* TASK TITLE */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Task Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Inspection"
              />
            </div>

            {/* DESCRIPTION */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="3"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Enter task details..."
              ></textarea>
            </div>

            {/* PRIORITY / STATUS GRID */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Priority
                </label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="Todo">Todo</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="On Hold">On Hold</option>
                </select>
              </div>
            </div>

            {/* ASSIGNED TO */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Assigned to
              </label>
              <select
                name="assigned_to"
                value={formData.assigned_to}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">Unassigned</option>
                {loadingUsers && <option disabled>Loading users...</option>}
                {!loadingUsers && users && users.length > 0 && users
                  .filter((user) => user.role === "supervisor" || user.role === "technician")
                  .map((user, idx) => {
                    const userId = user._id || user.id || idx;
                    const userName = user.name || user.fullName || user.full_name || user.email || "Unknown";
                    return (
                      <option key={userId} value={userName}>
                        {userName} ({user.role})
                      </option>
                    );
                  })}
                {!loadingUsers && (!users || users.length === 0) && <option disabled>No users available</option>}
              </select>
            </div>

            {/* START TIME / END TIME GRID */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Plan Start Time
                </label>
                <input
                  type="datetime-local"
                  name="start_time"
                  value={formData.start_time}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Plan End Time
                </label>
                <input
                  type="datetime-local"
                  name="end_time"
                  value={formData.end_time}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* REMARKS */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Remarks
              </label>
              <textarea
                name="remarks"
                value={formData.remarks}
                onChange={handleChange}
                rows="2"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Any additional notes..."
              ></textarea>
            </div>

            {/* ATTACHMENT */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Attachments
              </label>
              <input
                type="file"
                multiple
                name="files"
                accept=".pdf,.doc,.docx,.csv"
                onChange={(e) => {
                  const files = Array.from(e.target.files);
                  console.log("Selected files for task:", files);
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
          </form>
        </div>

        {/* ACTION BUTTONS - FIXED AT BOTTOM */}
        <div className="flex justify-end gap-3 p-8 border-t border-gray-200 bg-white">
          <button
            type="button"
            className="px-6 py-2 bg-gray-200 text-gray-800 font-medium rounded-lg hover:bg-gray-300 transition disabled:opacity-50"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </button>

          <button
            type="button"
            className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="animate-spin">⏳</span>
                Adding...
              </>
            ) : (
              <>
                <FaPlus size={16} />
                Add Task
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddTaskModal;
