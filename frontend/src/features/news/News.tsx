import React, { useState, useMemo } from "react";
import {
  Newspaper,
  TrendingUp,
  TrendingDown,
  Clock,
  Search,
  Building,
  RefreshCw,
  Bell,
  MoreHorizontal,
  ExternalLink,
  User,
  Loader2,
  BarChart3,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useNews,
  useMarketSentiment,
  useNewsMetrics,
  useBreakingNews,
  usePortfolioNews,
  useBookmarkedNews,
  useRefreshNews,
  type NewsFilters,
} from "@/hooks/useNews";
import { BookmarkButton } from "./BookmarkButton";
import { BookmarkFloater } from "./BookmarkFloater";
import { ToastProvider } from "@/components/Toast";
import { cn } from "@/lib/utils";

export const News: React.FC = () => {
  // State management for filters
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSentiment, setSelectedSentiment] = useState<string>("all");
  const [selectedImpact, setSelectedImpact] = useState<string>("all");
  const [selectedSector, setSelectedSector] = useState<string>("all");
  const [activeTab, setActiveTab] = useState("all");

  // News filters
  const filters: NewsFilters = useMemo(() => {
    const baseFilters: NewsFilters = {};

    if (selectedSentiment !== "all") {
      baseFilters.sentiment = selectedSentiment as
        | "positive"
        | "negative"
        | "neutral";
    }
    if (selectedImpact !== "all") {
      baseFilters.impact = selectedImpact as "high" | "medium" | "low";
    }
    if (selectedSector !== "all") {
      baseFilters.sector = selectedSector;
    }
    if (searchTerm) {
      baseFilters.search_query = searchTerm;
    }
    if (activeTab === "breaking") {
      baseFilters.is_breaking = true;
    }
    if (activeTab === "portfolio") {
      baseFilters.is_portfolio_relevant = true;
    }

    return baseFilters;
  }, [
    searchTerm,
    selectedSentiment,
    selectedImpact,
    selectedSector,
    activeTab,
  ]);

  // API Hooks
  const { data: newsData } = useNews(filters);
  const { data: portfolioNews } = usePortfolioNews();
  const { data: breakingNews } = useBreakingNews();
  const { data: bookmarkedNews } = useBookmarkedNews();
  const { data: marketSentiment } = useMarketSentiment();
  const { data: newsMetrics } = useNewsMetrics();

  const refreshNews = useRefreshNews();

  // Get articles based on active tab
  const currentArticles = useMemo(() => {
    switch (activeTab) {
      case "portfolio":
        return portfolioNews || [];
      case "breaking":
        return breakingNews || [];
      case "bookmarked":
        return bookmarkedNews || [];
      default:
        return newsData?.articles || [];
    }
  }, [activeTab, newsData, portfolioNews, breakingNews, bookmarkedNews]);

  // Calculate metrics
  const metrics = useMemo(() => {
    if (newsMetrics) return newsMetrics;

    // Fallback to calculated metrics
    return {
      total_articles: currentArticles.length,
      portfolio_relevant: portfolioNews?.length || 0,
      breaking_news: breakingNews?.length || 0,
      positive_news: currentArticles.filter((a) => a.sentiment === "positive")
        .length,
      negative_news: currentArticles.filter((a) => a.sentiment === "negative")
        .length,
      neutral_news: currentArticles.filter((a) => a.sentiment === "neutral")
        .length,
      average_sentiment: 0,
      last_update: new Date().toISOString(),
    };
  }, [newsMetrics, currentArticles, portfolioNews, breakingNews]);

  // Utility functions
  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case "negative":
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <BarChart3 className="h-4 w-4 text-gray-600" />;
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return "text-green-600 bg-green-50 border-green-200";
      case "negative":
        return "text-red-600 bg-red-50 border-red-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getImpactVariant = (
    impact: string
  ): "default" | "destructive" | "outline" => {
    switch (impact) {
      case "high":
        return "destructive";
      case "medium":
        return "outline";
      default:
        return "default";
    }
  };

  const handleRefresh = async () => {
    try {
      await refreshNews.mutateAsync();
    } catch (error) {
      console.error("Failed to refresh news:", error);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffHours > 24) {
      return `${Math.floor(diffHours / 24)}d ago`;
    } else if (diffHours > 0) {
      return `${diffHours}h ago`;
    } else {
      return `${diffMinutes}m ago`;
    }
  };

  return (
    <ToastProvider>
      <div className="min-h-screen relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 opacity-[0.02]">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern
                  id="grid-news"
                  width="40"
                  height="40"
                  patternUnits="userSpaceOnUse"
                >
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
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-3xl font-semibold text-foreground mb-2">
                  Market News
                </h1>
                <p className="text-muted-foreground">
                  AI-powered news analysis tailored to your portfolio
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={refreshNews.isPending}
                >
                  {refreshNews.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <RefreshCw className="h-4 w-4 mr-2" />
                  )}
                  Refresh
                </Button>
                <Button variant="outline" size="sm">
                  <Bell className="h-4 w-4 mr-2" />
                  Alerts
                </Button>
              </div>
            </div>

            {/* News Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="glass-card p-4">
                <div className="text-2xl font-bold text-foreground">
                  {metrics.total_articles}
                </div>
                <div className="text-xs text-muted-foreground">
                  Total Articles
                </div>
              </div>
              <div className="glass-card p-4">
                <div className="text-2xl font-bold text-blue-400">
                  {metrics.portfolio_relevant}
                </div>
                <div className="text-xs text-muted-foreground">
                  Portfolio Related
                </div>
              </div>
              <div className="glass-card p-4">
                <div className="text-2xl font-bold text-orange-400">
                  {metrics.breaking_news}
                </div>
                <div className="text-xs text-muted-foreground">
                  Breaking News
                </div>
              </div>
              <div className="glass-card p-4">
                <div className="text-2xl font-bold text-green-400">
                  {metrics.positive_news}
                </div>
                <div className="text-xs text-muted-foreground">Positive</div>
              </div>
              <div className="glass-card p-4">
                <div className="text-2xl font-bold text-red-400">
                  {metrics.negative_news}
                </div>
                <div className="text-xs text-muted-foreground">Negative</div>
              </div>
            </div>
          </div>

          {/* Market Sentiment Overview */}
          <div className="relative">
            <div className="absolute inset-0 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10" />
            <div className="relative p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-foreground">
                  Market Sentiment
                </h2>
                {marketSentiment && (
                  <Badge
                    variant={
                      marketSentiment.overall === "bullish"
                        ? "default"
                        : "destructive"
                    }
                  >
                    {marketSentiment.overall.toUpperCase()}
                  </Badge>
                )}
              </div>

              {marketSentiment ? (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {marketSentiment.sectors_analysis.map((sector) => (
                    <div
                      key={sector.sector}
                      className="bg-white/5 backdrop-blur-sm border border-white/20 rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-foreground">
                          {sector.sector}
                        </span>
                        {getSentimentIcon(sector.sentiment)}
                      </div>
                      <div className="text-lg font-bold text-foreground mb-1">
                        {sector.score > 0 ? "+" : ""}
                        {(sector.score * 100).toFixed(0)}%
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {sector.news_count} articles
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Loading market sentiment...
                </div>
              )}
            </div>
          </div>

          {/* Filters and Search */}
          <div className="relative">
            <div className="absolute inset-0 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10" />
            <div className="relative p-6">
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search news, tickers, or topics..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-white/5 backdrop-blur-sm border border-white/20"
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Select
                    value={selectedSentiment}
                    onValueChange={setSelectedSentiment}
                  >
                    <SelectTrigger className="w-[130px] bg-white/5 backdrop-blur-sm border border-white/20">
                      <SelectValue placeholder="Sentiment" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Sentiment</SelectItem>
                      <SelectItem value="positive">Positive</SelectItem>
                      <SelectItem value="negative">Negative</SelectItem>
                      <SelectItem value="neutral">Neutral</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select
                    value={selectedImpact}
                    onValueChange={setSelectedImpact}
                  >
                    <SelectTrigger className="w-[120px] bg-white/5 backdrop-blur-sm border border-white/20">
                      <SelectValue placeholder="Impact" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Impact</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select
                    value={selectedSector}
                    onValueChange={setSelectedSector}
                  >
                    <SelectTrigger className="w-[130px] bg-white/5 backdrop-blur-sm border border-white/20">
                      <SelectValue placeholder="Sector" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Sectors</SelectItem>
                      <SelectItem value="Technology">Technology</SelectItem>
                      <SelectItem value="Healthcare">Healthcare</SelectItem>
                      <SelectItem value="Financial">Financial</SelectItem>
                      <SelectItem value="Energy">Energy</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* News Tabs */}
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="bg-white/5 backdrop-blur-sm border border-white/20">
                  <TabsTrigger value="all">All News</TabsTrigger>
                  <TabsTrigger value="portfolio">
                    Portfolio ({metrics.portfolio_relevant})
                  </TabsTrigger>
                  <TabsTrigger value="breaking">
                    Breaking ({metrics.breaking_news})
                  </TabsTrigger>
                  <TabsTrigger value="bookmarked">
                    Bookmarked ({bookmarkedNews?.length || 0})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value={activeTab} className="mt-6">
                  {/* News Feed */}
                  <div className="space-y-4">
                    {currentArticles.length === 0 ? (
                      <div className="text-center py-12">
                        <Newspaper className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
                        <h3 className="text-lg font-medium text-foreground mb-2">
                          No News Found
                        </h3>
                        <p className="text-muted-foreground">
                          Try adjusting your filters or search terms.
                        </p>
                      </div>
                    ) : (
                      currentArticles.map((article) => (
                        <Card
                          key={article.id}
                          className="bg-white/5 backdrop-blur-sm border border-white/20 hover:bg-white/10 transition-all"
                        >
                          <CardContent className="p-6">
                            <div className="flex items-start space-x-4">
                              {article.image_url && (
                                <img
                                  src={article.image_url || ""}
                                  alt=""
                                  className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
                                />
                              )}

                              <div className="flex-1 space-y-3">
                                {/* Article Header */}
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center space-x-2 mb-2">
                                      {article.is_breaking && (
                                        <Badge
                                          variant="destructive"
                                          className="text-xs"
                                        >
                                          BREAKING
                                        </Badge>
                                      )}
                                      <Badge
                                        variant={getImpactVariant(
                                          article.impact
                                        )}
                                        className="text-xs"
                                      >
                                        {article.impact.toUpperCase()} IMPACT
                                      </Badge>
                                      <div
                                        className={cn(
                                          "flex items-center space-x-1 px-2 py-1 rounded text-xs border",
                                          getSentimentColor(article.sentiment)
                                        )}
                                      >
                                        {getSentimentIcon(article.sentiment)}
                                        <span>{article.sentiment}</span>
                                      </div>
                                    </div>

                                    <h3 className="text-lg font-semibold text-foreground mb-2 line-clamp-2">
                                      {article.title}
                                    </h3>

                                    <p className="text-muted-foreground text-sm line-clamp-2 mb-3">
                                      {article.summary}
                                    </p>
                                  </div>

                                  {/* Article Actions */}
                                  <div className="flex items-center space-x-2">
                                    {/* Bookmark Button */}
                                    <BookmarkButton
                                      articleId={article.id}
                                      isBookmarked={
                                        article.is_bookmarked || false
                                      }
                                      size="sm"
                                      variant="ghost"
                                    />

                                    {/* More Actions */}
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="sm">
                                          <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end">
                                        <DropdownMenuItem
                                          onClick={() => {
                                            console.log(
                                              `Opening article: ${article.url}`
                                            );
                                            window.open(
                                              article.url,
                                              "_blank",
                                              "noopener,noreferrer"
                                            );
                                          }}
                                          className="cursor-pointer"
                                        >
                                          <ExternalLink className="h-4 w-4 mr-2" />
                                          Read Full Article
                                        </DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </div>
                                </div>

                                {/* Article Meta */}
                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                  <div className="flex items-center space-x-4">
                                    <div className="flex items-center space-x-1">
                                      <Building className="h-3 w-3" />
                                      <span>{article.source}</span>
                                    </div>
                                    {article.author && (
                                      <div className="flex items-center space-x-1">
                                        <User className="h-3 w-3" />
                                        <span>{article.author}</span>
                                      </div>
                                    )}
                                    <div className="flex items-center space-x-1">
                                      <Clock className="h-3 w-3" />
                                      <span>
                                        {formatTimeAgo(article.published_at)}
                                      </span>
                                    </div>
                                  </div>

                                  <div className="flex items-center space-x-2">
                                    {article.related_tickers.length > 0 && (
                                      <div className="flex items-center space-x-1">
                                        {article.related_tickers
                                          .slice(0, 3)
                                          .map((ticker: string) => (
                                            <Badge
                                              key={ticker}
                                              variant="outline"
                                              className="text-xs px-1 py-0"
                                            >
                                              {ticker}
                                            </Badge>
                                          ))}
                                      </div>
                                    )}
                                    <span className="text-xs">
                                      Relevance:{" "}
                                      {(article.relevance_score * 100).toFixed(
                                        0
                                      )}
                                      %
                                    </span>
                                  </div>
                                </div>

                                {/* Tags */}
                                {article.tags.length > 0 && (
                                  <div className="flex flex-wrap gap-1">
                                    {article.tags
                                      .slice(0, 4)
                                      .map((tag: string) => (
                                        <Badge
                                          key={tag}
                                          variant="secondary"
                                          className="text-xs"
                                        >
                                          #{tag}
                                        </Badge>
                                      ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>

        {/* Floating Bookmark Widget */}
        <BookmarkFloater
          onNavigateToBookmarks={() => setActiveTab("bookmarked")}
        />
      </div>
    </ToastProvider>
  );
};
