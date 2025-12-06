import React, { useState, useEffect } from "react";
import Sidebar from "./customer-sidebar";
import { FaExternalLinkAlt, FaPrint } from "react-icons/fa";
import { apiClient } from "../../lib/api-client";

const AssetsPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [printData, setPrintData] = useState(null);
  const [showPrintPreview, setShowPrintPreview] = useState(false);

  // -------------------------
  // GET CUSTOMER ID FROM LOCALSTORAGE
  // -------------------------
  const getCustomerId = () => {
    try {
      const user = JSON.parse(localStorage.getItem("User"));
      return user?.customer?._id || user?._id || null;
    } catch (err) {
      console.error("Failed to get customer ID from localStorage:", err);
      return null;
    }
  };

  // -------------------------
  // LOAD ASSETS FROM API
  // -------------------------
  useEffect(() => {
    const fetchAssets = async () => {
      try {
        const customerId = getCustomerId();
        if (!customerId) {
          console.error("Customer ID not found in localStorage");
          setAssets([]);
          setLoading(false);
          return;
        }

        const res = await apiClient.getAssetsByCustomerId(customerId);
        console.log("Assets API Response:", res);

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
                <div class="detail-value">${
                  printData._id || printData.id || "N/A"
                }</div>
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
                <div class="detail-value">${
                  printData.manufacturer || "N/A"
                }</div>
              </div>
            </div>
            <div>
              <div class="detail-item">
                <div class="detail-label">Customer</div>
                <div class="detail-value">${
                  printData.customer?.name || printData.customer || "N/A"
                }</div>
              </div>
              <div class="detail-item">
                <div class="detail-label">Project</div>
                <div class="detail-value">${
                  printData.project?.name ||
                  printData.project_name ||
                  printData.project ||
                  "N/A"
                }</div>
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
                <div class="detail-value">${
                  printData.serial_number || printData.serialNumber || "N/A"
                }</div>
              </div>
            </div>
          </div>

          ${
            printData.description
              ? `
            <div class="section-title">Description</div>
            <div class="description-box">
              ${printData.description}
            </div>
          `
              : ""
          }

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
  // FILTER
  // -------------------------
  const filteredAssets = assets.filter((asset) => {
    const title = asset.title || "";
    const customer = asset.customer?.name || asset.customer || "";
    const barcode = asset.barcode || "";
    const search = (searchTerm || "").toLowerCase();

    return (
      title.toLowerCase().includes(search) ||
      customer.toLowerCase().includes(search) ||
      barcode.toLowerCase().includes(search)
    );
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
          </div>

          {/* Search */}
          <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-200 p-4 sm:p-6">
              <input
                type="text"
                placeholder="Search assets by title, customer, or barcode..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm sm:text-base focus:border-green-700 focus:outline-none focus:ring-1 focus:ring-green-700"
              />
            </div>

            {/* Table */}
            {loading ? (
              <p className="text-center text-gray-500 py-6">
                Loading assets...
              </p>
            ) : filteredAssets.length === 0 ? (
              <p className="text-center text-gray-500 py-6">No assets found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px] text-sm sm:text-base">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="px-4 py-3 text-left">Title</th>
                      <th className="px-4 py-3 text-left">Customer</th>
                      <th className="px-4 py-3 text-left">Project</th>
                      <th className="px-4 py-3 text-left">Category</th>
                      <th className="px-4 py-3 text-left">Manufacturer</th>
                      <th className="px-4 py-3 text-left">Barcode</th>
                      <th className="px-4 py-3 text-left">Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredAssets.map((asset) => (
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
                          {asset.project?.name ||
                            asset.project_name ||
                            asset.project ||
                            "-"}
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
                            <button
                              onClick={() => handlePrint(order)}
                              className="w-8 h-8 flex items-center justify-center rounded-md bg-gray-200 hover:bg-gray-300 text-gray-800"
                              title="Print order report"
                            >
                              <FaPrint size={14} />
                            </button>
                            {/* add other per-order actions here */}
                            <button
                              onClick={() =>
                                navigate(`/project/${project._id}`)
                              }
                              className="w-8 h-8 flex items-center justify-center rounded-md bg-blue-400 hover:bg-blue-500 text-white text-sm"
                              title="Open project details"
                            >
                              <FaExternalLinkAlt size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
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
              <h2 className="text-lg font-bold text-gray-900">
                Print Asset Report
              </h2>
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
                  const printWindow = window.open(
                    "",
                    "",
                    "width=800,height=600"
                  );
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
    </div>
  );
};

export default AssetsPage;
