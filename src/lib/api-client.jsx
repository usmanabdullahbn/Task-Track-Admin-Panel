// const API_BASE_URL = "http://10.0.0.234:4000/api";
// const API_BASE_URL = "http://localhost:4000/api";
const API_BASE_URL = "https://backend-task-track.onrender.com/api";

export const apiClient = {
  // ============================
  //         DASHBOARD
  // ============================

  async getDashboardStats() {
    const response = await fetch(`${API_BASE_URL}/dashboard/stats`);
    if (!response.ok) throw new Error("Failed to fetch dashboard stats");
    return response.json();
  },

  async getDashboardActivities() {
    const response = await fetch(`${API_BASE_URL}/activities`);
    if (!response.ok) throw new Error("Failed to fetch activities");
    return response.json();
  },

  // ============================
  //            USERS
  // ============================

  async getUsers() {
    const response = await fetch(`${API_BASE_URL}/users`);
    if (!response.ok) throw new Error("Failed to fetch users");
    return response.json();
  },

  async getUserById(id) {
    const response = await fetch(`${API_BASE_URL}/users/${id}`);
    if (!response.ok) throw new Error("Failed to fetch user");
    return response.json();
  },

  async createUser(userData) {
    const response = await fetch(`${API_BASE_URL}/users/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      // Try to extract more detailed error info from the server
      let details = "";
      try {
        const data = await response.json();
        details = data.message || JSON.stringify(data);
      } catch (e) {
        try {
          details = await response.text();
        } catch (ee) {
          details = response.statusText || "Unknown error";
        }
      }
      throw new Error(`Failed to create user: ${response.status} ${details}`);
    }

    return response.json();
  },

  async updateUser(id, userData) {
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });

    if (!response.ok) throw new Error("Failed to update user");
    return response.json();
  },

  async changeUserPassword(id, passwordData) {
    const response = await fetch(
      `${API_BASE_URL}/users/${id}/change-password`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(passwordData),
      }
    );

    if (!response.ok) throw new Error("Failed to update password");
    return response.json();
  },

  async deleteUser(id) {
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) throw new Error("Failed to delete user");
    return response.json();
  },

  async loginUser(email, password) {
    const response = await fetch(`${API_BASE_URL}/users/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) throw new Error("Invalid credentials");
    return response.json();
  },

  // ============================
  //         CUSTOMERS
  // ============================

  async getCustomers() {
    const response = await fetch(`${API_BASE_URL}/customers`);
    if (!response.ok) throw new Error("Failed to fetch customers");
    return response.json();
  },

  async getCustomerById(id) {
    const response = await fetch(`${API_BASE_URL}/customers/${id}`);
    if (!response.ok) throw new Error("Failed to fetch customer");
    return response.json();
  },

  async createCustomer(customerData) {
    const response = await fetch(`${API_BASE_URL}/customers/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(customerData),
    });

    if (!response.ok) throw new Error("Failed to create customer");
    return response.json();
  },

  async updateCustomer(id, customerData) {
    const response = await fetch(`${API_BASE_URL}/customers/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(customerData),
    });

    if (!response.ok) throw new Error("Failed to update customer");
    return response.json();
  },

  async deleteCustomer(id) {
    const response = await fetch(`${API_BASE_URL}/customers/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) throw new Error("Failed to delete customer");
    return response.json();
  },

  async changeCustomerPassword(id, passwordData) {
    const response = await fetch(
      `${API_BASE_URL}/customers/${id}/change-password`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(passwordData),
      }
    );

    if (!response.ok) throw new Error("Failed to change password");
    return response.json();
  },

  async loginCustomer(email, password) {
    const response = await fetch(`${API_BASE_URL}/customers/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) throw new Error("Invalid credentials");
    return response.json();
  },

  // ============================
  //          PROJECTS
  // ============================

  async getProjects() {
    const response = await fetch(`${API_BASE_URL}/projects`);
    if (!response.ok) throw new Error("Failed to fetch projects");
    return response.json();
  },

  async getProjectById(id) {
    const response = await fetch(`${API_BASE_URL}/projects/${id}`);
    if (!response.ok) throw new Error("Failed to fetch project");
    return response.json();
  },

  async getProjectByCustomerId(customerId) {
    const res = await fetch(`${API_BASE_URL}/projects/customer/${customerId}`);
    if (!res.ok) throw new Error("Failed to fetch project");
    return res.json();
  },

  async createProject(projectData) {
    const response = await fetch(`${API_BASE_URL}/projects`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(projectData),
    });

    if (!response.ok) throw new Error("Failed to create project");
    return response.json();
  },

  async updateProject(id, projectData) {
    const response = await fetch(`${API_BASE_URL}/projects/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(projectData),
    });

    if (!response.ok) throw new Error("Failed to update project");
    return response.json();
  },

  async deleteProject(id) {
    const response = await fetch(`${API_BASE_URL}/projects/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) throw new Error("Failed to delete project");
    return response.json();
  },

  // ============================
  //           ORDERS
  // ============================

  async getOrders() {
    const response = await fetch(`${API_BASE_URL}/orders`);
    if (!response.ok) throw new Error("Failed to fetch orders");
    return response.json();
  },

  async getOrderById(id) {
    const response = await fetch(`${API_BASE_URL}/orders/${id}`);
    if (!response.ok) throw new Error("Failed to fetch order");
    return response.json();
  },

  async getOrdersByCustomerId(customerId) {
    const response = await fetch(
      `${API_BASE_URL}/orders/customer/${customerId}`
    );
    if (!response.ok) throw new Error("Failed to fetch customer orders");
    return response.json();
  },

  async getOrdersByProjectId(projectId) {
    const response = await fetch(`${API_BASE_URL}/orders/project${projectId}`);
    if (!response.ok) throw new Error("Failed to fetch customer orders");
    return response.json();
  },

  async createOrder(orderData) {
    const response = await fetch(`${API_BASE_URL}/orders/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orderData),
    });

    if (!response.ok) throw new Error("Failed to create order");
    return response.json();
  },

  async updateOrder(id, orderData) {
    const response = await fetch(`${API_BASE_URL}/orders/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orderData),
    });

    if (!response.ok) throw new Error("Failed to update order");
    return response.json();
  },

  async deleteOrder(id) {
    const response = await fetch(`${API_BASE_URL}/orders/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) throw new Error("Failed to delete order");
    return response.json();
  },

  // ============================
  //           TASKS
  // ============================

  async getTasks() {
    const response = await fetch(`${API_BASE_URL}/tasks`);
    if (!response.ok) throw new Error("Failed to fetch tasks");
    return response.json();
  },

  async getTaskById(id) {
    const response = await fetch(`${API_BASE_URL}/tasks/${id}`);
    if (!response.ok) throw new Error("Failed to fetch task");
    return response.json();
  },

  async getTasksByProjectId(projectId) {
    const response = await fetch(`${API_BASE_URL}/tasks/project/${projectId}`);
    if (!response.ok) throw new Error("Failed to fetch project tasks");
    return response.json();
  },

  async createTask(taskData) {
    const response = await fetch(`${API_BASE_URL}/tasks/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(taskData),
    });

    if (!response.ok) throw new Error("Failed to create task");
    return response.json();
  },

  async updateTask(id, taskData) {
    const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(taskData),
    });

    if (!response.ok) throw new Error("Failed to update task");
    return response.json();
  },

  async deleteTask(id) {
    const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) throw new Error("Failed to delete task");
    return response.json();
  },

  async changeTaskStatus(id, statusData) {
    const response = await fetch(`${API_BASE_URL}/tasks/${id}/change-status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(statusData),
    });

    if (!response.ok) throw new Error("Failed to change task status");
    return response.json();
  },
};
