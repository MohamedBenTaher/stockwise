import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Briefcase,
  PieChart,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "./ui/card";
import { Button } from "./ui/button";

interface PortfolioSummary {
  total_value: number;
  total_cost: number;
  total_profit_loss: number;
  total_profit_loss_percentage: number;
  holdings_count: number;
}

interface Holding {
  id: number;
  ticker: string;
  total_value: number;
  profit_loss_percentage: number;
}

export const Dashboard: React.FC = () => {
  const [portfolioSummary, setPortfolioSummary] =
    useState<PortfolioSummary | null>(null);
  const [topPerformers, setTopPerformers] = useState<Holding[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Mock data for now - replace with actual API calls
      const mockSummary: PortfolioSummary = {
        total_value: 125750.5,
        total_cost: 118000.0,
        total_profit_loss: 7750.5,
        total_profit_loss_percentage: 6.57,
        holdings_count: 12,
      };

      const mockPerformers: Holding[] = [
        {
          id: 1,
          ticker: "AAPL",
          total_value: 15420.0,
          profit_loss_percentage: 12.5,
        },
        {
          id: 2,
          ticker: "NVDA",
          total_value: 8950.0,
          profit_loss_percentage: 8.3,
        },
        {
          id: 3,
          ticker: "MSFT",
          total_value: 12100.0,
          profit_loss_percentage: 5.7,
        },
      ];

      setPortfolioSummary(mockSummary);
      setTopPerformers(mockPerformers);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatPercentage = (percentage: number) => {
    return `${percentage >= 0 ? "+" : ""}${percentage.toFixed(2)}%`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

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