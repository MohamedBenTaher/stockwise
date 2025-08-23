import React from "react";
import {
  TrendingUp,
  AlertTriangle,
  Shield,
  Target,
  Loader2,
  AlertCircle,
  Lightbulb,
  BarChart,
  RefreshCw,
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
import { useLatestInsights, useGenerateInsights } from "../hooks/useInsights";
import { usePortfolioSummary } from "../hooks/useHoldings";

export const Insights: React.FC = () => {
  const {
    data: insights,
    isLoading: insightsLoading,
    error: insightsError,
    refetch: refetchInsights,
  } = useLatestInsights();

  const { data: portfolioSummary, isLoading: portfolioLoading } =
    usePortfolioSummary();

  const generateInsightsMutation = useGenerateInsights();

  const handleGenerateInsights = () => {
    generateInsightsMutation.mutate("full", {
      onSuccess: () => {
        refetchInsights();
      },
    });
  };

  const getRiskLevelVariant = (
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

  const getRiskIcon = (level: string) => {
    switch (level?.toLowerCase()) {
      case "low":
        return <Shield className="h-4 w-4" />;
      case "medium":
        return <AlertCircle className="h-4 w-4" />;
      case "high":
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getRiskColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case "low":
        return "text-green-600";
      case "medium":
        return "text-yellow-600";
      case "high":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const hasHoldings = portfolioSummary && portfolioSummary.holdings_count > 0;
  const isGenerating = generateInsightsMutation.isPending;
  const loading = insightsLoading || portfolioLoading || isGenerating;

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="relative">
          <div className="absolute inset-0 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10" />
          <div className="relative p-6 flex justify-between items-center">
            <div>
              <div className="h-8 w-48 bg-gradient-to-r from-white/10 to-white/5 rounded-lg animate-pulse" />
              <div className="h-4 w-64 bg-gradient-to-r from-white/10 to-white/5 rounded-lg animate-pulse mt-2" />
            </div>
            <div className="h-10 w-40 bg-gradient-to-r from-white/10 to-white/5 rounded-full animate-pulse" />
          </div>
        </div>

        {/* Risk Analysis Skeleton */}
        <div className="relative">
          <div className="absolute inset-0 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10" />
          <div className="relative p-6 space-y-4">
            <div className="flex items-center space-x-2">
              <div className="h-5 w-5 bg-gradient-to-r from-white/10 to-white/5 rounded animate-pulse" />
              <div className="h-6 w-32 bg-gradient-to-r from-white/10 to-white/5 rounded animate-pulse" />
            </div>
            <div className="h-4 w-48 bg-gradient-to-r from-white/10 to-white/5 rounded animate-pulse" />

            <div className="flex items-center justify-between pt-4">
              <div className="space-y-2">
                <div className="h-4 w-16 bg-gradient-to-r from-white/10 to-white/5 rounded animate-pulse" />
                <div className="h-6 w-20 bg-gradient-to-r from-white/10 to-white/5 rounded-full animate-pulse" />
              </div>
              <div className="text-right space-y-2">
                <div className="h-4 w-20 bg-gradient-to-r from-white/10 to-white/5 rounded animate-pulse" />
                <div className="h-8 w-16 bg-gradient-to-r from-white/10 to-white/5 rounded animate-pulse" />
              </div>
            </div>

            <div className="h-2 w-full bg-gradient-to-r from-white/10 to-white/5 rounded-full animate-pulse" />
          </div>
        </div>

        {/* Key Recommendations Skeleton */}
        <div className="relative">
          <div className="absolute inset-0 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10" />
          <div className="relative p-6 space-y-4">
            <div className="flex items-center space-x-2">
              <div className="h-5 w-5 bg-gradient-to-r from-white/10 to-white/5 rounded animate-pulse" />
              <div className="h-6 w-40 bg-gradient-to-r from-white/10 to-white/5 rounded animate-pulse" />
            </div>
            <div className="h-4 w-56 bg-gradient-to-r from-white/10 to-white/5 rounded animate-pulse" />

            <div className="space-y-3 pt-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex items-start space-x-3 p-4 rounded-lg bg-white/5 border border-white/10"
                >
                  <div className="h-5 w-5 bg-gradient-to-r from-white/10 to-white/5 rounded animate-pulse mt-0.5" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-32 bg-gradient-to-r from-white/10 to-white/5 rounded animate-pulse" />
                    <div className="h-4 w-full bg-gradient-to-r from-white/10 to-white/5 rounded animate-pulse" />
                    <div className="h-4 w-3/4 bg-gradient-to-r from-white/10 to-white/5 rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Additional Cards Skeleton */}
        <div className="grid gap-6 md:grid-cols-2">
          {[1, 2].map((i) => (
            <div key={i} className="relative">
              <div className="absolute inset-0 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10" />
              <div className="relative p-6 space-y-4">
                <div className="flex items-center space-x-2">
                  <div className="h-5 w-5 bg-gradient-to-r from-white/10 to-white/5 rounded animate-pulse" />
                  <div className="h-6 w-32 bg-gradient-to-r from-white/10 to-white/5 rounded animate-pulse" />
                </div>
                <div className="h-4 w-40 bg-gradient-to-r from-white/10 to-white/5 rounded animate-pulse" />

                <div className="space-y-3 pt-4">
                  {[1, 2].map((j) => (
                    <div
                      key={j}
                      className="p-3 rounded-lg bg-white/5 border border-white/10"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="h-4 w-24 bg-gradient-to-r from-white/10 to-white/5 rounded animate-pulse" />
                        <div className="h-4 w-16 bg-gradient-to-r from-white/10 to-white/5 rounded animate-pulse" />
                      </div>
                      <div className="h-3 w-full bg-gradient-to-r from-white/10 to-white/5 rounded animate-pulse" />
                      <div className="h-3 w-2/3 bg-gradient-to-r from-white/10 to-white/5 rounded animate-pulse mt-2" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Loading Indicator */}
        <div className="relative">
          <div className="absolute inset-0 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10" />
          <div className="relative p-6 flex items-center justify-center">
            <div className="flex items-center space-x-3">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span className="text-muted-foreground font-medium">
                {isGenerating
                  ? "Analyzing your portfolio with AI..."
                  : "Loading insights..."}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (insightsError) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">AI Insights</h1>
            <p className="text-gray-600">AI-powered portfolio analysis</p>
          </div>
        </div>

        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load insights. Please try again.
            <Button
              variant="outline"
              size="sm"
              className="ml-2"
              onClick={() => refetchInsights()}
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
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">AI Insights</h1>
            <p className="text-gray-600">AI-powered portfolio analysis</p>
          </div>
        </div>

        <Card>
          <CardContent className="text-center py-12">
            <BarChart className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No Portfolio Data
            </h3>
            <p className="text-gray-600 mb-6">
              Add some holdings to your portfolio to get AI-powered insights and
              analysis.
            </p>
            <Button onClick={() => (window.location.href = "/holdings/add")}>
              Add Holdings
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="relative">
        <div className="absolute inset-0 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10" />
        <div className="relative p-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-semibold text-foreground">
              AI Insights
            </h1>
            <p className="text-muted-foreground mt-2">
              AI-powered portfolio analysis
            </p>
          </div>
          <Button
            onClick={handleGenerateInsights}
            disabled={isGenerating}
            className="flex items-center space-x-2"
          >
            {isGenerating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            <span>
              {isGenerating ? "Generating..." : "Generate New Insights"}
            </span>
          </Button>
        </div>
      </div>

      {insights ? (
        <>
          {/* Risk Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                {getRiskIcon(
                  insights.insight?.risk_summary?.overall_risk_level || ""
                )}
                <span className="ml-2">Risk Analysis</span>
              </CardTitle>
              <CardDescription>
                Overall portfolio risk assessment
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Risk Level
                  </p>
                  <Badge
                    variant={getRiskLevelVariant(
                      insights.insight?.risk_summary?.overall_risk_level || ""
                    )}
                    className="mt-1"
                  >
                    {insights.insight?.risk_summary?.overall_risk_level?.toUpperCase() ||
                      "UNKNOWN"}
                  </Badge>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    Risk Score
                  </p>
                  <p
                    className={`text-2xl font-bold ${getRiskColor(
                      insights.insight?.risk_summary?.overall_risk_level || ""
                    )}`}
                  >
                    {insights.insight?.risk_summary?.risk_score || 0}/100
                  </p>
                </div>
              </div>

              {insights.insight?.risk_summary?.risk_score && (
                <Progress
                  value={insights.insight.risk_summary.risk_score}
                  className="w-full"
                />
              )}

              {insights.insight?.risk_summary?.main_concerns &&
                insights.insight.risk_summary.main_concerns.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-900 mb-2">
                      Main Concerns
                    </p>
                    <div className="space-y-2">
                      {insights.insight.risk_summary.main_concerns.map(
                        (concern, index) => (
                          <div
                            key={index}
                            className="flex items-center p-2 bg-yellow-50 rounded-lg border border-yellow-200"
                          >
                            <AlertTriangle className="h-4 w-4 text-yellow-600 mr-2" />
                            <span className="text-sm text-yellow-800">
                              {concern}
                            </span>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}
            </CardContent>
          </Card>

          {/* Key Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Lightbulb className="h-5 w-5 mr-2" />
                Key Recommendations
              </CardTitle>
              <CardDescription>
                AI-generated suggestions to improve your portfolio
              </CardDescription>
            </CardHeader>
            <CardContent>
              {insights.insight?.key_recommendations &&
              insights.insight.key_recommendations.length > 0 ? (
                <div className="space-y-3">
                  {insights.insight.key_recommendations.map(
                    (recommendation, index) => (
                      <div
                        key={index}
                        className="flex items-start p-4 bg-blue-50 rounded-lg border border-blue-200"
                      >
                        <Target className="h-5 w-5 text-blue-600 mr-3 mt-0.5" />
                        <div>
                          <p className="text-sm text-blue-900 font-medium">
                            Recommendation {index + 1}
                          </p>
                          <p className="text-sm text-blue-800 mt-1">
                            {recommendation}
                          </p>
                        </div>
                      </div>
                    )
                  )}
                </div>
              ) : (
                <p className="text-gray-600 text-center py-8">
                  No specific recommendations available at this time.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Concentration Alerts */}
          {insights.insight?.concentration_alerts &&
            insights.insight.concentration_alerts.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <AlertTriangle className="h-5 w-5 mr-2 text-orange-600" />
                    Concentration Alerts
                  </CardTitle>
                  <CardDescription>
                    Areas where your portfolio may be overconcentrated
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {insights.insight.concentration_alerts.map(
                      (alert, index) => (
                        <div
                          key={index}
                          className="p-4 border rounded-lg bg-orange-50 border-orange-200"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <p className="font-medium text-orange-900">
                                {alert.type?.replace("_", " ").toUpperCase()}:{" "}
                                {alert.asset_name}
                              </p>
                              <Badge
                                variant={getRiskLevelVariant(
                                  alert.risk_level || ""
                                )}
                                className="mt-1"
                              >
                                {alert.risk_level?.toUpperCase() || "UNKNOWN"}{" "}
                                RISK
                              </Badge>
                            </div>
                            <div className="text-right">
                              <p className="text-2xl font-bold text-orange-900">
                                {alert.concentration_percentage?.toFixed(1) ||
                                  0}
                                %
                              </p>
                              <p className="text-xs text-orange-700">
                                of portfolio
                              </p>
                            </div>
                          </div>
                          <p className="text-sm text-orange-800">
                            {alert.recommendation}
                          </p>
                        </div>
                      )
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

          {/* Diversification Suggestions */}
          {insights.insight?.diversification_suggestions &&
            insights.insight.diversification_suggestions.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
                    Diversification Opportunities
                  </CardTitle>
                  <CardDescription>
                    Suggestions to improve portfolio diversification
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {insights.insight.diversification_suggestions.map(
                      (suggestion, index) => (
                        <div
                          key={index}
                          className="p-4 border rounded-lg bg-green-50 border-green-200"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <p className="font-medium text-green-900">
                                {suggestion.type
                                  ?.replace("_", " ")
                                  .toUpperCase()}{" "}
                                Diversification
                              </p>
                              <Badge
                                variant={
                                  suggestion.priority === "high"
                                    ? "destructive"
                                    : suggestion.priority === "medium"
                                    ? "outline"
                                    : "default"
                                }
                                className="mt-1"
                              >
                                {suggestion.priority?.toUpperCase() || "NORMAL"}{" "}
                                PRIORITY
                              </Badge>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-green-700">
                                Current:{" "}
                                {suggestion.current_exposure?.toFixed(1) || 0}%
                              </p>
                              <p className="text-sm text-green-700">
                                Recommended:{" "}
                                {suggestion.recommended_exposure?.toFixed(1) ||
                                  0}
                                %
                              </p>
                            </div>
                          </div>
                          <p className="text-sm text-green-800">
                            {suggestion.suggestion}
                          </p>
                        </div>
                      )
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

          {/* Insight Metadata */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between text-sm text-gray-500">
                <div>
                  <p>
                    Generated:{" "}
                    {new Date(
                      insights.insight?.generated_at || ""
                    ).toLocaleString()}
                  </p>
                  {insights.insight?.confidence_score && (
                    <p>
                      Confidence:{" "}
                      {(insights.insight.confidence_score * 100).toFixed(1)}%
                    </p>
                  )}
                </div>
                <div className="text-right">
                  {insights.processing_time_ms && (
                    <p>Processing time: {insights.processing_time_ms}ms</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        /* No insights available */
        <Card>
          <CardContent className="text-center py-12">
            <Lightbulb className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No Insights Available
            </h3>
            <p className="text-gray-600 mb-6">
              Generate AI-powered insights for your portfolio to get
              personalized recommendations.
            </p>
            <Button
              onClick={handleGenerateInsights}
              disabled={isGenerating}
              className="flex items-center space-x-2"
            >
              {isGenerating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Lightbulb className="h-4 w-4" />
              )}
              <span>
                {isGenerating ? "Generating..." : "Generate Insights"}
              </span>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
