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
      console.error("❌ API Error Response:", {
        url: error.config?.url,
        method: error.config?.method,
        status: error.response.status,
        data: error.response.data,
      });

      // Handle 401 Unauthorized
      if (error.response.status === 401) {
        console.log("🔒 Unauthorized - clearing token");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        if (
          typeof window !== "undefined" &&
          !window.location.pathname.includes("/login")
        ) {
          window.location.href = "/login";
        }
      }
    } else if (error.request) {
      console.error("❌ No response received:", error.request);
    } else {
      console.error("❌ Request setup error:", error.message);
    }

    return Promise.reject(error);
  },
);

export default API;
