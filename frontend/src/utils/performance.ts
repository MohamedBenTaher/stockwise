// Performance monitoring utilities
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, number[]> = new Map();

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  // Measure component render time
  measureRender(componentName: string, renderFn: () => void) {
    const start = performance.now();
    renderFn();
    const end = performance.now();
    this.addMetric(`render_${componentName}`, end - start);
  }

  // Measure API call duration
  async measureApiCall<T>(
    endpoint: string,
    apiCall: () => Promise<T>
  ): Promise<T> {
    const start = performance.now();
    try {
      const result = await apiCall();
      const end = performance.now();
      this.addMetric(`api_${endpoint}`, end - start);
      return result;
    } catch (error) {
      const end = performance.now();
      this.addMetric(`api_${endpoint}_error`, end - start);
      throw error;
    }
  }

  // Add metric data point
  private addMetric(key: string, value: number) {
    if (!this.metrics.has(key)) {
      this.metrics.set(key, []);
    }
    const values = this.metrics.get(key)!;
    values.push(value);

    // Keep only last 100 measurements
    if (values.length > 100) {
      values.shift();
    }
  }

  // Get performance statistics
  getStats(key: string) {
    const values = this.metrics.get(key) || [];
    if (values.length === 0) return null;

    const sorted = [...values].sort((a, b) => a - b);
    return {
      count: values.length,
      min: Math.min(...values),
      max: Math.max(...values),
      avg: values.reduce((sum, val) => sum + val, 0) / values.length,
      median: sorted[Math.floor(sorted.length / 2)],
      p95: sorted[Math.floor(sorted.length * 0.95)],
    };
  }

  // Log performance summary
  logSummary() {
    console.group("🚀 StockWise Performance Metrics");
    for (const [key, values] of this.metrics.entries()) {
      if (values.length > 0) {
        const stats = this.getStats(key);
        console.log(`${key}:`, {
          avg: `${stats?.avg.toFixed(2)}ms`,
          p95: `${stats?.p95.toFixed(2)}ms`,
          count: stats?.count,
        });
      }
    }
    console.groupEnd();
  }

  // Check if performance is degrading
  checkPerformanceHealth(): { healthy: boolean; issues: string[] } {
    const issues: string[] = [];

    // Check API call times
    for (const [key, values] of this.metrics.entries()) {
      if (key.startsWith("api_") && values.length > 10) {
        const stats = this.getStats(key);
        if (stats && stats.p95 > 5000) {
          // 5 seconds
          issues.push(`API ${key} is slow (P95: ${stats.p95.toFixed(0)}ms)`);
        }
      }
    }

    // Check render times
    for (const [key, values] of this.metrics.entries()) {
      if (key.startsWith("render_") && values.length > 10) {
        const stats = this.getStats(key);
        if (stats && stats.p95 > 100) {
          // 100ms
          issues.push(
            `Component ${key} is slow to render (P95: ${stats.p95.toFixed(
              0
            )}ms)`
          );
        }
      }
    }

    return {
      healthy: issues.length === 0,
      issues,
    };
  }
}

// React hook for performance monitoring
import { useEffect } from "react";

export function usePerformanceMonitor(componentName: string) {
  const monitor = PerformanceMonitor.getInstance();

  useEffect(() => {
    const start = performance.now();

    return () => {
      const end = performance.now();
      monitor.measureRender(componentName, () => {
        // Render time is measured on unmount
      });
    };
  }, [componentName, monitor]);

  return {
    measureApiCall: monitor.measureApiCall.bind(monitor),
    getStats: monitor.getStats.bind(monitor),
    logSummary: monitor.logSummary.bind(monitor),
  };
}

// Cache performance utilities
export class CacheManager {
  private static instance: CacheManager;
  private cache: Map<string, { data: any; timestamp: number; ttl: number }> =
    new Map();

  static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager();
    }
    return CacheManager.instance;
  }

  set(key: string, data: any, ttlMs: number = 5 * 60 * 1000) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMs,
    });
  }

  get(key: string): any | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  clear() {
    this.cache.clear();
  }

  getStats() {
    const now = Date.now();
    let valid = 0;
    let expired = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        expired++;
      } else {
        valid++;
      }
    }

    return {
      total: this.cache.size,
      valid,
      expired,
      hitRate: this.cache.size > 0 ? (valid / this.cache.size) * 100 : 0,
    };
  }
}

// Development helper to monitor performance
if (process.env.NODE_ENV === "development") {
  // Log performance stats every 30 seconds
  setInterval(() => {
    const monitor = PerformanceMonitor.getInstance();
    const health = monitor.checkPerformanceHealth();

    if (!health.healthy) {
      console.warn("⚠️ Performance issues detected:", health.issues);
    }
  }, 30000);

  // Global performance monitoring
  (window as any).stockwisePerf = {
    monitor: PerformanceMonitor.getInstance(),
    cache: CacheManager.getInstance(),
    logStats: () => {
      console.group("📊 StockWise Performance Dashboard");
      PerformanceMonitor.getInstance().logSummary();
      console.log("Cache Stats:", CacheManager.getInstance().getStats());
      console.groupEnd();
    },
  };
}
