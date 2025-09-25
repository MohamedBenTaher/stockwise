import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { typedApi } from "../api/typed-api";
import type { InsightResponse } from "../types/generated";

export const useLatestInsights = () => {
  return useQuery({
    queryKey: ["insights", "latest"],
    queryFn: () => typedApi.insights.getLatest(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
};

export const useGenerateInsights = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (analysisType: string = "full") =>
      typedApi.insights.generate(analysisType),
    onSuccess: () => {
      // Invalidate the exact 'latest' insights key so UI components
      // using ['insights', 'latest'] will refetch immediately.
      queryClient.invalidateQueries({ queryKey: ["insights", "latest"] });
      // Also invalidate any broader insights keys as a fallback.
      queryClient.invalidateQueries({ queryKey: ["insights"] });
    },
  });
};

export const useRiskAnalysis = () => {
  return useQuery({
    queryKey: ["risk-analysis"],
    queryFn: () => typedApi.risk.getAnalysis(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useRiskMetrics = () => {
  return useQuery({
    queryKey: ["risk-metrics"],
    queryFn: () => typedApi.risk.getMetrics(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useRiskHeatmap = () => {
  return useQuery({
    queryKey: ["risk-heatmap"],
    queryFn: () => typedApi.risk.getHeatmap(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
