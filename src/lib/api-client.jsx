// const API_BASE_URL = "http://10.0.0.234:4000/api";
const API_BASE_URL = "http://localhost:4000/api";

export const apiClient = {
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
      let details = ""
      try {
        const data = await response.json()
        details = data.message || JSON.stringify(data)
      } catch (e) {
        try {
          details = await response.text()
        } catch (ee) {
          details = response.statusText || "Unknown error"
        }
      }
      throw new Error(`Failed to create user: ${response.status} ${details}`)
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
    const response = await fetch(`${API_BASE_URL}/users/${id}/change-password`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(passwordData),
    });

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
    const response = await fetch(`${API_BASE_URL}/customers/${id}/change-password`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(passwordData),
    });

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
};
