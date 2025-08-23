import React from "react";
import { useNavigate } from "react-router-dom";
import {
  TrendingUp,
  DollarSign,
  Briefcase,
  PieChart,
  AlertCircle,
  Loader2,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { Button } from "./ui/button";
import { Alert, AlertDescription } from "./ui/alert";
import { Badge } from "./ui/badge";
import {
  usePortfolioSummary,
  useHoldings,
  useAllocationData,
} from "../hooks/useHoldings";
import { useLatestInsights } from "../hooks/useInsights";
import type { Holding } from "../types/generated";

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  // Fetch data using our typed hooks
  const {
    data: portfolioSummary,
    isLoading: portfolioLoading,
    error: portfolioError,
  } = usePortfolioSummary();

  const {
    data: holdings,
    isLoading: holdingsLoading,
    error: holdingsError,
  } = useHoldings();

  const { data: insights, isLoading: insightsLoading } = useLatestInsights();

  const { data: allocationData } = useAllocationData();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatPercentage = (percentage: number) => {
    const sign = percentage >= 0 ? "+" : "";
    return `${sign}${percentage.toFixed(2)}%`;
  };

  // Calculate top performers from holdings data
  const getTopPerformers = (holdings: Holding[]): Holding[] => {
    if (!holdings || holdings.length === 0) return [];

    return [...holdings]
      .sort((a, b) => b.profit_loss_percentage - a.profit_loss_percentage)
      .slice(0, 5);
  };

  // Calculate worst performers for additional insight
  const getWorstPerformers = (holdings: Holding[]): Holding[] => {
    if (!holdings || holdings.length === 0) return [];

    return [...holdings]
      .sort((a, b) => a.profit_loss_percentage - b.profit_loss_percentage)
      .slice(0, 3);
  };

  const loading = portfolioLoading || holdingsLoading;
  const error = portfolioError || holdingsError;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading dashboard...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome to your portfolio overview</p>
        </div>

        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load dashboard data. Please try again.
            <Button
              variant="outline"
              size="sm"
              className="ml-2"
              onClick={() => window.location.reload()}
            >
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const topPerformers = holdings ? getTopPerformers(holdings) : [];
  const worstPerformers = holdings ? getWorstPerformers(holdings) : [];
  const hasHoldings = holdings && holdings.length > 0;

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Pattern - similar to landing page */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 opacity-[0.02]">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern
                id="grid"
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
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>
      </div>

      <div className="relative z-10 space-y-8">
        {/* Page Header with glass morphism */}
        <div className="relative">
          <div className="absolute inset-0 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10" />
          <div className="relative p-6">
            <h1 className="text-3xl font-semibold text-foreground">
              Dashboard
            </h1>
            <p className="text-muted-foreground mt-2">
              Welcome to your portfolio overview
            </p>
          </div>
        </div>

        {/* Portfolio Summary Cards with glass morphism */}
        {portfolioSummary ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="relative group">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/20" />
              <div className="relative p-6">
                <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Total Value
                  </h3>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="text-2xl font-bold text-foreground">
                  {formatCurrency(portfolioSummary.total_value)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {hasHoldings ? "Portfolio value" : "No holdings yet"}
                </p>
              </div>
            </div>

            <div className="relative group">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/20" />
              <div className="relative p-6">
                <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Total P/L
                  </h3>
                  {portfolioSummary.total_profit_loss >= 0 ? (
                    <ArrowUpRight className="h-4 w-4 text-green-600" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4 text-red-600" />
                  )}
                </div>
                <div
                  className={`text-2xl font-bold ${
                    portfolioSummary.total_profit_loss >= 0
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {formatCurrency(portfolioSummary.total_profit_loss)}
                </div>
                <p
                  className={`text-xs mt-1 ${
                    portfolioSummary.total_profit_loss >= 0
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {formatPercentage(
                    portfolioSummary.total_profit_loss_percentage
                  )}
                </p>
              </div>
            </div>

            <div className="relative group">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/20" />
              <div className="relative p-6">
                <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Holdings
                  </h3>
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="text-2xl font-bold text-foreground">
                  {portfolioSummary.holdings_count}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {portfolioSummary.holdings_count === 1 ? "Asset" : "Assets"}
                </p>
              </div>
            </div>

            <div className="relative group">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/20" />
              <div className="relative p-6">
                <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Total Cost
                  </h3>
                  <PieChart className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="text-2xl font-bold text-foreground">
                  {formatCurrency(portfolioSummary.total_cost)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Initial investment
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="relative">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/20 animate-pulse" />
                <div className="relative p-6">
                  <div className="h-4 bg-white/20 rounded w-1/2 mb-4"></div>
                  <div className="h-8 bg-white/20 rounded w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Performance and Actions with glass morphism */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Performers */}
          <div className="relative">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/20" />
            <div className="relative p-6">
              <div className="pb-4">
                <h3 className="flex items-center text-lg font-semibold text-foreground">
                  <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
                  Top Performers
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {hasHoldings
                    ? "Your best performing assets"
                    : "No holdings to display"}
                </p>
              </div>
              <div className="space-y-3">
                {topPerformers.length > 0 ? (
                  topPerformers.map((holding) => (
                    <div
                      key={holding.id}
                      className="flex items-center justify-between p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all duration-200"
                    >
                      <div>
                        <p className="font-medium text-foreground">
                          {holding.ticker}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {formatCurrency(holding.total_value)} •{" "}
                          {holding.quantity} shares
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge
                          variant={
                            holding.profit_loss_percentage >= 0
                              ? "default"
                              : "destructive"
                          }
                          className="text-xs bg-white/10 backdrop-blur-sm"
                        >
                          {formatPercentage(holding.profit_loss_percentage)}
                        </Badge>
                        <p className="text-sm text-muted-foreground mt-1">
                          {formatCurrency(holding.profit_loss)}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Briefcase className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                    <p>Add some holdings to see performance</p>
                    <Button
                      className="mt-3 bg-primary/20 backdrop-blur-sm border border-white/20 hover:bg-primary/30"
                      onClick={() => navigate("/dashboard/holdings/add")}
                    >
                      Add Holding
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="relative">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/20" />
            <div className="relative p-6">
              <div className="pb-4">
                <h3 className="text-lg font-semibold text-foreground">
                  Quick Actions
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Manage your portfolio and get insights
                </p>
              </div>
              <div className="space-y-3">
                <Button
                  className="w-full bg-primary/20 backdrop-blur-sm border border-white/20 hover:bg-primary/30 text-foreground"
                  onClick={() => navigate("/dashboard/holdings/add")}
                >
                  <DollarSign className="h-4 w-4 mr-2" />
                  Add New Holding
                </Button>
                <Button
                  variant="secondary"
                  className="w-full bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 text-foreground"
                  onClick={() => navigate("/dashboard/insights")}
                  disabled={!hasHoldings}
                >
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Generate AI Insights
                </Button>
                <Button
                  variant="secondary"
                  className="w-full bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 text-foreground"
                  onClick={() => navigate("/dashboard/risk")}
                  disabled={!hasHoldings}
                >
                  <AlertCircle className="h-4 w-4 mr-2" />
                  View Risk Analysis
                </Button>
                <Button
                  variant="outline"
                  className="w-full bg-transparent backdrop-blur-sm border border-white/20 hover:bg-white/5 text-foreground"
                  onClick={() => navigate("/dashboard/holdings")}
                >
                  <Briefcase className="h-4 w-4 mr-2" />
                  Manage Holdings
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Insights and Recent Activity with glass morphism */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* AI Insights Preview */}
          <div className="relative">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/20" />
            <div className="relative p-6">
              <div className="pb-4">
                <h3 className="text-lg font-semibold text-foreground">
                  Latest AI Insights
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {insightsLoading
                    ? "Generating insights..."
                    : "AI-powered portfolio analysis"}
                </p>
              </div>
              <div>
                {insightsLoading ? (
                  <div className="flex items-center space-x-2 py-4">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm text-muted-foreground">
                      Loading insights...
                    </span>
                  </div>
                ) : insights ? (
                  <div className="space-y-3">
                    <div className="p-4 rounded-xl bg-blue-500/10 backdrop-blur-sm border border-blue-500/20">
                      <p className="text-sm font-medium text-foreground">
                        Risk Level:{" "}
                        {insights.insight?.risk_summary?.overall_risk_level ||
                          "Unknown"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Score: {insights.insight?.risk_summary?.risk_score || 0}
                        /100
                      </p>
                    </div>

                    {/* Portfolio Performance Summary */}
                    {portfolioSummary && (
                      <div className="p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
                        <p className="text-sm font-medium text-foreground">
                          Portfolio Performance
                        </p>
                        <p
                          className={`text-xs mt-1 ${
                            portfolioSummary.total_profit_loss_percentage >= 0
                              ? "text-green-400"
                              : "text-red-400"
                          }`}
                        >
                          {formatPercentage(
                            portfolioSummary.total_profit_loss_percentage
                          )}{" "}
                          overall return
                        </p>
                      </div>
                    )}

                    {insights.insight?.key_recommendations
                      ?.slice(0, 2)
                      .map((rec, index) => (
                        <div
                          key={index}
                          className="text-sm text-muted-foreground p-3 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10"
                        >
                          • {rec}
                        </div>
                      ))}

                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full mt-3 bg-transparent backdrop-blur-sm border border-white/20 hover:bg-white/5 text-foreground"
                      onClick={() => navigate("/dashboard/insights")}
                    >
                      View Full Insights
                    </Button>
                  </div>
                ) : hasHoldings ? (
                  <div className="text-center py-6 text-muted-foreground">
                    <p className="mb-3">No recent insights available</p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-transparent backdrop-blur-sm border border-white/20 hover:bg-white/5 text-foreground"
                      onClick={() => navigate("/dashboard/insights")}
                    >
                      Generate Insights
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    <p>Add holdings to get AI insights</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Portfolio at a Glance */}
          <div className="relative">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/20" />
            <div className="relative p-6">
              <div className="pb-4">
                <h3 className="text-lg font-semibold text-foreground">
                  Portfolio at a Glance
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Key metrics and performance
                </p>
              </div>
              <div>
                {hasHoldings ? (
                  <div className="space-y-4">
                    {/* Best and Worst Performer */}
                    {topPerformers.length > 0 && (
                      <div className="flex justify-between items-center p-4 rounded-xl bg-green-500/10 backdrop-blur-sm border border-green-500/20">
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            Best Performer
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {topPerformers[0].ticker}
                          </p>
                        </div>
                        <Badge
                          variant="default"
                          className="bg-green-500/20 text-green-400 border-green-500/30"
                        >
                          {formatPercentage(
                            topPerformers[0].profit_loss_percentage
                          )}
                        </Badge>
                      </div>
                    )}

                    {worstPerformers.length > 0 &&
                      worstPerformers[0].profit_loss_percentage < 0 && (
                        <div className="flex justify-between items-center p-4 rounded-xl bg-red-500/10 backdrop-blur-sm border border-red-500/20">
                          <div>
                            <p className="text-sm font-medium text-foreground">
                              Needs Attention
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {worstPerformers[0].ticker}
                            </p>
                          </div>
                          <Badge
                            variant="destructive"
                            className="bg-red-500/20 text-red-400 border-red-500/30"
                          >
                            {formatPercentage(
                              worstPerformers[0].profit_loss_percentage
                            )}
                          </Badge>
                        </div>
                      )}

                    {/* Sector Allocation */}
                    {allocationData &&
                      Object.keys(allocationData.by_sector).length > 0 && (
                        <div className="space-y-3">
                          <p className="text-sm font-medium text-foreground">
                            Top Sectors
                          </p>
                          {Object.entries(allocationData.by_sector)
                            .slice(0, 3)
                            .map(([sector, percentage]: [string, number]) => (
                              <div
                                key={sector}
                                className="flex justify-between items-center text-sm p-2 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10"
                              >
                                <span className="text-muted-foreground">
                                  {sector}
                                </span>
                                <span className="font-medium text-foreground">
                                  {percentage.toFixed(1)}%
                                </span>
                              </div>
                            ))}
                        </div>
                      )}

                    <div className="pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full bg-transparent backdrop-blur-sm border border-white/20 hover:bg-white/5 text-foreground"
                        onClick={() => navigate("/dashboard/holdings")}
                      >
                        View All Holdings
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <PieChart className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                    <p className="mb-3">Start building your portfolio</p>
                    <Button
                      className="bg-primary/20 backdrop-blur-sm border border-white/20 hover:bg-primary/30 text-foreground"
                      onClick={() => navigate("/dashboard/holdings/add")}
                    >
                      Add First Holding
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
