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
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "./ui/card";
import { Button } from "./ui/button";
import { Alert, AlertDescription } from "./ui/alert";
import { Badge } from "./ui/badge";
import { usePortfolioSummary, useHoldings } from "../hooks/useHoldings";
import { useLatestInsights } from "../hooks/useInsights";
import { DashboardSkeleton } from "./LoadingSkeletons";
import type { Holding } from "../types/generated";

export const Dashboard: React.FC = React.memo(() => {
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
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="gradient-bg p-8 rounded-lg border border-border">
          <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome to your portfolio overview
          </p>
        </div>

        <Alert variant="destructive" className="shadow-card">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load dashboard data. Please try again.
            <Button
              variant="outline"
              size="sm"
              className="ml-2 hover:bg-destructive/10"
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
    <div className="space-y-6 animate-fade-in">
      {/* Enhanced Page Header with Gradient Background */}
      <div className="gradient-bg p-8 rounded-lg border border-border shadow-card">
        <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to your portfolio overview
        </p>
      </div>

      {/* Portfolio Summary Cards with Enhanced Styling */}
      {portfolioSummary ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="card-enhanced interactive-element">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Value
              </CardTitle>
              <DollarSign className="h-4 w-4 text-chart-1" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {formatCurrency(portfolioSummary.total_value)}
              </div>
              <p className="text-xs text-muted-foreground">
                Across {portfolioSummary.holdings_count} holdings
              </p>
            </CardContent>
          </Card>

          <Card className="card-enhanced interactive-element">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total P/L
              </CardTitle>
              {portfolioSummary.total_profit_loss >= 0 ? (
                <ArrowUpRight className="h-4 w-4 text-chart-2" />
              ) : (
                <ArrowDownRight className="h-4 w-4 text-chart-4" />
              )}
            </CardHeader>
            <CardContent>
              <div
                className={`text-2xl font-bold ${
                  portfolioSummary.total_profit_loss >= 0
                    ? "text-chart-2"
                    : "text-chart-4"
                }`}
              >
                {formatCurrency(portfolioSummary.total_profit_loss)}
              </div>
              <p
                className={`text-xs ${
                  portfolioSummary.total_profit_loss >= 0
                    ? "text-chart-2"
                    : "text-chart-4"
                }`}
              >
                {formatPercentage(
                  portfolioSummary.total_profit_loss_percentage
                )}
              </p>
            </CardContent>
          </Card>

          <Card className="card-enhanced interactive-element">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Holdings
              </CardTitle>
              <Briefcase className="h-4 w-4 text-chart-3" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {portfolioSummary.holdings_count}
              </div>
              <p className="text-xs text-muted-foreground">
                {portfolioSummary.holdings_count === 1 ? "Asset" : "Assets"}
              </p>
            </CardContent>
          </Card>

          <Card className="card-enhanced interactive-element">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Cost
              </CardTitle>
              <PieChart className="h-4 w-4 text-chart-5" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {formatCurrency(portfolioSummary.total_cost)}
              </div>
              <p className="text-xs text-muted-foreground">
                Initial investment
              </p>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="card-enhanced animate-pulse">
              <CardHeader className="space-y-0 pb-2">
                <div className="h-4 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2 mt-2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Performance and Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performers */}
        <Card className="card-enhanced">
          <CardHeader>
            <CardTitle className="flex items-center text-foreground">
              <TrendingUp className="h-5 w-5 mr-2 text-chart-2" />
              Top Performers
            </CardTitle>
            <CardDescription>
              {hasHoldings
                ? "Your best performing assets"
                : "No holdings to display"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {topPerformers.length > 0 ? (
              topPerformers.map((holding) => (
                <div
                  key={holding.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors duration-200 border border-border/50"
                >
                  <div>
                    <p className="font-medium text-foreground">
                      {holding.ticker}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formatCurrency(holding.total_value)} • {holding.quantity}{" "}
                      shares
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge
                      variant={
                        holding.profit_loss_percentage >= 0
                          ? "default"
                          : "destructive"
                      }
                      className="text-xs"
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
                  className="mt-3"
                  onClick={() => navigate("/dashboard/holdings/add")}
                >
                  Add Holding
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="card-enhanced">
          <CardHeader>
            <CardTitle className="text-foreground">Quick Actions</CardTitle>
            <CardDescription>
              Manage your portfolio and get insights
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              className="w-full"
              onClick={() => navigate("/dashboard/holdings/add")}
            >
              <DollarSign className="h-4 w-4 mr-2" />
              Add New Holding
            </Button>
            <Button
              variant="secondary"
              className="w-full"
              onClick={() => navigate("/dashboard/insights")}
              disabled={!hasHoldings}
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              Generate AI Insights
            </Button>
            <Button
              variant="secondary"
              className="w-full"
              onClick={() => navigate("/dashboard/risk")}
              disabled={!hasHoldings}
            >
              <AlertCircle className="h-4 w-4 mr-2" />
              View Risk Analysis
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => navigate("/dashboard/holdings")}
            >
              <Briefcase className="h-4 w-4 mr-2" />
              Manage Holdings
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Insights and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AI Insights Preview */}
        <Card className="card-enhanced">
          <CardHeader>
            <CardTitle className="text-foreground">
              Latest AI Insights
            </CardTitle>
            <CardDescription>
              {insightsLoading
                ? "Generating insights..."
                : "AI-powered portfolio analysis"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {insightsLoading ? (
              <div className="flex items-center space-x-2 py-4">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm text-muted-foreground">
                  Loading insights...
                </span>
              </div>
            ) : insights ? (
              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-chart-1/10 border border-chart-1/20">
                  <p className="text-sm font-medium text-foreground">
                    Risk Level:{" "}
                    {insights.insight?.risk_summary?.overall_risk_level ||
                      "Unknown"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Score: {insights.insight?.risk_summary?.risk_score || 0}/100
                  </p>
                </div>

                {insights.insight?.key_recommendations
                  ?.slice(0, 2)
                  .map((rec, index) => (
                    <div
                      key={index}
                      className="text-sm text-muted-foreground p-2 bg-muted/50 rounded border border-border/50"
                    >
                      • {rec}
                    </div>
                  ))}

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-3"
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
          </CardContent>
        </Card>

        {/* Portfolio at a Glance */}
        <Card className="card-enhanced">
          <CardHeader>
            <CardTitle className="text-foreground">
              Portfolio at a Glance
            </CardTitle>
            <CardDescription>Key metrics and performance</CardDescription>
          </CardHeader>
          <CardContent>
            {hasHoldings ? (
              <div className="space-y-4">
                {/* Best and Worst Performer */}
                {topPerformers.length > 0 && (
                  <div className="flex justify-between items-center p-3 rounded-lg bg-chart-2/10 border border-chart-2/20">
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
                      className="text-chart-2 bg-chart-2/10 border-chart-2/20"
                    >
                      {formatPercentage(
                        topPerformers[0].profit_loss_percentage
                      )}
                    </Badge>
                  </div>
                )}

                {worstPerformers.length > 0 &&
                  worstPerformers[0].profit_loss_percentage < 0 && (
                    <div className="flex justify-between items-center p-3 rounded-lg bg-chart-4/10 border border-chart-4/20">
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
                        className="text-chart-4 bg-chart-4/10 border-chart-4/20"
                      >
                        {formatPercentage(
                          worstPerformers[0].profit_loss_percentage
                        )}
                      </Badge>
                    </div>
                  )}

                <div className="pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
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
                <Button onClick={() => navigate("/dashboard/holdings/add")}>
                  Add First Holding
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
});

Dashboard.displayName = "Dashboard";
