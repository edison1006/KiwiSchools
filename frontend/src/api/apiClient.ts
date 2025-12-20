import axios, { AxiosError, AxiosInstance } from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

// Create axios instance with base configuration
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // 10 second timeout
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError) => {
    // Log error for debugging
    if (error.code === "ERR_NETWORK" || error.message.includes("Network Error")) {
      console.error("Network error: Unable to connect to backend server");
      // Set flag in sessionStorage to avoid repeated initial load attempts
      sessionStorage.setItem("backend_unavailable_warning_logged", "true");
    } else if (error.response) {
      // Server responded with error status
      console.error("API error:", error.response.status, error.response.data);
    } else {
      // Request was made but no response received
      console.error("Request error:", error.message);
    }
    return Promise.reject(error);
  }
);

export { apiClient };
