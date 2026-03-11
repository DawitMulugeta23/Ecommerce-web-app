// client/src/services/api.js
import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
  timeout: 10000, // 10 second timeout
});

// Request interceptor
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log(
        `🔐 Request to ${config.url} with token:`,
        token.substring(0, 10) + "...",
      );
    } else {
      console.log(`⚠️ No token for request to ${config.url}`);
    }
    return config;
  },
  (error) => {
    console.error("Request interceptor error:", error);
    return Promise.reject(error);
  },
);

// Response interceptor
API.interceptors.response.use(
  (response) => {
    console.log(`✅ Response from ${response.config.url}:`, response.status);
    return response;
  },
  (error) => {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error("❌ API Error Response:", {
        url: error.config?.url,
        method: error.config?.method,
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers,
      });

      // Handle 401 Unauthorized
      if (error.response.status === 401) {
        console.log("🔒 Unauthorized - clearing token");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        // Optionally redirect to login
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
      }

      // Handle 403 Forbidden
      if (error.response.status === 403) {
        console.log("🚫 Forbidden - insufficient permissions");
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error("❌ No response received:", error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error("❌ Request setup error:", error.message);
    }

    return Promise.reject(error);
  },
);

export default API;
