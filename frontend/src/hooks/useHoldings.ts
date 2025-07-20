import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  typedApi,
  type HoldingCreate,
  type HoldingUpdate,
} from "../api/typed-api";

export const useHoldings = () => {
  return useQuery({
    queryKey: ["holdings"],
    queryFn: () => typedApi.holdings.getAll(),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useCreateHolding = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (holding: HoldingCreate) => typedApi.holdings.create(holding),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["holdings"] });
      queryClient.invalidateQueries({ queryKey: ["portfolio-summary"] });
      queryClient.invalidateQueries({ queryKey: ["allocation-data"] });
    },
  });
};

export const useUpdateHolding = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, holding }: { id: number; holding: HoldingUpdate }) =>
      typedApi.holdings.update(id, holding),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["holdings"] });
      queryClient.invalidateQueries({ queryKey: ["portfolio-summary"] });
      queryClient.invalidateQueries({ queryKey: ["allocation-data"] });
    },
  });
};

export const useDeleteHolding = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => typedApi.holdings.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["holdings"] });
      queryClient.invalidateQueries({ queryKey: ["portfolio-summary"] });
      queryClient.invalidateQueries({ queryKey: ["allocation-data"] });
    },
  });
};

export const usePortfolioSummary = () => {
  return useQuery({
    queryKey: ["portfolio-summary"],
    queryFn: () => typedApi.holdings.getPortfolioSummary(),
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

export const useAllocationData = () => {
  return useQuery({
    queryKey: ["allocation-data"],
    queryFn: () => typedApi.holdings.getAllocationData(),
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};
