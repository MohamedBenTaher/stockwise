import { useQuery } from "@tanstack/react-query";
import { riskApi } from "../services/api";

export const useRiskAnalysis = () => {
  return useQuery({
    queryKey: ["risk", "analysis"],
    queryFn: riskApi.getRiskAnalysis,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useRiskHeatmap = () => {
  return useQuery({
    queryKey: ["risk", "heatmap"],
    queryFn: riskApi.getRiskHeatmap,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useRiskMetrics = () => {
  return useQuery({
    queryKey: ["risk", "metrics"],
    queryFn: riskApi.getRiskMetrics,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
