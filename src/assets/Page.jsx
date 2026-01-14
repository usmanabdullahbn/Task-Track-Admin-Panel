import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../component/sidebar";
import { FaEdit, FaTrash, FaPrint, FaChevronDown, FaFilter } from "react-icons/fa";
import { apiClient, FILE_BASE_URL } from "../lib/api-client";

const AssetsPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchField, setSearchField] = useState("title");
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [assetToDelete, setAssetToDelete] = useState(null);
  const [printData, setPrintData] = useState(null);
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const [showFilesModal, setShowFilesModal] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [sortField, setSortField] = useState("title");
  const [sortOrder, setSortOrder] = useState("asc");
  const [openDropdown, setOpenDropdown] = useState(null);
  const [dropdownSearchTerm, setDropdownSearchTerm] = useState("");
  const [filters, setFilters] = useState({ title: "", customer_name: "", project_name: "", category: "", manufacturer: "", barcode: "" });
  const dropdownRef = useRef(null);

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
        // console.log("Assets API Response:", res);

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
  // FILES MODAL
  // -------------------------
  const openFilesModal = (asset) => {
    setSelectedAsset(asset);
    setShowFilesModal(true);
  };

  const closeFilesModal = () => {
    setShowFilesModal(false);
    setSelectedAsset(null);
  };

  // Dropdown and sorting handlers
  const handleHeaderClick = (field) => {
    setOpenDropdown(openDropdown === field ? null : field);
    setDropdownSearchTerm("");
  };

  const handleApplyFilter = (field) => {
    setFilters(prev => ({ ...prev, [field]: dropdownSearchTerm }));
    setOpenDropdown(null);
  };

  const handleClearFilter = (field) => {
    setFilters(prev => ({ ...prev, [field]: "" }));
    setOpenDropdown(null);
  };

  const handleSortChange = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  // Click outside handler for dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && dropdownRef.current.contains(event.target)) {
        return;
      }

      if (event.target.closest("th")) {
        return;
      }

      setOpenDropdown(null);
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // -------------------------  
  // PRINT ASSET
  // -------------------------
  const handlePrint = (asset) => {
    setPrintData(asset);
    setShowPrintPreview(true);
  };

  const closePrintPreview = () => {
    setShowPrintPreview(false);
    setPrintData(null);
  };

  const generatePrintDocument = () => {
    if (!printData) return "";

    const currentDate = new Date().toLocaleDateString();
    const currentTime = new Date().toLocaleTimeString();

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Asset Report - ${printData.title}</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f5f5f5;
          }
          .container {
            background-color: white;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            max-width: 800px;
            margin: 0 auto;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #059669;
            padding-bottom: 20px;
          }
          .header h1 {
            color: #059669;
            margin: 0;
            font-size: 28px;
          }
          .header p {
            color: #666;
            margin: 5px 0;
            font-size: 14px;
          }
          .details-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 20px;
          }
          .detail-item {
            margin-bottom: 15px;
          }
          .detail-label {
            color: #059669;
            font-weight: 600;
            font-size: 12px;
            text-transform: uppercase;
            margin-bottom: 5px;
          }
          .detail-value {
            color: #333;
            font-size: 16px;
            font-weight: 500;
          }
          .section-title {
            color: #059669;
            font-size: 16px;
            font-weight: 600;
            margin-top: 25px;
            margin-bottom: 15px;
            border-left: 3px solid #059669;
            padding-left: 10px;
          }
          .description-box {
            background-color: #f0fdf4;
            padding: 15px;
            border-radius: 6px;
            border-left: 3px solid #059669;
            color: #333;
            line-height: 1.6;
          }
          .footer {
            margin-top: 30px;
            text-align: center;
            color: #999;
            font-size: 12px;
            border-top: 1px solid #ddd;
            padding-top: 15px;
          }
          @media print {
            body {
              background-color: white;
            }
            .container {
              box-shadow: none;
              padding: 0;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${printData.title}</h1>
            <p>Asset Report</p>
            <p style="font-size: 12px; margin-top: 10px;">${currentDate} at ${currentTime}</p>
          </div>

          <div class="details-grid">
            <div>
              <div class="detail-item">
                <div class="detail-label">Asset ID</div>
                <div class="detail-value">${printData._id || printData.id || "N/A"}</div>
              </div>
              <div class="detail-item">
                <div class="detail-label">Title</div>
                <div class="detail-value">${printData.title || "N/A"}</div>
              </div>
              <div class="detail-item">
                <div class="detail-label">Category</div>
                <div class="detail-value">${printData.category || "N/A"}</div>
              </div>
              <div class="detail-item">
                <div class="detail-label">Manufacturer</div>
                <div class="detail-value">${printData.manufacturer || "N/A"}</div>
              </div>
            </div>
            <div>
              <div class="detail-item">
                <div class="detail-label">Customer</div>
                <div class="detail-value">${printData.customer?.name || printData.customer || "N/A"}</div>
              </div>
              <div class="detail-item">
                <div class="detail-label">Project</div>
                <div class="detail-value">${printData.project?.name || printData.project_name || printData.project || "N/A"}</div>
              </div>
              <div class="detail-item">
                <div class="detail-label">Barcode</div>
                <div class="detail-value">${printData.barcode || "N/A"}</div>
              </div>
              <div class="detail-item">
                <div class="detail-label">Area</div>
                <div class="detail-value">${printData.area || "N/A"}</div>
              </div>
            </div>
          </div>

          <div class="details-grid">
            <div>
              <div class="detail-item">
                <div class="detail-label">Model</div>
                <div class="detail-value">${printData.model || "N/A"}</div>
              </div>
            </div>
            <div>
              <div class="detail-item">
                <div class="detail-label">Serial Number</div>
                <div class="detail-value">${printData.serial_number || printData.serialNumber || "N/A"}</div>
              </div>
            </div>
          </div>

          ${printData.description ? `
            <div class="section-title">Description</div>
            <div class="description-box">
              ${printData.description}
            </div>
          ` : ""}

          <div class="footer">
            <p>Generated on ${currentDate} at ${currentTime}</p>
            <p>Asset Management System</p>
          </div>
        </div>
      </body>
      </html>
    `;
  };

  // -------------------------  
  // FILTER & SORT
  // -------------------------
  const filteredAssets = assets.filter((asset) => {
    for (const [field, term] of Object.entries(filters)) {
      if (!term) continue;
      const lowerTerm = term.toLowerCase();
      let value = "";
      switch (field) {
        case "title":
          value = (asset.title || "").toLowerCase();
          break;
        case "customer_name":
          const customerVal = asset.customer?.name || asset.customer;
          value = (typeof customerVal === 'string' ? customerVal : customerVal?.toString() || "").toLowerCase();
          break;
        case "project_name":
          const projectVal = asset.project?.title || asset.project?.name || asset.project;
          value = (typeof projectVal === 'string' ? projectVal : projectVal?.toString() || "").toLowerCase();
          break;
        case "category":
          value = (asset.category || "").toLowerCase();
          break;
        case "manufacturer":
          value = (asset.manufacturer || "").toLowerCase();
          break;
        case "barcode":
          value = (asset.barcode || "").toLowerCase();
          break;
        default:
          continue;
      }
      if (!value.includes(lowerTerm)) return false;
    }
    return true;
  });

  // Sort Logic
  const sortedAssets = [...filteredAssets].sort((a, b) => {
    let aValue = "";
    let bValue = "";

    switch (sortField) {
      case "customer_name":
        aValue = a.customer?.name || a.customer || "";
        bValue = b.customer?.name || b.customer || "";
        break;
      case "project_name":
        aValue = a.project?.name || a.project_name || a.project || "";
        bValue = b.project?.name || b.project_name || b.project || "";
        break;
      default:
        aValue = a[sortField] || "";
        bValue = b[sortField] || "";
    }

    aValue = aValue.toString().toLowerCase();
    bValue = bValue.toString().toLowerCase();

    if (sortOrder === "asc") {
      return aValue.localeCompare(bValue);
    } else {
      return bValue.localeCompare(aValue);
    }
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

          {/* Table */}
          <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
            {loading ? (
              <p className="text-center text-gray-500 py-6">Loading assets...</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px] text-sm sm:text-base">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className={`px-4 py-3 text-left font-medium cursor-pointer hover:bg-gray-100 transition-colors relative ${filters.title ? "bg-blue-100" : ""}`} onClick={() => handleHeaderClick("title")}>
                        <div className="flex items-center gap-2">
                          Title
                          {filters.title && <FaFilter size={12} className="text-blue-600" />}
                          <FaChevronDown size={12} className={`transition-transform ${openDropdown === "title" ? "rotate-180" : ""}`} />
                        </div>
                        {openDropdown === "title" && (
                          <div ref={dropdownRef} onClick={(e) => e.stopPropagation()} className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-3 z-[9999]" style={{ minWidth: "200px" }}>
                            <div className="space-y-2">
                              <input
                                type="text"
                                placeholder="Search..."
                                value={dropdownSearchTerm}
                                onChange={(e) => setDropdownSearchTerm(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter') handleApplyFilter("title"); }}
                                className="w-full rounded-lg border border-gray-300 px-2 py-1 text-xs focus:border-green-700 focus:outline-none focus:ring-1 focus:ring-green-700"
                              />
                              <div className="flex gap-2">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSortChange("title");
                                  }}
                                  className={`flex-1 px-2 py-1 rounded text-xs font-medium transition-colors ${sortField === "title" ? "bg-green-700 text-white" : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                                    }`}
                                >
                                  Sort
                                </button>
                                {sortField === "title" && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                                    }}
                                    className="px-2 py-1 rounded text-xs font-medium bg-blue-700 text-white hover:bg-blue-800"
                                  >
                                    {sortOrder === "asc" ? "↑" : "↓"}
                                  </button>
                                )}
                              </div>
                              <button
                                onClick={() => handleApplyFilter("title")}
                                className="w-full px-2 py-1 rounded bg-green-700 text-white hover:bg-green-800 transition-colors text-xs font-medium"
                              >
                                Apply
                              </button>
                            </div>
                          </div>
                        )}
                      </th>
                      <th className={`px-4 py-3 text-left font-medium cursor-pointer hover:bg-gray-100 transition-colors relative ${filters.customer_name ? "bg-blue-100" : ""}`} onClick={() => handleHeaderClick("customer_name")}>
                        <div className="flex items-center gap-2">
                          Customer
                          {filters.customer_name && <FaFilter size={12} className="text-blue-600" />}
                          <FaChevronDown size={12} className={`transition-transform ${openDropdown === "customer_name" ? "rotate-180" : ""}`} />
                        </div>
                        {openDropdown === "customer_name" && (
                          <div ref={dropdownRef} onClick={(e) => e.stopPropagation()} className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-3 z-[9999]" style={{ minWidth: "200px" }}>
                            <div className="space-y-2">
                              <input
                                type="text"
                                placeholder="Search..."
                                value={dropdownSearchTerm}
                                onChange={(e) => setDropdownSearchTerm(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter') handleApplyFilter("customer_name"); }}
                                className="w-full rounded-lg border border-gray-300 px-2 py-1 text-xs focus:border-green-700 focus:outline-none focus:ring-1 focus:ring-green-700"
                              />
                              <div className="flex gap-2">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSortChange("customer_name");
                                  }}
                                  className={`flex-1 px-2 py-1 rounded text-xs font-medium transition-colors ${sortField === "customer_name" ? "bg-green-700 text-white" : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                                    }`}
                                >
                                  Sort
                                </button>
                                {sortField === "customer_name" && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                                    }}
                                    className="px-2 py-1 rounded text-xs font-medium bg-blue-700 text-white hover:bg-blue-800"
                                  >
                                    {sortOrder === "asc" ? "↑" : "↓"}
                                  </button>
                                )}
                              </div>
                              <button
                                onClick={() => handleApplyFilter("customer_name")}
                                className="w-full px-2 py-1 rounded bg-green-700 text-white hover:bg-green-800 transition-colors text-xs font-medium"
                              >
                                Apply
                              </button>
                            </div>
                          </div>
                        )}
                      </th>
                      <th className={`px-4 py-3 text-left font-medium cursor-pointer hover:bg-gray-100 transition-colors relative ${filters.project_name ? "bg-blue-100" : ""}`} onClick={() => handleHeaderClick("project_name")}>
                        <div className="flex items-center gap-2">
                          Project
                          {filters.project_name && <FaFilter size={12} className="text-blue-600" />}
                          <FaChevronDown size={12} className={`transition-transform ${openDropdown === "project_name" ? "rotate-180" : ""}`} />
                        </div>
                        {openDropdown === "project_name" && (
                          <div ref={dropdownRef} onClick={(e) => e.stopPropagation()} className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-3 z-[9999]" style={{ minWidth: "200px" }}>
                            <div className="space-y-2">
                              <input
                                type="text"
                                placeholder="Search..."
                                value={dropdownSearchTerm}
                                onChange={(e) => setDropdownSearchTerm(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter') handleApplyFilter("project_name"); }}
                                className="w-full rounded-lg border border-gray-300 px-2 py-1 text-xs focus:border-green-700 focus:outline-none focus:ring-1 focus:ring-green-700"
                              />
                              <div className="flex gap-2">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSortChange("project_name");
                                  }}
                                  className={`flex-1 px-2 py-1 rounded text-xs font-medium transition-colors ${sortField === "project_name" ? "bg-green-700 text-white" : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                                    }`}
                                >
                                  Sort
                                </button>
                                {sortField === "project_name" && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                                    }}
                                    className="px-2 py-1 rounded text-xs font-medium bg-blue-700 text-white hover:bg-blue-800"
                                  >
                                    {sortOrder === "asc" ? "↑" : "↓"}
                                  </button>
                                )}
                              </div>
                              <button
                                onClick={() => handleApplyFilter("project_name")}
                                className="w-full px-2 py-1 rounded bg-green-700 text-white hover:bg-green-800 transition-colors text-xs font-medium"
                              >
                                Apply
                              </button>
                            </div>
                          </div>
                        )}
                      </th>
                      <th className={`px-4 py-3 text-left font-medium cursor-pointer hover:bg-gray-100 transition-colors relative ${searchField === "category" && searchTerm ? "bg-blue-100" : ""}`} onClick={() => handleHeaderClick("category")}>
                        <div className="flex items-center gap-2">
                          Category
                          {searchField === "category" && searchTerm && <FaFilter size={12} className="text-blue-600" />}
                          <FaChevronDown size={12} className={`transition-transform ${openDropdown === "category" ? "rotate-180" : ""}`} />
                        </div>
                        {openDropdown === "category" && (
                          <div ref={dropdownRef} onClick={(e) => e.stopPropagation()} className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-3 z-[9999]" style={{ minWidth: "200px" }}>
                            <div className="space-y-2">
                              <input
                                type="text"
                                placeholder="Search..."
                                value={dropdownSearchTerm}
                                onChange={(e) => setDropdownSearchTerm(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter') handleApplyFilter("category"); }}
                                className="w-full rounded-lg border border-gray-300 px-2 py-1 text-xs focus:border-green-700 focus:outline-none focus:ring-1 focus:ring-green-700"
                              />
                              <div className="flex gap-2">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSortChange("category");
                                  }}
                                  className={`flex-1 px-2 py-1 rounded text-xs font-medium transition-colors ${sortField === "category" ? "bg-green-700 text-white" : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                                    }`}
                                >
                                  Sort
                                </button>
                                {sortField === "category" && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                                    }}
                                    className="px-2 py-1 rounded text-xs font-medium bg-blue-700 text-white hover:bg-blue-800"
                                  >
                                    {sortOrder === "asc" ? "↑" : "↓"}
                                  </button>
                                )}
                              </div>
                              <button
                                onClick={() => handleApplyFilter("category")}
                                className="w-full px-2 py-1 rounded bg-green-700 text-white hover:bg-green-800 transition-colors text-xs font-medium"
                              >
                                Apply
                              </button>
                            </div>
                          </div>
                        )}
                      </th>
                      <th className={`px-4 py-3 text-left font-medium cursor-pointer hover:bg-gray-100 transition-colors relative ${searchField === "manufacturer" && searchTerm ? "bg-blue-100" : ""}`} onClick={() => handleHeaderClick("manufacturer")}>
                        <div className="flex items-center gap-2">
                          Manufacturer
                          {searchField === "manufacturer" && searchTerm && <FaFilter size={12} className="text-blue-600" />}
                          <FaChevronDown size={12} className={`transition-transform ${openDropdown === "manufacturer" ? "rotate-180" : ""}`} />
                        </div>
                        {openDropdown === "manufacturer" && (
                          <div ref={dropdownRef} onClick={(e) => e.stopPropagation()} className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-3 z-[9999]" style={{ minWidth: "200px" }}>
                            <div className="space-y-2">
                              <input
                                type="text"
                                placeholder="Search..."
                                value={dropdownSearchTerm}
                                onChange={(e) => setDropdownSearchTerm(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter') handleApplyFilter("manufacturer"); }}
                                className="w-full rounded-lg border border-gray-300 px-2 py-1 text-xs focus:border-green-700 focus:outline-none focus:ring-1 focus:ring-green-700"
                              />
                              <div className="flex gap-2">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSortChange("manufacturer");
                                  }}
                                  className={`flex-1 px-2 py-1 rounded text-xs font-medium transition-colors ${sortField === "manufacturer" ? "bg-green-700 text-white" : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                                    }`}
                                >
                                  Sort
                                </button>
                                {sortField === "manufacturer" && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                                    }}
                                    className="px-2 py-1 rounded text-xs font-medium bg-blue-700 text-white hover:bg-blue-800"
                                  >
                                    {sortOrder === "asc" ? "↑" : "↓"}
                                  </button>
                                )}
                              </div>
                              <button
                                onClick={() => handleApplyFilter("manufacturer")}
                                className="w-full px-2 py-1 rounded bg-green-700 text-white hover:bg-green-800 transition-colors text-xs font-medium"
                              >
                                Apply
                              </button>
                            </div>
                          </div>
                        )}
                      </th>
                      <th className={`px-4 py-3 text-left font-medium cursor-pointer hover:bg-gray-100 transition-colors relative ${searchField === "barcode" && searchTerm ? "bg-blue-100" : ""}`} onClick={() => handleHeaderClick("barcode")}>
                        <div className="flex items-center gap-2">
                          Barcode
                          {searchField === "barcode" && searchTerm && <FaFilter size={12} className="text-blue-600" />}
                          <FaChevronDown size={12} className={`transition-transform ${openDropdown === "barcode" ? "rotate-180" : ""}`} />
                        </div>
                        {openDropdown === "barcode" && (
                          <div ref={dropdownRef} onClick={(e) => e.stopPropagation()} className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-3 z-[9999]" style={{ minWidth: "200px" }}>
                            <div className="space-y-2">
                              <input
                                type="text"
                                placeholder="Search..."
                                value={dropdownSearchTerm}
                                onChange={(e) => setDropdownSearchTerm(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter') handleApplyFilter("barcode"); }}
                                className="w-full rounded-lg border border-gray-300 px-2 py-1 text-xs focus:border-green-700 focus:outline-none focus:ring-1 focus:ring-green-700"
                              />
                              <div className="flex gap-2">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSortChange("barcode");
                                  }}
                                  className={`flex-1 px-2 py-1 rounded text-xs font-medium transition-colors ${sortField === "barcode" ? "bg-green-700 text-white" : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                                    }`}
                                >
                                  Sort
                                </button>
                                {sortField === "barcode" && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                                    }}
                                    className="px-2 py-1 rounded text-xs font-medium bg-blue-700 text-white hover:bg-blue-800"
                                  >
                                    {sortOrder === "asc" ? "↑" : "↓"}
                                  </button>
                                )}
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => {
                                    setFilters(prev => ({ ...prev, barcode: "" }));
                                    setOpenDropdown(null);
                                  }}
                                  className="flex-1 px-2 py-1 rounded text-xs font-medium bg-red-500 text-white hover:bg-red-600 transition-colors"
                                >
                                  Clear
                                </button>
                                <button
                                  onClick={() => handleApplyFilter("barcode")}
                                  className="flex-1 px-2 py-1 rounded bg-green-700 text-white hover:bg-green-800 transition-colors text-xs font-medium"
                                >
                                  Apply
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </th>
                      <th className="px-4 py-3 text-left">Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {sortedAssets.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="px-4 py-8 text-center text-gray-500">
                          No assets found.
                        </td>
                      </tr>
                    ) : (
                      sortedAssets.map((asset) => (
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
                            {asset.project?.name || asset.project_name || asset.project || "-"}
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
                              {/* VIEW FILES */}
                              <button
                                onClick={() => openFilesModal(asset)}
                                className="w-8 h-8 flex items-center justify-center rounded-md bg-blue-400 hover:bg-blue-500 text-white"
                                title="View Files"
                              >
                                📁
                              </button>

                              {/* PRINT */}
                              <button
                                onClick={() => handlePrint(asset)}
                                className="w-8 h-8 flex items-center justify-center rounded-md bg-gray-200 hover:bg-gray-300 text-gray-800"
                                title="Print Asset Report"
                              >
                                <FaPrint size={14} />
                              </button>

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
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* PRINT PREVIEW MODAL */}
      {showPrintPreview && printData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="rounded-lg bg-white shadow-lg max-w-2xl w-full mx-4 max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-900">Print Asset Report</h2>
              <button
                onClick={closePrintPreview}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            {/* Preview Content */}
            <div className="flex-1 overflow-y-auto">
              <iframe
                srcDoc={generatePrintDocument()}
                title="Asset Report Preview"
                className="w-full h-full border-0"
                style={{ minHeight: "600px" }}
              />
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 px-6 py-4 flex gap-3 justify-end">
              <button
                onClick={closePrintPreview}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Close
              </button>
              <button
                onClick={() => {
                  const printWindow = window.open("", "", "width=800,height=600");
                  printWindow.document.write(generatePrintDocument());
                  printWindow.document.close();
                  printWindow.print();
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600"
              >
                Print
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FILES MODAL */}
      {showFilesModal && selectedAsset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="rounded-lg bg-white shadow-lg max-w-2xl w-full mx-4 max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-900">Files for {selectedAsset.title}</h2>
              <button
                onClick={closeFilesModal}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6">
              {selectedAsset.file_upload && selectedAsset.file_upload.length > 0 ? (
                <div className="space-y-4">
                  {selectedAsset.file_upload.map((file, index) => (
                    <div key={index} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-start gap-4">
                        {/* File Preview */}
                        {file.mimetype === 'application/pdf' && (
                          <div className="w-20 h-20 border border-gray-200 rounded-lg overflow-hidden">
                            <embed
                              src={file.url.startsWith('http') ? file.url : `${FILE_BASE_URL}${file.url}`}
                              type="application/pdf"
                              width="80"
                              height="80"
                              className="w-full h-full"
                            />
                          </div>
                        )}
                        {file.mimetype && file.mimetype.startsWith('image/') && (
                          <div className="">
                            <img
                              src={file.url.startsWith('http') ? file.url : `${FILE_BASE_URL}${file.url}`}
                              alt={file.originalname}
                              className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                            />
                          </div>
                        )}
                        {!file.mimetype || (!file.mimetype.startsWith('image/') && file.mimetype !== 'application/pdf') && (
                          <div className="w-20 h-20 bg-gray-100 border border-gray-200 rounded-lg flex items-center justify-center">
                            <span className="text-gray-500 text-xs">File</span>
                          </div>
                        )}

                        {/* File Info */}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">{file.originalname}</p>
                          <p className="text-sm text-gray-500">
                            Size: {(file.size / 1024).toFixed(2)} KB • Type: {file.mimetype}
                          </p>
                        </div>

                        {/* View/Download Button */}
                        <a
                          href={file.url.startsWith('http') ? file.url : `${FILE_BASE_URL}${file.url}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                          {file.mimetype === 'application/pdf' ? 'View' : 'Download'}
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-8">No files attached to this asset.</p>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 px-6 py-4 flex justify-end">
              <button
                onClick={closeFilesModal}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

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
