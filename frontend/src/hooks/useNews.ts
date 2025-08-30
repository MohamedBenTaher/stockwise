import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api/api";

// Types for News API (updated to match backend)
interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  content?: string;
  url: string;
  source: string;
  author?: string;
  published_at: string;
  sentiment: "positive" | "negative" | "neutral";
  sentiment_score: number;
  impact: "high" | "medium" | "low";
  relevance_score: number;
  tags: string[];
  related_tickers: string[];
  sector?: string;
  event_type?: "earnings" | "merger" | "regulation" | "market" | "general";
  is_breaking?: boolean;
  is_bookmarked?: boolean;
  image_url?: string;
  created_at: string;
  updated_at: string;
}

interface NewsFilters {
  sentiment?: "positive" | "negative" | "neutral";
  impact?: "high" | "medium" | "low";
  event_type?: "earnings" | "merger" | "regulation" | "market" | "general";
  sector?: string;
  tickers?: string;
  sources?: string;
  is_breaking?: boolean;
  is_portfolio_relevant?: boolean;
  search_query?: string;
  page?: number;
  page_size?: number;
}

interface SectorSentiment {
  sector: string;
  sentiment: "positive" | "negative" | "neutral";
  score: number;
  news_count: number;
  trend: "improving" | "declining" | "stable";
}

interface MarketSentiment {
  overall: "bullish" | "bearish" | "neutral";
  score: number;
  trend: "improving" | "declining" | "stable";
  confidence: number;
  sectors_analysis: SectorSentiment[];
  last_updated: string;
}

interface NewsMetrics {
  total_articles: number;
  portfolio_relevant: number;
  breaking_news: number;
  positive_news: number;
  negative_news: number;
  neutral_news: number;
  average_sentiment: number;
  last_update: string;
}

interface NewsResponse {
  articles: NewsArticle[];
  total_count: number;
  page: number;
  page_size: number;
  has_next: boolean;
  metrics: NewsMetrics;
  market_sentiment: MarketSentiment;
}

// Fetch all news with filters
export const useNews = (filters: NewsFilters = {}) => {
  return useQuery({
    queryKey: ["news", filters],
    queryFn: async (): Promise<NewsResponse> => {
      const params = new URLSearchParams();

      if (filters.sentiment) params.append("sentiment", filters.sentiment);
      if (filters.impact) params.append("impact", filters.impact);
      if (filters.event_type) params.append("event_type", filters.event_type);
      if (filters.sector) params.append("sector", filters.sector);
      if (filters.tickers) params.append("tickers", filters.tickers);
      if (filters.sources) params.append("sources", filters.sources);
      if (filters.is_breaking !== undefined)
        params.append("is_breaking", filters.is_breaking.toString());
      if (filters.is_portfolio_relevant !== undefined)
        params.append(
          "is_portfolio_relevant",
          filters.is_portfolio_relevant.toString()
        );
      if (filters.search_query)
        params.append("search_query", filters.search_query);
      if (filters.page) params.append("page", filters.page.toString());
      if (filters.page_size)
        params.append("page_size", filters.page_size.toString());

      // Use dev endpoint for development (no auth required)
      const response = await api.get(`/news/dev?${params.toString()}`);
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 10 * 60 * 1000, // 10 minutes
  });
};

// Fetch portfolio-relevant news
export const usePortfolioNews = () => {
  return useQuery({
    queryKey: ["news", "portfolio"],
    queryFn: async (): Promise<NewsArticle[]> => {
      const response = await api.get("/news/dev?is_portfolio_relevant=true");
      return response.data.articles;
    },
    staleTime: 5 * 60 * 1000,
    refetchInterval: 10 * 60 * 1000,
  });
};

// Fetch breaking news
export const useBreakingNews = () => {
  return useQuery({
    queryKey: ["news", "breaking"],
    queryFn: async (): Promise<NewsArticle[]> => {
      const response = await api.get("/news/dev?is_breaking=true");
      return response.data.articles;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes for breaking news
    refetchInterval: 5 * 60 * 1000, // 5 minutes
  });
};

// Fetch market sentiment
export const useMarketSentiment = () => {
  return useQuery({
    queryKey: ["market-sentiment"],
    queryFn: async (): Promise<MarketSentiment> => {
      const response = await api.get("/news/sentiment");
      return response.data;
    },
    staleTime: 15 * 60 * 1000, // 15 minutes
    refetchInterval: 30 * 60 * 1000, // 30 minutes
  });
};

// Fetch news metrics
export const useNewsMetrics = () => {
  return useQuery({
    queryKey: ["news-metrics"],
    queryFn: async (): Promise<NewsMetrics> => {
      const response = await api.get("/news/metrics");
      return response.data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchInterval: 15 * 60 * 1000, // 15 minutes
  });
};

// Search news
export const useNewsSearch = (query: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ["news-search", query],
    queryFn: async (): Promise<NewsArticle[]> => {
      if (!query.trim()) return [];
      const response = await api.get(
        `/news/dev?search_query=${encodeURIComponent(query)}`
      );
      return response.data.articles;
    },
    enabled: enabled && query.length >= 2,
    staleTime: 10 * 60 * 1000,
  });
};

// Get news by ticker
export const useTickerNews = (ticker: string) => {
  return useQuery({
    queryKey: ["news", "ticker", ticker],
    queryFn: async (): Promise<NewsArticle[]> => {
      const response = await api.get(`/news/dev?tickers=${ticker}`);
      return response.data.articles;
    },
    enabled: !!ticker,
    staleTime: 5 * 60 * 1000,
  });
};

// Get trending news
export const useTrendingNews = () => {
  return useQuery({
    queryKey: ["news", "trending"],
    queryFn: async (): Promise<NewsArticle[]> => {
      const response = await api.get("/news/trending");
      return response.data;
    },
    staleTime: 15 * 60 * 1000,
    refetchInterval: 20 * 60 * 1000,
  });
};

// Get sector news
export const useSectorNews = (sector: string) => {
  return useQuery({
    queryKey: ["news", "sector", sector],
    queryFn: async (): Promise<NewsArticle[]> => {
      const response = await api.get(`/news/sectors/${sector}`);
      return response.data;
    },
    enabled: !!sector,
    staleTime: 10 * 60 * 1000,
  });
};

// Analyze sentiment of custom text
export const useAnalyzeSentiment = () => {
  return useMutation({
    mutationFn: async (text: string) => {
      const response = await api.post("/news/analyze-sentiment", { text });
      return response.data;
    },
  });
};

// Bookmark/unbookmark news article
export const useBookmarkNews = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      articleId,
      bookmarked,
    }: {
      articleId: string;
      bookmarked: boolean;
    }) => {
      const response = await api.post(`/news/${articleId}/bookmark`, {
        bookmarked,
      });
      return response.data;
    },
    onSuccess: () => {
      // Invalidate all news-related queries to refresh bookmark status
      queryClient.invalidateQueries({ queryKey: ["news"] });
      queryClient.invalidateQueries({ queryKey: ["news-metrics"] });
      // Force refetch of bookmarked news specifically
      queryClient.refetchQueries({ queryKey: ["news", "bookmarked"] });
    },
  });
};

// Get bookmarked news
export const useBookmarkedNews = () => {
  return useQuery({
    queryKey: ["news", "bookmarked"],
    queryFn: async (): Promise<NewsArticle[]> => {
      const response = await api.get("/news/bookmarked");
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
  });
};

// Refresh news data
export const useRefreshNews = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await api.post("/news/refresh");
      return response.data;
    },
    onSuccess: () => {
      // Invalidate all news-related queries
      queryClient.invalidateQueries({ queryKey: ["news"] });
      queryClient.invalidateQueries({ queryKey: ["market-sentiment"] });
      queryClient.invalidateQueries({ queryKey: ["news-metrics"] });
    },
  });
};

// Export types for use in components
export type {
  NewsArticle,
  NewsFilters,
  MarketSentiment,
  NewsMetrics,
  NewsResponse,
  SectorSentiment,
};
