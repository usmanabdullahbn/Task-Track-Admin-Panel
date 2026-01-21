import { apiClient } from "./api-client";
import * as XLSX from "xlsx";

// Utility function to export user tasks to CSV
export const handleExportData = async (employee, tasks = []) => {
  // Create CSV header with all task fields
  const headers = ["Customer", "Employee", "Project", "Asset", "Order", "Order #", "Task Title", "Plan Duration (Hours)", "Start Time", "End Time", "Actual Start Time", "Actual End Time", "Priority", "Status"];
  let csv = headers.join(",") + "\n";

  // Use tasks passed as parameter, or fetch if not provided
  let allTasks = tasks;
  
  if (!allTasks || allTasks.length === 0) {
    try {
      const userId = employee?.id || employee?._id;
      console.log(`Fetching tasks for user ID: ${userId}`);
      const response = await apiClient.getTasksByUserId(userId);
      console.log(`Full response for user ${userId}:`, response);
      
      // Handle different response formats
      if (Array.isArray(response)) {
        allTasks = response;
      } else if (response?.data && Array.isArray(response.data)) {
        allTasks = response.data;
      } else if (response?.tasks && Array.isArray(response.tasks)) {
        allTasks = response.tasks;
      }
      
      console.log(`Fetched ${allTasks.length} tasks for user ${userId}`);
    } catch (err) {
      console.error(`Failed to fetch tasks for user:`, err);
      allTasks = [];
    }
  }

  // Build CSV rows from all tasks
  if (allTasks && allTasks.length > 0) {
    allTasks.forEach((task) => {
      // Calculate duration in hours from start_time and end_time
      let planDurationHours = "";
      if (task.start_time && task.end_time) {
        const start = new Date(task.start_time);
        const end = new Date(task.end_time);
        planDurationHours = ((end - start) / (1000 * 60 * 60)).toFixed(2);
      }

      const row = [
        task.customer?.name || "",
        task.user?.name || "",
        task.project?.name || "",
        task.asset?.name || "",
        task.order?.title || "",
        task.order?.order_number || "",
        task.title || "",
        planDurationHours,
        task.start_time ? new Date(task.start_time).toLocaleString() : "",
        task.end_time ? new Date(task.end_time).toLocaleString() : "",
        task.actual_start_time ? new Date(task.actual_start_time).toLocaleString() : "",
        task.actual_end_time ? new Date(task.actual_end_time).toLocaleString() : "",
        task.priority || "",
        task.status || ""
      ];
      csv += row.map(cell => `"${cell}"`).join(",") + "\n";
    });
  }

  // Create workbook and worksheet
  const data = [headers];
  if (allTasks && allTasks.length > 0) {
    allTasks.forEach((task) => {
      // Calculate duration in hours from start_time and end_time
      let planDurationHours = "";
      if (task.start_time && task.end_time) {
        const start = new Date(task.start_time);
        const end = new Date(task.end_time);
        planDurationHours = ((end - start) / (1000 * 60 * 60)).toFixed(2);
      }

      const row = [
        task.customer?.name || "",
        task.user?.name || "",
        task.project?.name || "",
        task.asset?.name || "",
        task.order?.title || "",
        task.order?.order_number || "",
        task.title || "",
        planDurationHours,
        task.start_time ? new Date(task.start_time).toLocaleString() : "",
        task.end_time ? new Date(task.end_time).toLocaleString() : "",
        task.actual_start_time ? new Date(task.actual_start_time).toLocaleString() : "",
        task.actual_end_time ? new Date(task.actual_end_time).toLocaleString() : "",
        task.priority || "",
        task.status || ""
      ];
      data.push(row);
    });
  }

  // Create workbook and apply bold formatting to header
  const worksheet = XLSX.utils.aoa_to_sheet(data);
  
  // Make header row bold
  for (let i = 0; i < headers.length; i++) {
    const cellRef = XLSX.utils.encode_col(i) + "1";
    if (!worksheet[cellRef]) worksheet[cellRef] = {};
    worksheet[cellRef].font = { bold: true };
  }

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Tasks");
  
  // Download Excel file
  XLSX.writeFile(workbook, `Customer_Data_${employee.name || "Customer"}_${new Date().toISOString().split('T')[0]}.xlsx`);
};