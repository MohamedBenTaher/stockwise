import React from "react";
import { useNavigate } from "react-router-dom";
import {
  TrendingUp,
  TrendingDown,
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
  
  const {
    data: insights,
    isLoading: insightsLoading,
  } = useLatestInsights();

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
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome to your portfolio overview</p>
      </div>

      {/* Portfolio Summary Cards */}
      {portfolioSummary ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Value</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(portfolioSummary.total_value)}
              </div>
              <p className="text-xs text-muted-foreground">
                {hasHoldings ? "Portfolio value" : "No holdings yet"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total P/L</CardTitle>
              {portfolioSummary.total_profit_loss >= 0 ? (
                <ArrowUpRight className="h-4 w-4 text-green-600" />
              ) : (
                <ArrowDownRight className="h-4 w-4 text-red-600" />
              )}
            </CardHeader>
            <CardContent>
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
                className={`text-xs ${
                  portfolioSummary.total_profit_loss >= 0
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {formatPercentage(portfolioSummary.total_profit_loss_percentage)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Holdings</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {portfolioSummary.holdings_count}
              </div>
              <p className="text-xs text-muted-foreground">
                {portfolioSummary.holdings_count === 1 ? "Asset" : "Assets"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
              <PieChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
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
            <Card key={i} className="animate-pulse">
              <CardHeader className="space-y-0 pb-2">
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Performance and Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
              Top Performers
            </CardTitle>
            <CardDescription>
              {hasHoldings ? "Your best performing assets" : "No holdings to display"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {topPerformers.length > 0 ? (
              topPerformers.map((holding) => (
                <div
                  key={holding.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div>
                    <p className="font-medium text-gray-900">{holding.ticker}</p>
                    <p className="text-sm text-gray-500">
                      {formatCurrency(holding.total_value)} • {holding.quantity} shares
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge
                      variant={holding.profit_loss_percentage >= 0 ? "default" : "destructive"}
                      className="text-xs"
                    >
                      {formatPercentage(holding.profit_loss_percentage)}
                    </Badge>
                    <p className="text-sm text-gray-500 mt-1">
                      {formatCurrency(holding.profit_loss)}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Briefcase className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Add some holdings to see performance</p>
                <Button
                  className="mt-3"
                  onClick={() => navigate("/holdings/add")}
                >
                  Add Holding
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Manage your portfolio and get insights
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              className="w-full" 
              onClick={() => navigate("/holdings/add")}
            >
              <DollarSign className="h-4 w-4 mr-2" />
              Add New Holding
            </Button>
            <Button 
              variant="secondary" 
              className="w-full"
              onClick={() => navigate("/insights")}
              disabled={!hasHoldings}
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              Generate AI Insights
            </Button>
            <Button 
              variant="secondary" 
              className="w-full"
              onClick={() => navigate("/risk")}
              disabled={!hasHoldings}
            >
              <AlertCircle className="h-4 w-4 mr-2" />
              View Risk Analysis
            </Button>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => navigate("/holdings")}
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
        <Card>
          <CardHeader>
            <CardTitle>Latest AI Insights</CardTitle>
            <CardDescription>
              {insightsLoading ? "Generating insights..." : "AI-powered portfolio analysis"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {insightsLoading ? (
              <div className="flex items-center space-x-2 py-4">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm text-gray-600">Loading insights...</span>
              </div>
            ) : insights ? (
              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                  <p className="text-sm font-medium text-blue-900">
                    Risk Level: {insights.insight?.risk_summary?.overall_risk_level || "Unknown"}
                  </p>
                  <p className="text-xs text-blue-700 mt-1">
                    Score: {insights.insight?.risk_summary?.risk_score || 0}/100
                  </p>
                </div>
                
                {insights.insight?.key_recommendations?.slice(0, 2).map((rec, index) => (
                  <div key={index} className="text-sm text-gray-600 p-2 bg-gray-50 rounded">
                    • {rec}
                  </div>
                ))}
                
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-3"
                  onClick={() => navigate("/insights")}
                >
                  View Full Insights
                </Button>
              </div>
            ) : hasHoldings ? (
              <div className="text-center py-6 text-gray-500">
                <p className="mb-3">No recent insights available</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate("/insights")}
                >
                  Generate Insights
                </Button>
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500">
                <p>Add holdings to get AI insights</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Portfolio at a Glance */}
        <Card>
          <CardHeader>
            <CardTitle>Portfolio at a Glance</CardTitle>
            <CardDescription>Key metrics and performance</CardDescription>
          </CardHeader>
          <CardContent>
            {hasHoldings ? (
              <div className="space-y-4">
                {/* Best and Worst Performer */}
                {topPerformers.length > 0 && (
                  <div className="flex justify-between items-center p-3 rounded-lg bg-green-50">
                    <div>
                      <p className="text-sm font-medium text-green-900">Best Performer</p>
                      <p className="text-xs text-green-700">{topPerformers[0].ticker}</p>
                    </div>
                    <Badge variant="default" className="text-green-700 bg-green-100">
                      {formatPercentage(topPerformers[0].profit_loss_percentage)}
                    </Badge>
                  </div>
                )}
                
                {worstPerformers.length > 0 && worstPerformers[0].profit_loss_percentage < 0 && (
                  <div className="flex justify-between items-center p-3 rounded-lg bg-red-50">
                    <div>
                      <p className="text-sm font-medium text-red-900">Needs Attention</p>
                      <p className="text-xs text-red-700">{worstPerformers[0].ticker}</p>
                    </div>
                    <Badge variant="destructive" className="text-red-700 bg-red-100">
                      {formatPercentage(worstPerformers[0].profit_loss_percentage)}
                    </Badge>
                  </div>
                )}

                <div className="pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => navigate("/holdings")}
                  >
                    View All Holdings
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <PieChart className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="mb-3">Start building your portfolio</p>
                <Button onClick={() => navigate("/holdings/add")}>
                  Add First Holding
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome to your portfolio overview</p>
      </div>

      {/* Portfolio Summary Cards */}
      {portfolioSummary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Value</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(portfolioSummary.total_value)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total P/L</CardTitle>
              {portfolioSummary.total_profit_loss >= 0 ? (
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              ) : (
                <TrendingDown className="h-4 w-4 text-muted-foreground" />
              )}
            </CardHeader>
            <CardContent>
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
                className={`text-xs ${
                  portfolioSummary.total_profit_loss >= 0
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {formatPercentage(portfolioSummary.total_profit_loss_percentage)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Holdings</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {portfolioSummary.holdings_count}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
              <PieChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(portfolioSummary.total_cost)}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Top Performers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Top Performers</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {topPerformers.map((holding) => (
              <div
                key={holding.id}
                className="flex items-center justify-between"
              >
                <div>
                  <p className="font-medium text-gray-900">{holding.ticker}</p>
                  <p className="text-sm text-gray-500">
                    {formatCurrency(holding.total_value)}
                  </p>
                </div>
                <div className="text-right">
                  <p
                    className={`font-medium ${
                      holding.profit_loss_percentage >= 0
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {formatPercentage(holding.profit_loss_percentage)}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full">Add New Holding</Button>
            <Button variant="secondary" className="w-full">
              Generate AI Insights
            </Button>
            <Button variant="secondary" className="w-full">
              View Risk Analysis
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>No recent activity to display</CardDescription>
        </CardHeader>
        <CardContent className="text-center py-8 text-gray-500">
          <p>Add some holdings to see your portfolio activity</p>
        </CardContent>
      </Card>
    </div>
  );
};