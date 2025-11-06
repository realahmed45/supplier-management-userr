import axios from "axios";

const API_BASE_URL = "https://supplier-mangement-backend.onrender.com/api";

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

// Request interceptor to add auth token to all requests
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log("Adding token to request:", token.substring(0, 20) + "...");
    } else {
      console.log("No token found in localStorage");
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token expiration
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error("API Error:", error.response?.status, error.response?.data);

    if (error.response?.status === 401) {
      // Token expired or invalid
      console.log("Token expired, removing from localStorage");
      localStorage.removeItem("authToken");

      // Only redirect if we're not already on the login page
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

// Auth utilities
export const authUtils = {
  // Get token from localStorage
  getToken: () => {
    const token = localStorage.getItem("authToken");
    console.log("Getting token:", token ? "Found" : "Not found");
    return token;
  },

  // Set token in localStorage
  setToken: (token) => {
    console.log(
      "Setting token in localStorage:",
      token.substring(0, 20) + "..."
    );
    localStorage.setItem("authToken", token);
  },

  // Remove token from localStorage
  removeToken: () => {
    console.log("Removing token from localStorage");
    localStorage.removeItem("authToken");
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    const token = localStorage.getItem("authToken");
    const isAuth = !!token;
    console.log("Is authenticated:", isAuth);
    return isAuth;
  },

  // Logout function
  logout: async (navigate) => {
    try {
      console.log("Logging out...");
      await apiClient.post("/auth/logout");
    } catch (error) {
      console.error("Logout API error:", error);
    } finally {
      localStorage.removeItem("authToken");
      if (navigate) {
        navigate("/login");
      } else {
        window.location.href = "/login";
      }
    }
  },

  // Verify token
  verifyToken: async () => {
    try {
      console.log("Verifying token...");
      const response = await apiClient.get("/auth/verify-token");
      console.log("Token verification result:", response.data);
      return response.data;
    } catch (error) {
      console.error("Token verification failed:", error);
      return { success: false };
    }
  },
};

export default apiClient;
export { API_BASE_URL };
