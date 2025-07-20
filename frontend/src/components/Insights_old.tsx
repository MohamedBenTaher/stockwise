import React from "react";
import { Brain, TrendingUp, AlertTriangle, CheckCircle } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { Badge } from "./ui/badge";

export const Insights: React.FC = () => {
  const mockInsights = {
    risk_summary: {
      overall_risk_level: "medium",
      risk_score: 65,
      main_concerns: ["High tech exposure", "Limited diversification"],
      volatility_estimate: 0.18,
    },
    key_recommendations: [
      "Consider reducing technology sector exposure from 60% to 40%",
      "Add international diversification with emerging market ETFs",
      "Include defensive sectors like utilities or consumer staples",
    ],
    concentration_alerts: [
      {
        type: "sector",
        asset_name: "Technology",
        concentration_percentage: 60,
        risk_level: "high",
        recommendation: "Reduce tech allocation to improve diversification",
      },
    ],
  };

  const getRiskLevelVariant = (
    level: string
  ): "default" | "destructive" | "outline" => {
    switch (level) {
      case "low":
        return "default";
      case "medium":
        return "outline";
      case "high":
        return "destructive";
      default:
        return "default";
    }
  };

  const getRiskIcon = (level: string) => {
    switch (level) {
      case "low":
        return <CheckCircle className="h-5 w-5" />;
      case "medium":
        return <AlertTriangle className="h-5 w-5" />;
      case "high":
        return <AlertTriangle className="h-5 w-5" />;
      default:
        return <AlertTriangle className="h-5 w-5" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">AI Insights</h1>
          <p className="text-gray-600">
            AI-powered portfolio analysis and recommendations
          </p>
        </div>
        <Button>
          <Brain className="h-4 w-4 mr-2" />
          Generate New Insights
        </Button>
      </div>

      {/* Risk Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Brain className="h-6 w-6 text-blue-600 mr-2" />
            Risk Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <Badge
                variant={getRiskLevelVariant(
                  mockInsights.risk_summary.overall_risk_level
                )}
                className="capitalize"
              >
                {getRiskIcon(mockInsights.risk_summary.overall_risk_level)}
                <span className="ml-1">
                  {mockInsights.risk_summary.overall_risk_level} Risk
                </span>
              </Badge>
              <p className="text-sm text-gray-600 mt-1">Overall Risk Level</p>
            </div>

            <div className="text-center">
              <p className="text-2xl font-semibold text-gray-900">
                {mockInsights.risk_summary.risk_score}
              </p>
              <p className="text-sm text-gray-600">Risk Score (0-100)</p>
            </div>

            <div className="text-center">
              <p className="text-2xl font-semibold text-gray-900">
                {(mockInsights.risk_summary.volatility_estimate * 100).toFixed(
                  1
                )}
                %
              </p>
              <p className="text-sm text-gray-600">Expected Volatility</p>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-2">Main Concerns:</h4>
            <ul className="space-y-1">
              {mockInsights.risk_summary.main_concerns.map((concern, index) => (
                <li key={index} className="flex items-center text-gray-700">
                  <AlertTriangle className="h-4 w-4 text-yellow-500 mr-2" />
                  {concern}
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Key Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="h-6 w-6 text-green-600 mr-2" />
            Key Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {mockInsights.key_recommendations.map((recommendation, index) => (
            <div key={index} className="flex items-start">
              <div className="flex-shrink-0 w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-medium mt-0.5">
                {index + 1}
              </div>
              <p className="ml-3 text-gray-700">{recommendation}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Concentration Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertTriangle className="h-6 w-6 text-red-600 mr-2" />
            Concentration Alerts
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {mockInsights.concentration_alerts.map((alert, index) => (
            <Alert
              key={index}
              variant={getRiskLevelVariant(alert.risk_level)}
            >
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle className="flex justify-between">
                {alert.asset_name}
                <span className="text-lg font-semibold">
                  {alert.concentration_percentage}%
                </span>
              </AlertTitle>
              <AlertDescription>{alert.recommendation}</AlertDescription>
            </Alert>
          ))}
        </CardContent>
      </Card>

      {/* Analysis Details */}
      <Card>
        <CardHeader>
          <CardTitle>Analysis Details</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">
              Portfolio Composition
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Technology</span>
                <span className="font-medium">60%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Healthcare</span>
                <span className="font-medium">20%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Financial</span>
                <span className="font-medium">15%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Other</span>
                <span className="font-medium">5%</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-2">
              Geographic Exposure
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">United States</span>
                <span className="font-medium">85%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">International Developed</span>
                <span className="font-medium">10%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Emerging Markets</span>
                <span className="font-medium">5%</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};