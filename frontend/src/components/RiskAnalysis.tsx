import React from "react";
import { Shield, AlertTriangle, TrendingDown, BarChart3 } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "./ui/card";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";

export const RiskAnalysis: React.FC = () => {
  const mockRiskData = {
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

  const getRiskColor = (level: string) => {
    switch (level) {
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Risk Analysis</h1>
        <p className="text-gray-600">Comprehensive portfolio risk assessment</p>
      </div>

      {/* Risk Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Risk Score</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockRiskData.overall_risk_score}
            </div>
            <Badge variant={getRiskVariant(mockRiskData.risk_level)}>
              {mockRiskData.risk_level}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Concentration</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockRiskData.herfindahl_index.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">HHI Index</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Volatility</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(mockRiskData.portfolio_volatility * 100).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">Annual</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">VaR (5%)</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(mockRiskData.value_at_risk_5pct)}
            </div>
            <p className="text-xs text-muted-foreground">Potential Loss</p>
          </CardContent>
        </Card>
      </div>

      {/* Risk Metrics Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Diversification Metrics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Effective Holdings</span>
              <span className="font-medium">
                {mockRiskData.effective_number_of_holdings.toFixed(1)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Max Position Weight</span>
              <span className="font-medium">
                {(mockRiskData.max_position_weight * 100).toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">HHI Concentration</span>
              <span className="font-medium">
                {mockRiskData.herfindahl_index.toFixed(3)}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Risk Recommendations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start">
              <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5 mr-2" />
              <span className="text-sm text-gray-700">
                High concentration in technology sector (60%)
              </span>
            </div>
            <div className="flex items-start">
              <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5 mr-2" />
              <span className="text-sm text-gray-700">
                Limited geographic diversification
              </span>
            </div>
            <div className="flex items-start">
              <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 mr-2" />
              <span className="text-sm text-gray-700">
                Portfolio volatility above 15% threshold
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sector Risk Heatmap */}
      <Card>
        <CardHeader>
          <CardTitle>Sector Risk Heatmap</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {mockRiskData.sectors.map((sector, index) => (
            <div key={index} className="flex items-center">
              <div className="w-24 text-sm text-gray-600">{sector.name}</div>
              <div className="flex-1 mx-4">
                <Progress value={sector.percentage} />
              </div>
              <Badge variant={getRiskVariant(sector.risk_level)}>
                {sector.risk_level}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Geographic Risk Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Geographic Risk Distribution</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {mockRiskData.countries.map((country, index) => (
            <div key={index} className="flex items-center">
              <div className="w-32 text-sm text-gray-600">{country.name}</div>
              <div className="flex-1 mx-4">
                <Progress value={country.percentage} />
              </div>
              <Badge variant={getRiskVariant(country.risk_level)}>
                {country.risk_level}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Risk Scenarios */}
      <Card>
        <CardHeader>
          <CardTitle>Risk Scenarios</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <h4 className="font-medium text-green-900">Best Case (95%)</h4>
            <p className="text-2xl font-bold text-green-600 mt-2">+$12,500</p>
            <p className="text-sm text-green-700">Portfolio gain</p>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <h4 className="font-medium text-yellow-900">Expected (50%)</h4>
            <p className="text-2xl font-bold text-yellow-600 mt-2">+$2,750</p>
            <p className="text-sm text-yellow-700">Expected return</p>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <h4 className="font-medium text-red-900">Worst Case (5%)</h4>
            <p className="text-2xl font-bold text-red-600 mt-2">-$8,500</p>
            <p className="text-sm text-red-700">Potential loss</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};