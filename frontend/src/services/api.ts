import axios from "axios";
import type {
  User,
  AuthTokens,
  Holding,
  PortfolioSummary,
  AllocationData,
  InsightResponse,
  RiskMetrics,
  RiskHeatmapData,
} from "../types";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

// Create axios instance
const api = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("stockwise_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("stockwise_token");
      window.location.href = "/auth";
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: async (username: string, password: string): Promise<AuthTokens> => {
    const formData = new URLSearchParams();
    formData.append("username", username);
    formData.append("password", password);

    const response = await api.post("/auth/login", formData, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });
    return response.data;
  },

  register: async (
    email: string,
    password: string,
    fullName?: string
  ): Promise<User> => {
    const response = await api.post("/auth/register", {
      email,
      password,
      full_name: fullName,
    });
    return response.data;
  },

  getMe: async (): Promise<User> => {
    const response = await api.get("/auth/me");
    return response.data;
  },

  refreshToken: async (): Promise<AuthTokens> => {
    const response = await api.post("/auth/refresh");
    return response.data;
  },
};

export const holdingsApi = {
  getHoldings: async (): Promise<Holding[]> => {
    const response = await api.get("/holdings/");
    return response.data;
  },

  createHolding: async (holding: Partial<Holding>): Promise<Holding> => {
    const response = await api.post("/holdings/", holding);
    return response.data;
  },

  updateHolding: async (
    id: number,
    holding: Partial<Holding>
  ): Promise<Holding> => {
    const response = await api.put(`/holdings/${id}`, holding);
    return response.data;
  },

  deleteHolding: async (id: number): Promise<void> => {
    await api.delete(`/holdings/${id}`);
  },

  getPortfolioSummary: async (): Promise<PortfolioSummary> => {
    const response = await api.get("/holdings/portfolio");
    return response.data;
  },

  getAllocationData: async (): Promise<AllocationData> => {
    const response = await api.get("/holdings/allocation");
    return response.data;
  },
};

export const insightsApi = {
  generateInsights: async (
    analysisType: string = "full"
  ): Promise<InsightResponse> => {
    const response = await api.post("/insights/", {
      analysis_type: analysisType,
    });
    return response.data;
  },

  getLatestInsights: async (): Promise<InsightResponse> => {
    const response = await api.get("/insights/latest");
    return response.data;
  },
};

export const riskApi = {
  getRiskAnalysis: async (): Promise<RiskMetrics> => {
    const response = await api.get("/risk/");
    return response.data;
  },

  getRiskHeatmap: async (): Promise<RiskHeatmapData> => {
    const response = await api.get("/risk/heatmap");
    return response.data;
  },

  getRiskMetrics: async (): Promise<RiskMetrics> => {
    const response = await api.get("/risk/metrics");
    return response.data;
  },
};

export default api;
