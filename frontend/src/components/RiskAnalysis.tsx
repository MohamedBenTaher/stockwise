import React from "react";
import {
  AlertTriangle,
  Shield,
  TrendingDown,
  BarChart,
  Loader2,
  AlertCircle,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Alert, AlertDescription } from "./ui/alert";
import { Progress } from "./ui/progress";
import { useRiskAnalysis, useRiskMetrics } from "../hooks/useInsights";
import { usePortfolioSummary } from "../hooks/useHoldings";

export const RiskAnalysis: React.FC = () => {
  const {
    data: riskAnalysis,
    isLoading: riskAnalysisLoading,
    error: riskAnalysisError,
    refetch: refetchRiskAnalysis,
  } = useRiskAnalysis();

  const {
    data: riskMetrics,
    isLoading: riskMetricsLoading,
    error: riskMetricsError,
  } = useRiskMetrics();

  const { data: portfolioSummary, isLoading: portfolioLoading } =
    usePortfolioSummary();

  const hasHoldings = portfolioSummary && portfolioSummary.holdings_count > 0;
  const loading = riskAnalysisLoading || riskMetricsLoading || portfolioLoading;
  const error = riskAnalysisError || riskMetricsError;

  const getRiskColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case "low":
        return "bg-green-500";
      case "medium":
        return "bg-yellow-500";
      case "high":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getRiskVariant = (
    level: string
  ): "default" | "destructive" | "outline" => {
    switch (level?.toLowerCase()) {
      case "low":
        return "default";
      case "medium":
        return "outline";
      case "high":
        return "destructive";
      default:
        return "outline";
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Risk Analysis</h1>
          <p className="text-gray-600">Loading portfolio risk assessment...</p>
        </div>

        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Analyzing portfolio risk...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Risk Analysis</h1>
          <p className="text-gray-600">Portfolio risk assessment</p>
        </div>

        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load risk analysis. Please try again.
            <Button
              variant="outline"
              size="sm"
              className="ml-2"
              onClick={() => {
                refetchRiskAnalysis();
              }}
            >
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!hasHoldings) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Risk Analysis</h1>
          <p className="text-gray-600">Portfolio risk assessment</p>
        </div>

        <Card>
          <CardContent className="text-center py-12">
            <BarChart className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No Portfolio Data
            </h3>
            <p className="text-gray-600 mb-6">
              Add some holdings to your portfolio to get detailed risk analysis.
            </p>
            <Button onClick={() => (window.location.href = "/holdings/add")}>
              Add Holdings
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Use real data if available, fallback to placeholder if needed
  const riskData = riskAnalysis || {
    overall_risk_score: 65,
    risk_level: "medium",
    herfindahl_index: 0.45,
    effective_number_of_holdings: 2.2,
    max_position_weight: 0.35,
    portfolio_volatility: 0.18,
    value_at_risk_5pct: 8500,
    sectors: [
      { name: "Technology", percentage: 60, risk_level: "high" },
      { name: "Healthcare", percentage: 20, risk_level: "medium" },
      { name: "Financial", percentage: 15, risk_level: "medium" },
      { name: "Consumer", percentage: 5, risk_level: "low" },
    ],
    countries: [
      { name: "United States", percentage: 85, risk_level: "medium" },
      { name: "Europe", percentage: 10, risk_level: "low" },
      { name: "Asia Pacific", percentage: 5, risk_level: "low" },
    ],
  };

  return (
    <div className="space-y-6 ">
      {/* Page Header */}
      <div className="relative glass-card">
        <div className="relative p-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-semibold text-foreground">
              Risk Analysis
            </h1>
            <p className="text-muted-foreground mt-2">
              Analyze your portfolio's risk exposure and get actionable
              insights.
            </p>
          </div>
        </div>
      </div>

      {/* Overall Risk Score */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="h-5 w-5 mr-2" />
            Overall Risk Assessment
          </CardTitle>
          <CardDescription>
            Your portfolio's overall risk level and score
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-medium text-gray-900">Risk Level</p>
              <Badge
                variant={getRiskVariant(riskData.risk_level)}
                className="mt-1"
              >
                {riskData.risk_level?.toUpperCase() || "UNKNOWN"}
              </Badge>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">Risk Score</p>
              <p className="text-3xl font-bold text-blue-600">
                {riskData.overall_risk_score}/100
              </p>
            </div>
          </div>
          <Progress value={riskData.overall_risk_score} className="w-full" />
        </CardContent>
      </Card>

      {/* Risk Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ">
        <Card className="glass-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">
              Concentration Risk
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {((riskData.herfindahl_index || 0) * 100).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">Herfindahl Index</p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">
              Diversification
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(riskData.effective_number_of_holdings || 0).toFixed(1)}
            </div>
            <p className="text-xs text-muted-foreground">Effective holdings</p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Max Position</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {((riskData.max_position_weight || 0) * 100).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">Largest holding</p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Value at Risk</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(riskData.value_at_risk_5pct || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              5% VaR (95% confidence)
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Sector Risk Breakdown */}
      {riskData.sectors && riskData.sectors.length > 0 && (
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart className="h-5 w-5 mr-2" />
              Sector Risk Breakdown
            </CardTitle>
            <CardDescription>
              Risk exposure by sector allocation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {riskData.sectors.map((sector, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{sector.name}</span>
                      <Badge variant={getRiskVariant(sector.risk_level)}>
                        {sector.risk_level?.toUpperCase() || "UNKNOWN"}
                      </Badge>
                    </div>
                    <span className="font-medium">{sector.percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${getRiskColor(
                        sector.risk_level
                      )}`}
                      style={{ width: `${sector.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Geographic Risk */}
      {riskData.countries && riskData.countries.length > 0 && (
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Geographic Risk Distribution
            </CardTitle>
            <CardDescription>
              Risk exposure by geographic allocation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {riskData.countries.map((country, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{country.name}</span>
                      <Badge variant={getRiskVariant(country.risk_level)}>
                        {country.risk_level?.toUpperCase() || "UNKNOWN"}
                      </Badge>
                    </div>
                    <span className="font-medium">{country.percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${getRiskColor(
                        country.risk_level
                      )}`}
                      style={{ width: `${country.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Risk Warnings */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center text-orange-600">
            <AlertTriangle className="h-5 w-5 mr-2" />
            Risk Considerations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                High concentration in technology sector may increase volatility
                during market downturns.
              </AlertDescription>
            </Alert>

            <Alert>
              <TrendingDown className="h-4 w-4" />
              <AlertDescription>
                Consider diversifying across more sectors and geographies to
                reduce overall portfolio risk.
              </AlertDescription>
            </Alert>

            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                Portfolio volatility of{" "}
                {((riskData.portfolio_volatility || 0) * 100).toFixed(1)}%
                suggests moderate risk exposure.
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
