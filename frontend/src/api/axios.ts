import axios from "axios";
import type {
  AxiosInstance,
  AxiosError,
  InternalAxiosRequestConfig,
} from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

// Create axios instance with default configuration
const apiClient: AxiosInstance = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  timeout: 15000,
  withCredentials: true, // This ensures cookies are sent with requests
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Track if we're currently refreshing the token
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (error?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });

  failedQueue = [];
};

// Request interceptor
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Log requests in development
    if (import.meta.env.DEV) {
      console.log(
        `🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`
      );
    }

    // Add CSRF token if available (for additional security)
    const csrfToken = document
      .querySelector('meta[name="csrf-token"]')
      ?.getAttribute("content");
    if (csrfToken && config.headers) {
      config.headers["X-CSRF-Token"] = csrfToken;
    }

    return config;
  },
  (error) => {
    console.error("❌ Request Error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    // Log successful responses in development
    if (import.meta.env.DEV) {
      console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    }
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Handle common errors
    if (error.response) {
      const { status, data } = error.response;

      // Handle authentication errors with token refresh
      if (status === 401 && !originalRequest._retry) {
        if (isRefreshing) {
          // If we're already refreshing, queue this request
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then(() => {
              return apiClient(originalRequest);
            })
            .catch((err) => {
              return Promise.reject(err);
            });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          // Attempt to refresh the token
          await apiClient.post("/auth/refresh");
          processQueue(null);
          return apiClient(originalRequest);
        } catch (refreshError) {
          processQueue(refreshError, null);

          // Clear any local auth state
          localStorage.removeItem("stockwise_token");

          // Redirect to login if not already there
          if (window.location.pathname !== "/auth") {
            console.warn("🔐 Authentication failed, redirecting to login");
            window.location.href = "/auth";
          }

          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }

      // Handle forbidden access
      if (status === 403) {
        console.warn("🚫 Access forbidden");
      }

      // Handle server errors
      if (status >= 500) {
        console.error("🔥 Server error:", status);
      }

      // Log error details in development
      if (import.meta.env.DEV) {
        console.error(`❌ API Error: ${status} ${error.config?.url}`, data);
      }
    } else if (error.request) {
      console.error("❌ Network Error: No response received", error.request);
    } else {
      console.error("❌ Request Setup Error:", error.message);
    }

    return Promise.reject(error);
  }
);

// Helper function to check if user is authenticated
export const isAuthenticated = (): boolean => {
  // Since we're using HTTP-only cookies, we can't directly check the JWT
  // This would typically be determined by a successful API call to a protected endpoint
  // For now, we'll use a simple localStorage check as a fallback
  return !!localStorage.getItem("stockwise_authenticated");
};

// Helper function to set authentication state
export const setAuthenticationState = (isAuth: boolean): void => {
  if (isAuth) {
    localStorage.setItem("stockwise_authenticated", "true");
  } else {
    localStorage.removeItem("stockwise_authenticated");
    localStorage.removeItem("stockwise_token"); // Remove any legacy tokens
  }
};

export default apiClient;
