/**
 * Type-safe API client for StockWise
 *
 * This client uses the auto-generated types from the OpenAPI schema
 * to provide compile-time type safety for all API calls.
 */

import axios from "axios";
import type {
  paths,
  User,
  Holding,
  HoldingCreate,
  HoldingUpdate,
  PortfolioSummary,
  AllocationData,
  InsightResponse,
  Token,
  AssetType,
  PortfolioHistoryPoint,
  PerformanceComparisonPoint,
  AllocationChartData,
  PortfolioMetrics,
} from "../types/generated";

// Re-export types for convenience
export type {
  User,
  Holding,
  HoldingCreate,
  HoldingUpdate,
  PortfolioSummary,
  AllocationData,
  InsightResponse,
  Token,
  AssetType,
};

// API endpoint types
type Paths = paths;

// Helper type to extract response type from path operation
type ApiResponse<
  T extends keyof Paths,
  M extends keyof Paths[T]
> = Paths[T][M] extends {
  responses: { 200: { content: { "application/json": infer R } } };
}
  ? R
  : never;

// Helper type to extract request body type from path operation
type ApiRequestBody<
  T extends keyof Paths,
  M extends keyof Paths[T]
> = Paths[T][M] extends {
  requestBody: { content: { "application/json": infer R } };
}
  ? R
  : never;

// Base API configuration
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

// Create axios instance with default configuration
const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  timeout: 15000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Request interceptor for auth and logging
apiClient.interceptors.request.use(
  (config) => {
    if (import.meta.env.DEV) {
      console.log(
        `🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`
      );
    }

    // Add CSRF token if available
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

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    if (import.meta.env.DEV) {
      console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    }
    return response;
  },
  async (error) => {
    if (error.response?.status === 401) {
      // Handle authentication errors
      localStorage.removeItem("stockwise_authenticated");
      if (window.location.pathname !== "/") {
        console.warn("🔐 Authentication failed, redirecting to landing page");
        window.location.href = "/";
      }
    }

    if (import.meta.env.DEV) {
      console.error(
        `❌ API Error: ${error.response?.status} ${error.config?.url}`,
        error.response?.data
      );
    }

    return Promise.reject(error);
  }
);

// Type-safe API methods
export const typedApi = {
  // Authentication
  auth: {
    register: async (
      userData: ApiRequestBody<"/api/v1/auth/register", "post">
    ): Promise<User> => {
      const response = await apiClient.post<User>("/auth/register", userData);
      return response.data;
    },

    login: async (credentials: {
      username: string;
      password: string;
    }): Promise<Token> => {
      const formData = new URLSearchParams();
      formData.append("username", credentials.username);
      formData.append("password", credentials.password);

      const response = await apiClient.post<Token>("/auth/login", formData, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });
      return response.data;
    },

    getMe: async (): Promise<User> => {
      const response = await apiClient.get<User>("/auth/me");
      return response.data;
    },

    refresh: async (): Promise<Token> => {
      const response = await apiClient.post<Token>("/auth/refresh");
      return response.data;
    },

    logout: async (): Promise<void> => {
      await apiClient.post("/auth/logout");
    },
  },

  // Holdings
  holdings: {
    getAll: async (): Promise<Holding[]> => {
      const response = await apiClient.get<
        ApiResponse<"/api/v1/holdings/", "get">
      >("/holdings/");
      return response.data;
    },

    create: async (holding: HoldingCreate): Promise<Holding> => {
      const response = await apiClient.post<Holding>("/holdings/", holding);
      return response.data;
    },

    update: async (id: number, holding: HoldingUpdate): Promise<Holding> => {
      const response = await apiClient.put<Holding>(`/holdings/${id}`, holding);
      return response.data;
    },

    delete: async (id: number): Promise<void> => {
      await apiClient.delete(`/holdings/${id}`);
    },

    getPortfolioSummary: async (): Promise<PortfolioSummary> => {
      const response = await apiClient.get<PortfolioSummary>(
        "/holdings/portfolio"
      );
      return response.data;
    },

    getAllocationData: async (): Promise<AllocationData> => {
      const response = await apiClient.get<AllocationData>(
        "/holdings/allocation"
      );
      return response.data;
    },
  },

  // Insights
  insights: {
    generate: async (
      analysisType: string = "full"
    ): Promise<InsightResponse> => {
      const response = await apiClient.post<InsightResponse>("/insights/", {
        analysis_type: analysisType,
      });
      return response.data;
    },

    getLatest: async (): Promise<InsightResponse> => {
      const response = await apiClient.get<InsightResponse>("/insights/latest");
      return response.data;
    },
  },

  // Risk
  risk: {
    getAnalysis: async (): Promise<any> => {
      const response = await apiClient.get("/risk/");
      return response.data;
    },

    getHeatmap: async (): Promise<any> => {
      const response = await apiClient.get("/risk/heatmap");
      return response.data;
    },

    getMetrics: async (): Promise<any> => {
      const response = await apiClient.get("/risk/metrics");
      return response.data;
    },
  },
  charts: {
    getPortfolioHistory: async (
      days: number = 30
    ): Promise<PortfolioHistoryPoint[]> => {
      const response = await apiClient.get(
        `/charts/portfolio-history?days=${days}`
      );
      return response.data;
    },

    getPerformanceComparison: async (
      days: number = 30
    ): Promise<PerformanceComparisonPoint[]> => {
      const response = await apiClient.get(
        `/charts/performance-comparison?days=${days}`
      );
      return response.data;
    },

    getAllocationData: async (): Promise<AllocationChartData> => {
      const response = await apiClient.get("/charts/allocation-data");
      return response.data;
    },

    getPortfolioMetrics: async (): Promise<PortfolioMetrics> => {
      const response = await apiClient.get("/charts/portfolio-metrics");
      return response.data;
    },
  },
};

// Helper functions
export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem("stockwise_authenticated");
};

export const setAuthenticationState = (isAuth: boolean): void => {
  if (isAuth) {
    localStorage.setItem("stockwise_authenticated", "true");
  } else {
    localStorage.removeItem("stockwise_authenticated");
    localStorage.removeItem("stockwise_token");
  }
};

// Export the axios instance for custom requests
export { apiClient };
export default typedApi;
