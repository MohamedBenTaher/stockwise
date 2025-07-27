import { useQuery } from "@tanstack/react-query";
import { typedApi } from "../api/typed-api";

import type {
  PortfolioHistoryPoint,
  PerformanceComparisonPoint,
  AllocationChartData,
  PortfolioMetrics,
} from "../types/generated";

export function usePortfolioHistory(days: number = 30) {
  return useQuery({
    queryKey: ["portfolio-history", days],
    queryFn: (): Promise<PortfolioHistoryPoint[]> =>
      typedApi.charts.getPortfolioHistory(days),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: true,
  });
}

export function usePerformanceComparison(days: number = 30) {
  return useQuery({
    queryKey: ["performance-comparison", days],
    queryFn: (): Promise<PerformanceComparisonPoint[]> =>
      typedApi.charts.getPerformanceComparison(days),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: true,
  });
}

export function useAllocationChartData() {
  return useQuery({
    queryKey: ["allocation-chart-data"],
    queryFn: (): Promise<AllocationChartData> =>
      typedApi.charts.getAllocationData(),
    staleTime: 2 * 60 * 1000, // 2 minutes
    enabled: true,
  });
}

export function usePortfolioMetrics() {
  return useQuery({
    queryKey: ["portfolio-metrics"],
    queryFn: (): Promise<PortfolioMetrics> =>
      typedApi.charts.getPortfolioMetrics(),
    staleTime: 2 * 60 * 1000, // 2 minutes
    enabled: true,
  });
}
