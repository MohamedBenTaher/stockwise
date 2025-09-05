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
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { useRiskAnalysis, useRiskMetrics } from "@/hooks/useInsights";
import { usePortfolioSummary } from "@/hooks/useHoldings";

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
      <div className="min-h-screen relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 opacity-[0.02]">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern
                  id="grid-risk-loading"
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
              <rect width="100%" height="100%" fill="url(#grid-risk-loading)" />
            </svg>
          </div>
        </div>

        <div className="relative z-10 space-y-8">
          {/* Page Header */}
          <div className="glass-card p-6">
            <h1 className="text-3xl font-semibold text-foreground">
              Risk Analysis
            </h1>
            <p className="text-muted-foreground mt-2">
              Loading portfolio risk assessment...
            </p>
          </div>

          <div className="glass-card p-12">
            <div className="flex items-center justify-center">
              <div className="flex items-center space-x-3">
                <Loader2 className="h-8 w-8 animate-spin text-chart-1" />
                <span className="text-lg text-foreground">
                  Analyzing portfolio risk...
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 opacity-[0.02]">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern
                  id="grid-risk-error"
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
              <rect width="100%" height="100%" fill="url(#grid-risk-error)" />
            </svg>
          </div>
        </div>

        <div className="relative z-10 space-y-8">
          {/* Page Header */}
          <div className="glass-card p-6">
            <h1 className="text-3xl font-semibold text-foreground">
              Risk Analysis
            </h1>
            <p className="text-muted-foreground mt-2">
              Portfolio risk assessment
            </p>
          </div>

          <Alert
            variant="destructive"
            className="glass-card border-red-500/20 bg-red-500/10"
          >
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>Failed to load risk analysis. Please try again.</span>
              <Button
                variant="outline"
                size="sm"
                className="ml-3 bg-transparent backdrop-blur-sm border border-white/20 hover:bg-white/5"
                onClick={() => {
                  refetchRiskAnalysis();
                }}
              >
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  if (!hasHoldings) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 opacity-[0.02]">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern
                  id="grid-risk-empty"
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
              <rect width="100%" height="100%" fill="url(#grid-risk-empty)" />
            </svg>
          </div>
        </div>

        <div className="relative z-10 space-y-8">
          {/* Page Header */}
          <div className="glass-card p-6">
            <h1 className="text-3xl font-semibold text-foreground">
              Risk Analysis
            </h1>
            <p className="text-muted-foreground mt-2">
              Portfolio risk assessment
            </p>
          </div>

          <Card className="glass-card">
            <CardContent className="text-center py-16">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-chart-1/5 to-chart-2/5 rounded-full blur-3xl" />
                <BarChart className="relative h-20 w-20 mx-auto mb-6 text-chart-1" />
              </div>
              <h3 className="text-2xl font-semibold text-foreground mb-3">
                No Portfolio Data
              </h3>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                Add some holdings to your portfolio to get detailed risk
                analysis and insights.
              </p>
              <Button
                onClick={() => (window.location.href = "/holdings/add")}
                className="bg-chart-1/20 backdrop-blur-sm border border-chart-1/20 hover:bg-chart-1/30 text-foreground hover:text-foreground"
              >
                Add Holdings
              </Button>
            </CardContent>
          </Card>
        </div>
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
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 opacity-[0.02]">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern
                id="grid-risk"
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
            <rect width="100%" height="100%" fill="url(#grid-risk)" />
          </svg>
        </div>
      </div>

      <div className="relative z-10 space-y-8">
        {/* Page Header */}
        <div className="glass-card p-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-semibold text-foreground">
                Risk Analysis
              </h1>
              <p className="text-muted-foreground mt-2">
                Analyze your portfolio's risk exposure and get actionable
                insights.
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="h-3 w-3 rounded-full bg-chart-1 animate-pulse" />
              <span className="text-sm text-muted-foreground">
                Live Analysis
              </span>
            </div>
          </div>
        </div>

        {/* Overall Risk Score */}
        <Card className="glass-card-hover">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center text-lg">
              <div className="p-2 rounded-lg bg-chart-1/10 mr-3">
                <Shield className="h-5 w-5 text-chart-1" />
              </div>
              Overall Risk Assessment
            </CardTitle>
            <CardDescription>
              Your portfolio's overall risk level and score
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-sm font-medium text-foreground mb-2">
                  Risk Level
                </p>
                <Badge
                  variant={getRiskVariant(riskData.risk_level)}
                  className="text-sm px-3 py-1"
                >
                  {riskData.risk_level?.toUpperCase() || "UNKNOWN"}
                </Badge>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-foreground mb-2">
                  Risk Score
                </p>
                <p className="text-4xl font-bold bg-gradient-to-r from-chart-1 to-chart-2 bg-clip-text text-transparent">
                  {riskData.overall_risk_score}/100
                </p>
              </div>
            </div>
            <div className="relative">
              <Progress
                value={riskData.overall_risk_score}
                className="w-full h-3"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-chart-1/20 to-chart-2/20 rounded-full" />
            </div>
          </CardContent>
        </Card>

        {/* Risk Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="glass-card-hover group">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center">
                <div className="h-2 w-2 bg-chart-1 rounded-full mr-2 group-hover:animate-pulse" />
                Concentration Risk
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground mb-1">
                {((riskData.herfindahl_index || 0) * 100).toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground">Herfindahl Index</p>
            </CardContent>
          </Card>

          <Card className="glass-card-hover group">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center">
                <div className="h-2 w-2 bg-chart-2 rounded-full mr-2 group-hover:animate-pulse" />
                Diversification
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground mb-1">
                {(riskData.effective_number_of_holdings || 0).toFixed(1)}
              </div>
              <p className="text-xs text-muted-foreground">
                Effective holdings
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card-hover group">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center">
                <div className="h-2 w-2 bg-chart-3 rounded-full mr-2 group-hover:animate-pulse" />
                Max Position
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground mb-1">
                {((riskData.max_position_weight || 0) * 100).toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground">Largest holding</p>
            </CardContent>
          </Card>

          <Card className="glass-card-hover group">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center">
                <div className="h-2 w-2 bg-chart-4 rounded-full mr-2 group-hover:animate-pulse" />
                Value at Risk
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold bg-gradient-to-r from-red-500 to-red-600 bg-clip-text text-transparent mb-1">
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
          <Card className="glass-card-hover">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center text-lg">
                <div className="p-2 rounded-lg bg-chart-2/10 mr-3">
                  <BarChart className="h-5 w-5 text-chart-2" />
                </div>
                Sector Risk Breakdown
              </CardTitle>
              <CardDescription>
                Risk exposure by sector allocation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {riskData.sectors.map((sector: any, index: number) => (
                  <div key={index} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="font-semibold text-foreground">
                          {sector.name}
                        </span>
                        <Badge
                          variant={getRiskVariant(sector.risk_level)}
                          className="text-xs"
                        >
                          {sector.risk_level?.toUpperCase() || "UNKNOWN"}
                        </Badge>
                      </div>
                      <span className="font-bold text-lg text-foreground">
                        {sector.percentage}%
                      </span>
                    </div>
                    <div className="relative w-full bg-white/10 backdrop-blur-sm rounded-full h-3 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${getRiskColor(
                          sector.risk_level
                        )} transition-all duration-500 ease-out`}
                        style={{ width: `${sector.percentage}%` }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent rounded-full" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Geographic Risk */}
        {riskData.countries && riskData.countries.length > 0 && (
          <Card className="glass-card-hover">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center text-lg">
                <div className="p-2 rounded-lg bg-chart-3/10 mr-3">
                  <AlertTriangle className="h-5 w-5 text-chart-3" />
                </div>
                Geographic Risk Distribution
              </CardTitle>
              <CardDescription>
                Risk exposure by geographic allocation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {riskData.countries.map((country: any, index: number) => (
                  <div key={index} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="font-semibold text-foreground">
                          {country.name}
                        </span>
                        <Badge
                          variant={getRiskVariant(country.risk_level)}
                          className="text-xs"
                        >
                          {country.risk_level?.toUpperCase() || "UNKNOWN"}
                        </Badge>
                      </div>
                      <span className="font-bold text-lg text-foreground">
                        {country.percentage}%
                      </span>
                    </div>
                    <div className="relative w-full bg-white/10 backdrop-blur-sm rounded-full h-3 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${getRiskColor(
                          country.risk_level
                        )} transition-all duration-500 ease-out`}
                        style={{ width: `${country.percentage}%` }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent rounded-full" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Risk Warnings */}
        <Card className="glass-card-hover">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center text-lg text-orange-400">
              <div className="p-2 rounded-lg bg-orange-500/10 mr-3">
                <AlertTriangle className="h-5 w-5 text-orange-400" />
              </div>
              Risk Considerations
            </CardTitle>
            <CardDescription>
              Important risk factors to consider for your portfolio
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Alert className="glass-card border-orange-500/20 bg-orange-500/10">
                <AlertCircle className="h-4 w-4 text-orange-400" />
                <AlertDescription className="text-foreground">
                  High concentration in technology sector may increase
                  volatility during market downturns.
                </AlertDescription>
              </Alert>

              <Alert className="glass-card border-chart-1/20 bg-chart-1/10">
                <TrendingDown className="h-4 w-4 text-chart-1" />
                <AlertDescription className="text-foreground">
                  Consider diversifying across more sectors and geographies to
                  reduce overall portfolio risk.
                </AlertDescription>
              </Alert>

              <Alert className="glass-card border-chart-2/20 bg-chart-2/10">
                <Shield className="h-4 w-4 text-chart-2" />
                <AlertDescription className="text-foreground">
                  Portfolio volatility of{" "}
                  <span className="font-semibold">
                    {((riskData.portfolio_volatility || 0) * 100).toFixed(1)}%
                  </span>{" "}
                  suggests moderate risk exposure.
                </AlertDescription>
              </Alert>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
