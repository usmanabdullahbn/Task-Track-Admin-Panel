import { apiClient } from "./api-client";

// Utility function to export customer data to CSV
export const handleExportData = (stats, projects, orders, assets, employee) => {
  // Prepare data for export
  const data = {
    stats,
    projects,
    orders,
    assets,
  };

  // Convert to CSV
  let csv = "Section,Field,Value\n";

  // Stats
  csv += "Stats,Total Projects," + (stats.totalProjects || 0) + "\n";
  csv += "Stats,Active Projects," + (stats.activeProjects || 0) + "\n";
  csv += "Stats,Completed Projects," + (stats.completedProjects || 0) + "\n";
  csv += "Stats,Total Orders," + (stats.totalOrders || 0) + "\n";
  csv += "Stats,Pending Orders," + (stats.pendingOrders || 0) + "\n";
  csv += "Stats,Completed Orders," + (stats.completedOrders || 0) + "\n";
  csv += "Stats,Total Assets," + (stats.totalAssets || 0) + "\n";

  // Projects
  projects.forEach((p, i) => {
    csv += `Project ${i+1},Title,${p.title || ""}\n`;
    csv += `Project ${i+1},Status,${p.status || ""}\n`;
    csv += `Project ${i+1},Created,${p.created_at ? new Date(p.created_at).toLocaleDateString() : ""}\n`;
  });

  // Orders
  orders.forEach((o, i) => {
    csv += `Order ${i+1},Title,${o.title || ""}\n`;
    csv += `Order ${i+1},Order Number,${o.order_number || ""}\n`;
    csv += `Order ${i+1},Status,${o.status || ""}\n`;
    csv += `Order ${i+1},Amount,${o.amount || ""}\n`;
  });

  // Assets
  assets.forEach((a, i) => {
    csv += `Asset ${i+1},Title,${a.title || ""}\n`;
    csv += `Asset ${i+1},Category,${a.category || ""}\n`;
    csv += `Asset ${i+1},Manufacturer,${a.manufacturer || ""}\n`;
    csv += `Asset ${i+1},Barcode,${a.barcode || ""}\n`;
  });

  // Download CSV
  const blob = new Blob([csv], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `Customer_Data_${employee.name || "Customer"}_${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
};