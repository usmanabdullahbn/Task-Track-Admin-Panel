import React, { useState, useEffect, Fragment } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Sidebar from "../component/sidebar";
import { apiClient } from "../lib/api-client";

const AddAssetsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Get order context from navigation state
  const orderContext = location.state?.orderData || {
    id: "",
    title: "",
    customerId: "",
    customerName: "",
    projectId: "",
    projectName: "",
    // ensure nested shapes exist for safer access
    customer: { id: "", name: "" },
    project: { id: "", name: "" },
  };

  // Debugging: Log the order context data
  console.log("Order Context:", orderContext);

  // Check if project info is missing
  useEffect(() => {
    const hasProjectInfo = !!(
      orderContext.project?.id ||
      orderContext.project?._id ||
      orderContext.projectId
    );

    if (!hasProjectInfo && orderContext.customerId) {
      setProjectNotFound(true);
      setError("This customer has no projects. Please go back and create a project first.");
    }
  }, []);

  // ============= STATE =============
  const [assets, setAssets] = useState([]); // Array of assets with tasks
  const [activeAssetIdx, setActiveAssetIdx] = useState(null); // Currently active asset tab
  const [allAssets, setAllAssets] = useState([]); // Available assets for dropdown
  const [allUsers, setAllUsers] = useState([]); // Available users for assignee dropdown
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [projectNotFound, setProjectNotFound] = useState(false);

  // ============= FETCH DATA =============
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // fetch users - debug & normalize response
        try {
          const usersResp = await apiClient.getUsers();
          console.log("getUsers response:", usersResp);

          // attempt several common shapes
          let usersList = [];
          if (Array.isArray(usersResp)) usersList = usersResp;
          else if (Array.isArray(usersResp.users)) usersList = usersResp.users;
          else if (Array.isArray(usersResp.data)) usersList = usersResp.data;
          else if (Array.isArray(usersResp.data?.users))
            usersList = usersResp.data.users;
          else if (Array.isArray(usersResp.results))
            usersList = usersResp.results;
          else if (Array.isArray(usersResp.data?.results))
            usersList = usersResp.data.results;

          // final fallback: try to find nested array
          if (usersList.length === 0) {
            const maybeArray = Object.values(usersResp).find((v) =>
              Array.isArray(v)
            );
            if (Array.isArray(maybeArray)) usersList = maybeArray;
          }

          // normalize minimal fields so dropdown can render
          usersList = usersList.map((u) => ({
            _id: u._id || u.id || u._id_str || "",
            id: u.id || u._id || "",
            name: u.name || u.fullName || u.full_name || u.email || "(no-name)",
            role: u.role || u.userRole || u.user_role || "",
            raw: u,
          }));

          console.log("Normalized users:", usersList);
          setAllUsers(usersList);
        } catch (uErr) {
          console.warn("Failed to fetch users", uErr);
        }

        const customerId =
          orderContext.customer?.id ||
          orderContext.customer?._id ||
          orderContext.customerId ||
          "";
        const projectId =
          orderContext.project?.id ||
          orderContext.project?._id ||
          orderContext.projectId ||
          "";

        console.log(
          "Fetching assets for customerId:",
          customerId,
          "projectId:",
          projectId
        );

        let assetsResponse;

        // Prefer fetching assets by customer id (requested change)
        if (customerId) {
          try {
            assetsResponse = await apiClient.getAssetsByCustomerId(customerId);
          } catch (err) {
            console.warn(
              "apiClient.getAssetsByCustomerId failed, falling back to filtering all assets",
              err
            );
            const all = await apiClient.getAssets();
            const list = Array.isArray(all) ? all : all.assets || [];
            assetsResponse = list.filter((a) => {
              return (
                a.customer_id === customerId ||
                a.customer?._id === customerId ||
                a.customer?.id === customerId
              );
            });
          }
        } else if (projectId) {
          // fallback to project-based fetch if no customer id available
          try {
            assetsResponse = await apiClient.getAssetsByProjectId(projectId);
          } catch (err) {
            console.warn(
              "apiClient.getAssetsByProjectId failed, falling back to filtering all assets",
              err
            );
            const all = await apiClient.getAssets();
            const list = Array.isArray(all) ? all : all.assets || [];
            assetsResponse = list.filter((a) => {
              return (
                a.project_id === projectId ||
                a.project?._id === projectId ||
                a.project?.id === projectId ||
                a.projectId === projectId
              );
            });
          }
        } else {
          assetsResponse = await apiClient.getAssets();
        }

        const assetsList = Array.isArray(assetsResponse)
          ? assetsResponse
          : assetsResponse.assets || [];
        console.log("Assets fetched:", assetsList.length);

        // Filter assets to only show those with the same project as the order
        const filteredAssets = assetsList.filter((asset) => {
          return (
            asset.project_id === projectId ||
            asset.project?._id === projectId ||
            asset.project?.id === projectId ||
            asset.projectId === projectId
          );
        });
        console.log("Filtered assets:", filteredAssets.length);
        setAllAssets(filteredAssets);
      } catch (err) {
        console.error("Failed to fetch assets:", err);
        setError("Failed to load assets");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // refetch when customer id (preferred) or project id changes
  }, [
    orderContext.customer?.id,
    orderContext.customerId,
    orderContext.project?.id,
    orderContext.projectId,
  ]);

  // ============= ASSET & TASK HANDLERS =============
  const addAsset = () => {
    const newAsset = {
      id: `asset-${Date.now()}`,
      assetId: "",
      assetTitle: "",
      tasks: [],
    };

    setAssets([...assets, newAsset]);
    setActiveAssetIdx(assets.length);
    setError("");
  };

  const removeAsset = (idx) => {
    if (assets.length === 1) {
      setError("Minimum one asset is required");
      return;
    }

    const updatedAssets = assets.filter((_, i) => i !== idx);
    setAssets(updatedAssets);

    if (activeAssetIdx === idx) {
      setActiveAssetIdx(updatedAssets.length > 0 ? 0 : null);
    } else if (activeAssetIdx > idx) {
      setActiveAssetIdx(activeAssetIdx - 1);
    }
  };

  const updateAsset = (idx, field, value) => {
    const updated = [...assets];
    if (field === "assetId") {
      const selectedAsset = allAssets.find((a) => a._id === value);
      updated[idx].assetId = value;
      updated[idx].assetTitle = selectedAsset?.title || "";
    } else {
      updated[idx][field] = value;
    }
    setAssets(updated);
  };

  const addTask = (assetIdx) => {
    const newTask = {
      id: `task-${Date.now()}`,
      title: "",
      description: "",
      priority: "Medium",
      status: "Pending",
      // new fields
      assignedTo: "",
      startTime: "",
      endTime: "",
      remarks: "",
      attachment: null,
    };

    const updated = [...assets];
    updated[assetIdx].tasks.push(newTask);
    setAssets(updated);
  };

  const removeTask = (assetIdx, taskIdx) => {
    const updated = [...assets];
    updated[assetIdx].tasks = updated[assetIdx].tasks.filter(
      (_, i) => i !== taskIdx
    );
    setAssets(updated);
  };

  const updateTask = (assetIdx, taskIdx, field, value) => {
    const updated = [...assets];
    updated[assetIdx].tasks[taskIdx][field] = value;
    setAssets(updated);
  };

  // ============= VALIDATION & SUBMIT =============
  const validateForm = () => {
    if (assets.length === 0) {
      setError("Please add at least one asset");
      return false;
    }

    for (let i = 0; i < assets.length; i++) {
      if (!assets[i].assetId) {
        setError(`Asset ${i + 1}: Please select an asset`);
        return false;
      }

      if (assets[i].tasks.length === 0) {
        setError(
          `Asset ${i + 1} (${assets[i].assetTitle
          }): Please add at least one task`
        );
        return false;
      }

      for (let j = 0; j < assets[i].tasks.length; j++) {
        if (!assets[i].tasks[j].title) {
          setError(`Asset ${i + 1}, Task ${j + 1}: Task title is required`);
          return false;
        }
      }
    }

    return true;
  };

  const handleFinalSubmit = async () => {
    if (!validateForm()) {
      window.scrollTo(0, 0);
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      // try to get current user info if apiClient provides it (optional)
      let currentUser = {};
      try {
        if (typeof apiClient.getCurrentUser === "function") {
          const u = await apiClient.getCurrentUser();
          currentUser = u || {};
        }
      } catch (e) {
        // ignore - use empty user
        console.warn("getCurrentUser failed", e);
      }

      // helper to compute plan_duration in minutes (string) if start/end provided
      const computePlanDuration = (start, end) => {
        if (!start || !end) return "";
        try {
          const s = new Date(start);
          const e = new Date(end);
          const diffMin = Math.max(0, Math.round((e - s) / 60000));
          return String(diffMin); // backend expects string in your example
        } catch {
          return "";
        }
      };

      // For each asset: create asset only if user didn't choose an existing one.
      // For tasks: create them concurrently per asset using Promise.all to allow multiple tasks at once.
      for (let i = 0; i < assets.length; i++) {
        const asset = assets[i];

        // Determine whether to use existing selected asset or create a new one
        let assetId = asset.assetId || "";
        let assetName = asset.assetTitle || "";

        if (!assetId) {
          // create new asset on backend
          const assetPayload = {
            order_id: orderContext.id,
            customer_id: orderContext.customer?.id || orderContext.customerId,
            customer_name:
              orderContext.customer?.name || orderContext.customerName,
            project_id: orderContext.project?.id || orderContext.projectId,
            project_name:
              orderContext.project?.name || orderContext.projectName,
            title: asset.assetTitle,
            description: "",
            model: "",
            manufacturer: "",
            serial_number: "",
            category: "",
            barcode: "",
            area: "",
          };

          const createdAsset = await apiClient.createAsset(assetPayload);
          assetId = createdAsset?._id || createdAsset?.id || assetId;
          assetName = createdAsset?.title || assetName;
        } else {
          // if user selected existing asset, keep its name if available from allAssets
          const existing = allAssets.find(
            (a) => a._id === assetId || a.id === assetId
          );
          assetName = existing?.title || assetName;
        }

        // create tasks for this asset concurrently
        const taskPromises = asset.tasks.map((task) => {
          const plan_duration = computePlanDuration(
            task.startTime,
            task.endTime
          );

          // find assigned user details from allUsers
          const assignedUser = allUsers.find(
            (u) => (u._id || u.id) === task.assignedTo
          );

          const taskPayload = {
            title: task.title,
            description: task.description,
            priority: task.priority || "Medium",
            status: task.status || "Todo",
            plan_duration: plan_duration,

            order: {
              id: orderContext.id,
              title: orderContext.title,
            },

            customer: {
              id: orderContext.customer?.id || orderContext.customerId,
              name: orderContext.customer?.name || orderContext.customerName,
            },

            user: {
              id:
                assignedUser?._id || assignedUser?.id || task.assignedTo || "",
              name: assignedUser?.name || assignedUser?.fullName || "",
            },

            project: {
              id: orderContext.project?.id || orderContext.projectId,
              name: orderContext.project?.name || orderContext.projectName,
            },

            // FIXED HERE 👇
            asset: {
              id: assetId,
              name: assetName,
            },

            start_time: task.startTime
              ? new Date(task.startTime).toISOString()
              : null,
            end_time: task.endTime
              ? new Date(task.endTime).toISOString()
              : null,

            remarks: task.remarks || "",
          };

          console.log(taskPayload);

          if (task.attachment) {
            const fd = new FormData();
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
            fd.append('plan_duration', String(taskPayload.plan_duration || 0));
            fd.append('start_time', taskPayload.start_time || '');
            fd.append('end_time', taskPayload.end_time || '');
            fd.append('remarks', taskPayload.remarks || '');
            fd.append('files', task.attachment);
            return apiClient.createTask(fd);
          } else {
            return apiClient.createTask(taskPayload);
          }
        });

        // wait for all tasks of this asset to be created
        await Promise.all(taskPromises);
      }

      setShowSuccessModal(true);
    } catch (err) {
      console.error("Submission error:", err);
      let errorMessage = "Failed to create assets";
      if (err.response && err.response.data) {
        const data = err.response.data;
        if (typeof data === 'string') {
          errorMessage = data;
        } else if (data.message) {
          errorMessage = data.message;
        } else if (data.error) {
          errorMessage = data.error;
        } else if (data.detail) {
          errorMessage = data.detail;
        } else if (data.errors) {
          if (Array.isArray(data.errors)) {
            errorMessage = data.errors.map(e => e.message || e.msg || e).join(', ');
          } else if (typeof data.errors === 'string') {
            errorMessage = data.errors;
          } else {
            errorMessage = JSON.stringify(data.errors);
          }
        } else if (data.msg) {
          errorMessage = data.msg;
        } else {
          // Fallback to stringify the data
          errorMessage = typeof data === 'object' ? JSON.stringify(data) : String(data);
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      setError(errorMessage);
      window.scrollTo(0, 0);
    } finally {
      setSubmitting(false);
    }
  };

  const closeModal = () => {
    setShowSuccessModal(false);
    navigate("/orders");
  };

  // ============= RENDER =============
  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <main className="p-8">Loading...</main>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-50">
      <Sidebar />

      <main className="flex-1 overflow-y-auto pt-16 md:pt-0">
        <div className="p-4 sm:p-6 md:p-8 max-w-6xl mx-auto">
          {/* HEADER */}
          <div className="mb-6 flex items-center gap-4">
            <Link to="/orders" className="text-green-700 hover:text-green-900">
              ← Back
            </Link>
            <h1 className="text-2xl sm:text-3xl font-bold">
              Add Assets & Tasks
            </h1>
          </div>

          {/* ORDER CONTEXT CARD */}
          {(orderContext.id ||
            orderContext.customer?.id ||
            orderContext.customerId) && (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h2 className="font-semibold text-blue-900 mb-2">
                  Order Context
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-blue-700">Order ID</p>
                    <p className="font-medium text-gray-900">{orderContext.id}</p>
                  </div>
                  <div>
                    <p className="text-blue-700">Order Title</p>
                    <p className="font-medium text-gray-900">
                      {orderContext.title}
                    </p>
                  </div>
                  <div>
                    <p className="text-blue-700">Customer</p>
                    <p className="font-medium text-gray-900">
                      {/* show customer title/name */}
                      {orderContext.customer?.name ||
                        orderContext.customer?.title ||
                        orderContext.customerName}
                    </p>
                  </div>
                  <div>
                    <p className="text-blue-700">Project</p>
                    <p className="font-medium text-gray-900">
                      {/* show project title/name */}
                      {orderContext.project?.name ||
                        orderContext.project?.title ||
                        orderContext.projectName}
                    </p>
                  </div>
                </div>
              </div>
            )}

          {error && (
            <div className="mb-6 p-4 bg-red-100 border border-red-300 text-red-700 rounded-lg flex items-center justify-between">
              <span>{error}</span>
              {projectNotFound && (
                <button
                  onClick={() => navigate("/projects/new", { state: { customerId: orderContext.customerId || orderContext.customer?.id, customerName: orderContext.customerName || orderContext.customer?.name } })}
                  className="bg-red-700 hover:bg-red-800 text-white font-semibold py-2 px-4 rounded-lg transition-colors ml-4 whitespace-nowrap"
                >
                  + Add Project
                </button>
              )}
            </div>
          )}

          {/* ASSETS & TASKS SECTION */}
          <div className="mb-8 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                Assets & Tasks
              </h2>
              <button
                onClick={addAsset}
                className="bg-green-700 text-white px-4 py-2 rounded-lg hover:bg-green-800 transition-colors font-medium"
              >
                + Add Asset
              </button>
            </div>

            {assets.length === 0 ? (
              <div className="p-8 text-center bg-gray-50 rounded-lg border border-dashed border-gray-300">
                <p className="text-gray-500 mb-3">No assets added yet</p>
                <p className="text-sm text-gray-400">
                  Click "Add Asset" button to get started. Each asset can have
                  multiple tasks.
                </p>
              </div>
            ) : (
              <Fragment>
                {/* ASSET TABS */}
                <div className="flex gap-2 mb-6 overflow-x-auto pb-2 border-b border-gray-200">
                  {assets.map((asset, idx) => (
                    <button
                      key={asset.id}
                      onClick={() => setActiveAssetIdx(idx)}
                      className={`px-4 py-2.5 rounded-t-lg font-medium whitespace-nowrap transition-colors ${activeAssetIdx === idx
                          ? "bg-green-700 text-white"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        }`}
                    >
                      Asset {idx + 1}
                      {asset.assetTitle && ` - ${asset.assetTitle}`}
                    </button>
                  ))}
                </div>

                {/* ACTIVE ASSET CONTENT */}
                {activeAssetIdx !== null && (
                  <div className="p-6 border border-gray-200 rounded-lg bg-gray-50">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-semibold text-gray-800">
                        Asset {activeAssetIdx + 1}
                      </h3>
                      {assets.length > 1 && (
                        <button
                          onClick={() => removeAsset(activeAssetIdx)}
                          className="text-red-600 hover:text-red-800 font-medium text-sm"
                        >
                          Remove Asset
                        </button>
                      )}
                    </div>

                    {/* ASSET SELECTION */}
                    <div className="mb-6 p-4 bg-white rounded-lg border border-gray-200">
                      <label className="text-sm font-medium text-gray-700 block mb-2">
                        Select Asset <span className="text-red-600">*</span>
                      </label>
                      <select
                        value={assets[activeAssetIdx].assetId}
                        onChange={(e) =>
                          updateAsset(activeAssetIdx, "assetId", e.target.value)
                        }
                        className="w-full border-2 border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                      >
                        <option value="">Select an asset</option>
                        {allAssets.map((asset) => (
                          <option key={asset._id} value={asset._id}>
                            {asset.title} ({asset.category})
                          </option>
                        ))}
                      </select>
                      {assets[activeAssetIdx].assetTitle && (
                        <p className="mt-2 text-sm text-green-600">
                          ✓ {assets[activeAssetIdx].assetTitle}
                        </p>
                      )}
                    </div>

                    {/* TASKS */}
                    <div className="mb-6">
                      <h4 className="text-base font-semibold text-gray-800 mb-4">
                        Tasks for this Asset
                      </h4>

                      {assets[activeAssetIdx].tasks.length === 0 ? (
                        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-700 text-sm mb-4">
                          No tasks added yet. Click "Add Task" to create one.
                        </div>
                      ) : (
                        <div className="space-y-4 mb-4">
                          {assets[activeAssetIdx].tasks.map((task, taskIdx) => (
                            <div
                              key={task.id}
                              className="p-4 bg-white border border-gray-200 rounded-lg"
                            >
                              <div className="flex items-center justify-between mb-3">
                                <h5 className="font-medium text-gray-800">
                                  Task {taskIdx + 1}
                                </h5>
                                <button
                                  onClick={() =>
                                    removeTask(activeAssetIdx, taskIdx)
                                  }
                                  className="text-red-600 hover:text-red-800 font-medium text-sm"
                                >
                                  Remove
                                </button>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {/* Task Title */}
                                <div className="sm:col-span-2">
                                  <label className="text-xs font-medium text-gray-600 block mb-1">
                                    Task Title{" "}
                                    <span className="text-red-600">*</span>
                                  </label>
                                  <input
                                    type="text"
                                    value={task.title}
                                    onChange={(e) =>
                                      updateTask(
                                        activeAssetIdx,
                                        taskIdx,
                                        "title",
                                        e.target.value
                                      )
                                    }
                                    placeholder="e.g., Inspection"
                                    className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm text-gray-900 placeholder-gray-400 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                                  />
                                </div>

                                {/* Task Description */}
                                <div className="sm:col-span-2">
                                  <label className="text-xs font-medium text-gray-600 block mb-1">
                                    Description
                                  </label>
                                  <textarea
                                    value={task.description}
                                    onChange={(e) =>
                                      updateTask(
                                        activeAssetIdx,
                                        taskIdx,
                                        "description",
                                        e.target.value
                                      )
                                    }
                                    placeholder="Enter task details..."
                                    rows="2"
                                    className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm text-gray-900 placeholder-gray-400 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 resize-none"
                                  />
                                </div>

                                {/* Priority */}
                                <div>
                                  <label className="text-xs font-medium text-gray-600 block mb-1">
                                    Priority
                                  </label>
                                  <select
                                    value={task.priority}
                                    onChange={(e) =>
                                      updateTask(
                                        activeAssetIdx,
                                        taskIdx,
                                        "priority",
                                        e.target.value
                                      )
                                    }
                                    className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm text-gray-900 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                                  >
                                    <option value="Low">Low</option>
                                    <option value="Medium">Medium</option>
                                    <option value="High">High</option>
                                  </select>
                                </div>

                                {/* Status */}
                                <div>
                                  <label className="text-xs font-medium text-gray-600 block mb-1">
                                    Status
                                  </label>
                                  <select
                                    value={task.status}
                                    onChange={(e) =>
                                      updateTask(
                                        activeAssetIdx,
                                        taskIdx,
                                        "status",
                                        e.target.value
                                      )
                                    }
                                    className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm text-gray-900 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                                  >
                                    <option value="Todo">Todo</option>
                                    <option value="In Progress">
                                      In Progress
                                    </option>
                                    <option value="Completed">Completed</option>
                                  </select>
                                </div>

                                {/* Assigned To */}
                                <div>
                                  <label className="text-xs font-medium text-gray-600 block mb-1">
                                    Assigned to
                                  </label>
                                  <select
                                    value={task.assignedTo || ""}
                                    onChange={(e) =>
                                      updateTask(
                                        activeAssetIdx,
                                        taskIdx,
                                        "assignedTo",
                                        e.target.value
                                      )
                                    }
                                    className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm text-gray-900 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                                  >
                                    <option value="">Unassigned</option>
                                    {allUsers
                                      .filter((u) => u.role === "supervisor" || u.role === "technician")
                                      .map((u) => (
                                        <option
                                          key={u._id || u.id}
                                          value={u._id || u.id}
                                        >
                                          {u.name || u.fullName || u.email} ({u.role})
                                        </option>
                                      ))}
                                  </select>
                                </div>

                                {/* Start Time */}
                                <div>
                                  <label className="text-xs font-medium text-gray-600 block mb-1">
                                    Start time
                                  </label>
                                  <input
                                    type="datetime-local"
                                    value={task.startTime || ""}
                                    onChange={(e) =>
                                      updateTask(
                                        activeAssetIdx,
                                        taskIdx,
                                        "startTime",
                                        e.target.value
                                      )
                                    }
                                    className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm text-gray-900 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                                  />
                                </div>

                                {/* End Time */}
                                <div>
                                  <label className="text-xs font-medium text-gray-600 block mb-1">
                                    End time
                                  </label>
                                  <input
                                    type="datetime-local"
                                    value={task.endTime || ""}
                                    onChange={(e) =>
                                      updateTask(
                                        activeAssetIdx,
                                        taskIdx,
                                        "endTime",
                                        e.target.value
                                      )
                                    }
                                    className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm text-gray-900 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                                  />
                                </div>

                                {/* Remarks */}
                                <div className="sm:col-span-2">
                                  <label className="text-xs font-medium text-gray-600 block mb-1">
                                    Remarks
                                  </label>
                                  <textarea
                                    value={task.remarks || ""}
                                    onChange={(e) =>
                                      updateTask(
                                        activeAssetIdx,
                                        taskIdx,
                                        "remarks",
                                        e.target.value
                                      )
                                    }
                                    placeholder="Any additional notes..."
                                    rows="2"
                                    className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm text-gray-900 placeholder-gray-400 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 resize-none"
                                  />
                                </div>

                                {/* Attachment */}
                                <div className="sm:col-span-2">
                                  <label className="text-xs font-medium text-gray-600 block mb-1">
                                    Attachment
                                  </label>
                                  <input
                                    type="file"
                                    onChange={(e) =>
                                      updateTask(
                                        activeAssetIdx,
                                        taskIdx,
                                        "attachment",
                                        e.target.files[0] || null
                                      )
                                    }
                                    className="w-full border-2 border-gray-300 rounded-lg px-4 py-2.5 bg-white
               text-gray-900 file:bg-green-700 file:text-white 
               file:border-none file:px-4 file:py-2 file:mr-4 
               file:rounded-md file:cursor-pointer
               hover:file:bg-green-800 transition cursor-pointer"
                                  />
                                  <p className="text-xs text-gray-500 mt-1">
                                    Select a file for this task.
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* ADD TASK BUTTON */}
                      <button
                        onClick={() => addTask(activeAssetIdx)}
                        className="w-full border-2 border-dashed border-green-600 text-green-700 px-4 py-2.5 rounded-lg hover:bg-green-50 font-medium transition-colors"
                      >
                        + Add Task
                      </button>
                    </div>
                  </div>
                )}
              </Fragment>
            )}
          </div>

          {/* SUMMARY */}
          {assets.length > 0 && (
            <div className="mb-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-3">
                Assets Summary
              </h3>
              <div className="text-sm">
                <p className="text-blue-700">
                  {assets.length} asset{assets.length !== 1 ? "s" : ""} with{" "}
                  {assets.reduce((sum, a) => sum + a.tasks.length, 0)} total
                  tasks
                </p>
              </div>
            </div>
          )}

          {/* ACTION BUTTONS */}
          <div className="flex gap-4 mb-8">
            <button
              onClick={handleFinalSubmit}
              disabled={submitting || assets.length === 0}
              className="bg-green-700 text-white px-8 py-3 rounded-lg hover:bg-green-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
            >
              {submitting ? "Creating Assets..." : "Create Assets & Tasks"}
            </button>

            <Link
              to="/orders"
              className="border-2 border-gray-300 text-gray-700 px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors font-semibold inline-flex items-center justify-center"
            >
              Cancel
            </Link>
          </div>
        </div>
      </main>

      {/* SUCCESS MODAL */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-sm">
            <h2 className="text-lg font-semibold text-green-600 mb-3">
              ✓ Success!
            </h2>
            <p className="text-gray-700 mb-6">
              {assets.length} asset{assets.length !== 1 ? "s" : ""} with{" "}
              {assets.reduce((sum, a) => sum + a.tasks.length, 0)} task
              {assets.reduce((sum, a) => sum + a.tasks.length, 1) !== 1
                ? "s"
                : ""}{" "}
              created successfully.
            </p>

            <button
              onClick={closeModal}
              className="w-full bg-green-700 text-white px-4 py-2 rounded-lg hover:bg-green-800 font-medium"
            >
              Go to Orders
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddAssetsPage;
