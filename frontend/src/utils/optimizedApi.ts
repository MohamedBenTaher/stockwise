import { CacheManager, PerformanceMonitor } from './performance';

// Enhanced API client with intelligent caching and performance monitoring
export class OptimizedApiClient {
  private baseURL: string;
  private cache: CacheManager;
  private monitor: PerformanceMonitor;
  private requestDeduplication: Map<string, Promise<any>> = new Map();

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.cache = CacheManager.getInstance();
    this.monitor = PerformanceMonitor.getInstance();
  }

  private getCacheKey(url: string, options?: RequestInit): string {
    const method = options?.method || 'GET';
    const body = options?.body ? JSON.stringify(options.body) : '';
    return `${method}:${url}:${body}`;
  }

  private shouldCache(url: string, method: string = 'GET'): boolean {
    // Cache GET requests for data that doesn't change frequently
    if (method !== 'GET') return false;
    
    const cacheableEndpoints = [
      '/stocks/popular',
      '/stocks/search',
      '/holdings',
      '/insights',
      '/portfolio/summary',
      '/charts/',
    ];

    return cacheableEndpoints.some(endpoint => url.includes(endpoint));
  }

  private getTTL(url: string): number {
    // Different TTL for different types of data
    if (url.includes('/stocks/popular')) return 24 * 60 * 60 * 1000; // 24 hours
    if (url.includes('/stocks/search')) return 60 * 60 * 1000; // 1 hour
    if (url.includes('/portfolio/summary')) return 5 * 60 * 1000; // 5 minutes
    if (url.includes('/charts/')) return 10 * 60 * 1000; // 10 minutes
    if (url.includes('/insights')) return 15 * 60 * 1000; // 15 minutes
    return 5 * 60 * 1000; // Default 5 minutes
  }

  async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const cacheKey = this.getCacheKey(endpoint, options);
    const method = options?.method || 'GET';

    // Check cache first
    if (this.shouldCache(endpoint, method)) {
      const cachedData = this.cache.get(cacheKey);
      if (cachedData) {
        return cachedData;
      }
    }

    // Deduplicate identical requests
    if (this.requestDeduplication.has(cacheKey)) {
      return this.requestDeduplication.get(cacheKey)!;
    }

    const requestPromise = this.monitor.measureApiCall(
      endpoint,
      async () => {
        const response = await fetch(url, {
          ...options,
          headers: {
            'Content-Type': 'application/json',
            ...options?.headers,
          },
        });

        if (!response.ok) {
          throw new Error(`API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        // Cache successful GET requests
        if (this.shouldCache(endpoint, method)) {
          this.cache.set(cacheKey, data, this.getTTL(endpoint));
        }

        return data;
      }
    );

    // Store the promise for deduplication
    this.requestDeduplication.set(cacheKey, requestPromise);

    try {
      const result = await requestPromise;
      return result;
    } finally {
      // Clean up the promise from deduplication map
      this.requestDeduplication.delete(cacheKey);
    }
  }

  // Convenience methods
  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  // Cache management
  clearCache() {
    this.cache.clear();
  }

  invalidateCachePattern(pattern: string) {
    // This would require implementing pattern matching in CacheManager
    // For now, we'll clear all cache
    this.cache.clear();
  }
}

// Create the optimized API instance
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
export const optimizedApi = new OptimizedApiClient(API_BASE_URL);

// Enhanced React Query configuration with optimized defaults
export const queryClientConfig = {
  defaultOptions: {
    queries: {
      // Stale time - how long data is considered fresh
      staleTime: 5 * 60 * 1000, // 5 minutes
      // Cache time - how long unused data stays in cache
      cacheTime: 10 * 60 * 1000, // 10 minutes
      // Retry configuration
      retry: (failureCount: number, error: any) => {
        // Don't retry on 4xx errors (client errors)
        if (error?.status >= 400 && error?.status < 500) {
          return false;
        }
        // Retry up to 3 times for other errors
        return failureCount < 3;
      },
      retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
      // Background refetch settings
      refetchOnWindowFocus: false, // Don't refetch on window focus by default
      refetchOnReconnect: true, // Refetch when connection is restored
      refetchOnMount: true, // Refetch when component mounts
    },
    mutations: {
      retry: 1, // Retry mutations once
      retryDelay: 1000,
    },
  },
};

// Performance-optimized query keys
export const queryKeys = {
  // Portfolio queries
  portfolio: ['portfolio'] as const,
  portfolioSummary: () => [...queryKeys.portfolio, 'summary'] as const,
  
  // Holdings queries
  holdings: ['holdings'] as const,
  holdingsList: () => [...queryKeys.holdings, 'list'] as const,
  holding: (id: string) => [...queryKeys.holdings, id] as const,
  
  // Stocks queries
  stocks: ['stocks'] as const,
  stockSearch: (query: string) => [...queryKeys.stocks, 'search', query] as const,
  stockPopular: () => [...queryKeys.stocks, 'popular'] as const,
  stockPrice: (ticker: string) => [...queryKeys.stocks, 'price', ticker] as const,
  
  // Charts queries
  charts: ['charts'] as const,
  portfolioHistory: (days: number) => [...queryKeys.charts, 'portfolio-history', days] as const,
  performanceComparison: (period: string) => [...queryKeys.charts, 'performance-comparison', period] as const,
  allocationData: () => [...queryKeys.charts, 'allocation'] as const,
  
  // Insights queries
  insights: ['insights'] as const,
  latestInsights: () => [...queryKeys.insights, 'latest'] as const,
  
  // News queries
  news: ['news'] as const,
  latestNews: () => [...queryKeys.news, 'latest'] as const,
} as const;
