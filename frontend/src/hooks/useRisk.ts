import { useQuery } from "@tanstack/react-query";
import { typedApi } from "../api/typed-api";

export const useRiskAnalysis = () => {
  return useQuery({
    queryKey: ["risk", "analysis"],
    queryFn: typedApi.risk.getAnalysis,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useRiskHeatmap = () => {
  return useQuery({
    queryKey: ["risk", "heatmap"],
    queryFn: typedApi.risk.getHeatmap,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useRiskMetrics = () => {
  return useQuery({
    queryKey: ["risk", "metrics"],
    queryFn: typedApi.risk.getMetrics,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
