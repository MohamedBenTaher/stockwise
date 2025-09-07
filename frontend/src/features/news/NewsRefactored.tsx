"use client"

import type React from "react"
import { useMemo } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  useNews,
  useMarketSentiment,
  useNewsMetrics,
  useBreakingNews,
  usePortfolioNews,
  useBookmarkedNews,
  useRefreshNews,
} from "@/hooks/useNews"
import { BookmarkFloater } from "../BookmarkFloater"
import { ToastProvider } from "@/components/Toast"
import { useNewsFilters } from "@/hooks/useNewsFilters"
import { NewsHeader } from "./NewsHeader"
import { NewsMetrics } from "./NewsMetrics"
import { MarketSentiment } from "./MarketSentiment"
import { NewsFilters } from "./NewsFilters"
import { NewsFeed } from "./NewsFeed"

/**
 * Enhanced News Dashboard Component
 *
 * A comprehensive news dashboard that displays market news with advanced filtering,
 * sentiment analysis, and portfolio-specific insights. The component has been
 * refactored for better maintainability and performance.
 *
 * Features:
 * - Real-time news feed with AI-powered analysis
 * - Market sentiment tracking across sectors
 * - Portfolio-relevant news filtering
 * - Breaking news alerts
 * - Bookmark functionality
 * - Advanced search and filtering capabilities
 */
export const News: React.FC = () => {
  // Custom hook for managing filter state
  const {
    searchTerm,
    selectedSentiment,
    selectedImpact,
    selectedSector,
    activeTab,
    setSearchTerm,
    setSelectedSentiment,
    setSelectedImpact,
    setSelectedSector,
    setActiveTab,
    filters,
  } = useNewsFilters()

  // API Hooks - memoized to prevent unnecessary re-renders
  const { data: newsData } = useNews(filters)
  const { data: portfolioNews } = usePortfolioNews()
  const { data: breakingNews } = useBreakingNews()
  const { data: bookmarkedNews } = useBookmarkedNews()
  const { data: marketSentiment } = useMarketSentiment()
  const { data: newsMetrics } = useNewsMetrics()
  const refreshNews = useRefreshNews()

  // Memoized article selection based on active tab
  const currentArticles = useMemo(() => {
    switch (activeTab) {
      case "portfolio":
        return portfolioNews || []
      case "breaking":
        return breakingNews || []
      case "bookmarked":
        return bookmarkedNews || []
      default:
        return newsData?.articles || []
    }
  }, [activeTab, newsData, portfolioNews, breakingNews, bookmarkedNews])

  // Memoized metrics calculation with fallback
  const metrics = useMemo(() => {
    if (newsMetrics) return newsMetrics

    // Fallback to calculated metrics when API data is unavailable
    return {
      total_articles: currentArticles.length,
      portfolio_relevant: portfolioNews?.length || 0,
      breaking_news: breakingNews?.length || 0,
      positive_news: currentArticles.filter((a) => a.sentiment === "positive").length,
      negative_news: currentArticles.filter((a) => a.sentiment === "negative").length,
      neutral_news: currentArticles.filter((a) => a.sentiment === "neutral").length,
      average_sentiment: 0,
      last_update: new Date().toISOString(),
    }
  }, [newsMetrics, currentArticles, portfolioNews, breakingNews])

  // Optimized refresh handler
  const handleRefresh = async () => {
    try {
      await refreshNews.mutateAsync()
    } catch (error) {
      console.error("Failed to refresh news:", error)
    }
  }

  return (
    <ToastProvider>
      <div className="min-h-screen relative overflow-hidden">
        {/* Background Pattern - Optimized for performance */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 opacity-[0.02]">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid-news" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path
                    d="M 40 0 L 0 0 0 40"
                    fill="none"
                    stroke="hsl(var(--foreground))"
                    strokeWidth="1"
                    strokeDasharray="2,2"
                  />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid-news)" />
            </svg>
          </div>
        </div>

        <div className="relative z-10 space-y-8">
          {/* Page Header */}
          <div className="glass-card p-6">
            <NewsHeader onRefresh={handleRefresh} isRefreshing={refreshNews.isPending} />
            <NewsMetrics metrics={metrics} />
          </div>

          {/* Market Sentiment Overview */}
          <MarketSentiment marketSentiment={marketSentiment} />

          {/* Filters and News Content */}
          <div className="relative">
            <div className="absolute inset-0 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10" />
            <div className="relative p-6">
              <NewsFilters
                searchTerm={searchTerm}
                selectedSentiment={selectedSentiment}
                selectedImpact={selectedImpact}
                selectedSector={selectedSector}
                onSearchChange={setSearchTerm}
                onSentimentChange={setSelectedSentiment}
                onImpactChange={setSelectedImpact}
                onSectorChange={setSelectedSector}
              />

              {/* News Tabs */}
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="bg-white/5 backdrop-blur-sm border border-white/20">
                  <TabsTrigger value="all">All News</TabsTrigger>
                  <TabsTrigger value="portfolio">Portfolio ({metrics.portfolio_relevant})</TabsTrigger>
                  <TabsTrigger value="breaking">Breaking ({metrics.breaking_news})</TabsTrigger>
                  <TabsTrigger value="bookmarked">Bookmarked ({bookmarkedNews?.length || 0})</TabsTrigger>
                </TabsList>

                <TabsContent value={activeTab} className="mt-6">
                  <NewsFeed articles={currentArticles} />
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>

        {/* Floating Bookmark Widget */}
        <BookmarkFloater onNavigateToBookmarks={() => setActiveTab("bookmarked")} />
      </div>
    </ToastProvider>
  )
}
