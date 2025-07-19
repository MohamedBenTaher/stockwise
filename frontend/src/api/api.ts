import apiClient, { setAuthenticationState } from "./axios";
import type {
  User,
  Holding,
  PortfolioSummary,
  AllocationData,
  InsightResponse,
  RiskMetrics,
  RiskHeatmapData,
} from "../types";

// Authentication API
export const authApi = {
  login: async (username: string, password: string): Promise<User> => {
    const formData = new URLSearchParams();
    formData.append("username", username);
    formData.append("password", password);

    const response = await apiClient.post("/auth/login", formData, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    // Set authentication state since login was successful
    setAuthenticationState(true);

    // For HTTP-only cookies, the backend should return user data instead of tokens
    return response.data;
  },

  register: async (
    email: string,
    password: string,
    fullName?: string
  ): Promise<User> => {
    const response = await apiClient.post("/auth/register", {
      email,
      password,
      full_name: fullName,
    });
    return response.data;
  },

  getMe: async (): Promise<User> => {
    const response = await apiClient.get("/auth/me");
    return response.data;
  },

  refreshToken: async (): Promise<void> => {
    // For HTTP-only cookies, this just validates the refresh token
    await apiClient.post("/auth/refresh");
  },

  logout: async (): Promise<void> => {
    try {
      await apiClient.post("/auth/logout");
    } finally {
      // Always clear local authentication state
      setAuthenticationState(false);
    }
  },
};

// Holdings API
export const holdingsApi = {
  getHoldings: async (): Promise<Holding[]> => {
    const response = await apiClient.get("/holdings/");
    return response.data;
  },

  createHolding: async (holding: Partial<Holding>): Promise<Holding> => {
    const response = await apiClient.post("/holdings/", holding);
    return response.data;
  },

  updateHolding: async (
    id: number,
    holding: Partial<Holding>
  ): Promise<Holding> => {
    const response = await apiClient.put(`/holdings/${id}`, holding);
    return response.data;
  },

  deleteHolding: async (id: number): Promise<void> => {
    await apiClient.delete(`/holdings/${id}`);
  },

  getPortfolioSummary: async (): Promise<PortfolioSummary> => {
    const response = await apiClient.get("/holdings/portfolio");
    return response.data;
  },

  getAllocationData: async (): Promise<AllocationData> => {
    const response = await apiClient.get("/holdings/allocation");
    return response.data;
  },
};

// Insights API
export const insightsApi = {
  generateInsights: async (
    analysisType: string = "full"
  ): Promise<InsightResponse> => {
    const response = await apiClient.post("/insights/", {
      analysis_type: analysisType,
    });
    return response.data;
  },

  getLatestInsights: async (): Promise<InsightResponse> => {
    const response = await apiClient.get("/insights/latest");
    return response.data;
  },
};

// Risk Analysis API
export const riskApi = {
  getRiskAnalysis: async (): Promise<RiskMetrics> => {
    const response = await apiClient.get("/risk/");
    return response.data;
  },

  getRiskHeatmap: async (): Promise<RiskHeatmapData> => {
    const response = await apiClient.get("/risk/heatmap");
    return response.data;
  },

  getRiskMetrics: async (): Promise<RiskMetrics> => {
    const response = await apiClient.get("/risk/metrics");
    return response.data;
  },
};

export default apiClient;
