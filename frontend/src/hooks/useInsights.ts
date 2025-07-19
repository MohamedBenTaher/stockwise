import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { insightsApi } from "../services/api";
import type { InsightResponse } from "../types";

export const useLatestInsights = () => {
  return useQuery({
    queryKey: ["insights", "latest"],
    queryFn: insightsApi.getLatestInsights,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useGenerateInsights = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (analysisType: string = "full") =>
      insightsApi.generateInsights(analysisType),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["insights"] });
    },
  });
};
