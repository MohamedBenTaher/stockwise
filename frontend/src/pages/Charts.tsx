import React, { useState } from "react";
import {
  PortfolioPerformanceChart,
  PortfolioAllocationChart,
  PerformanceComparisonChart,
} from "../components/charts";
import {
  usePortfolioHistory,
  usePerformanceComparison,
  useAllocationChartData,
  usePortfolioMetrics,
} from "../hooks/useCharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Loader2,
  AlertCircle,
  TrendingUp,
  Briefcase,
  Activity,
} from "lucide-react";
import { Alert, AlertDescription } from "../components/ui/alert";

const Charts: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("1Y");

  // Daroori Map period values to days
  const periodToDays = {
    "1M": 30,
    "3M": 90,
    "6M": 180,
    "1Y": 365,
    "2Y": 365, // Cap at 365
    ALL: 365, // Cap at 365
  };

  const days = periodToDays[selectedPeriod as keyof typeof periodToDays] || 365;

  const {
    data: portfolioData,
    isLoading: portfolioLoading,
    error: portfolioError,
  } = usePortfolioHistory(days);

  const {
    data: allocationData,
    isLoading: allocationLoading,
    error: allocationError,
  } = useAllocationChartData();

  const {
    data: comparisonData,
    isLoading: comparisonLoading,
    error: comparisonError,
  } = usePerformanceComparison(days);

  const {
    data: metricsData,
    isLoading: metricsLoading,
    error: metricsError,
  } = usePortfolioMetrics();

  const periods = [
    { value: "1M", label: "1 Month" },
    { value: "3M", label: "3 Months" },
    { value: "6M", label: "6 Months" },
    { value: "1Y", label: "1 Year" },
    { value: "2Y", label: "2 Years" },
    { value: "ALL", label: "All Time" },
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatPercentage = (percentage: number) => {
    return `${percentage >= 0 ? "+" : ""}${percentage.toFixed(2)}%`;
  };

  // Debug logging
  console.log("Chart data:", {
    portfolioData: portfolioData?.length || 0,
    allocationData: allocationData?.by_holdings?.length || 0,
    comparisonData: comparisonData?.length || 0,
    metricsData: metricsData?.holdings_count || 0,
  });

  // Loading state
  if (
    portfolioLoading ||
    allocationLoading ||
    comparisonLoading ||
    metricsLoading
  ) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">
            Loading portfolio charts...
          </span>
        </div>
      </div>
    );
  }

  // Error state
  if (portfolioError || allocationError || comparisonError || metricsError) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Portfolio Charts
          </h1>
          <p className="text-muted-foreground">
            Visualize your portfolio performance and allocation
          </p>
        </div>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load chart data. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // CHECK IF WE HAVE ANY DATA AT ALL - Fix the logic here
  const hasAnyData =
    (portfolioData && portfolioData.length > 0) ||
    (allocationData &&
      allocationData.by_holdings &&
      allocationData.by_holdings.length > 0) ||
    (metricsData && metricsData.holdings_count > 0);

  // No data state - only show this if we truly have no data
  if (!hasAnyData) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Portfolio Charts
          </h1>
          <p className="text-muted-foreground">
            Visualize your portfolio performance and allocation
          </p>
        </div>
        <Card>
          <CardContent className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📊</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No portfolio data yet
            </h3>
            <p className="text-gray-600 mb-4">
              Add some holdings to your portfolio to see beautiful charts and
              analytics.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Enhanced Header */}
      <div className="glass-card p-8 animate-fade-in">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">
              Portfolio Charts
            </h1>
            <p className="text-muted-foreground text-lg">
              Visualize your portfolio performance and allocation
            </p>
          </div>

          <div className="flex items-center gap-4">
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-[180px] glass-card-hover border-0 text-foreground">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent className="bg-card/95 backdrop-blur-md border border-border text-foreground">
                {periods.map((period) => (
                  <SelectItem
                    key={period.value}
                    value={period.value}
                    className="text-foreground hover:bg-accent focus:bg-accent focus:text-accent-foreground"
                  >
                    {period.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Enhanced Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card-hover p-6 animate-slide-up">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-muted-foreground">
              Total Return
            </h3>
            <div
              className={`p-2 rounded-lg ${
                (metricsData?.total_return?.amount || 0) >= 0
                  ? "bg-chart-2/10"
                  : "bg-chart-3/10"
              }`}
            >
              <TrendingUp
                className={`h-4 w-4 ${
                  (metricsData?.total_return?.amount || 0) >= 0
                    ? "text-chart-2"
                    : "text-chart-3"
                }`}
              />
            </div>
          </div>
          <div
            className={`text-3xl font-bold mb-1 ${
              (metricsData?.total_return?.amount || 0) >= 0
                ? "text-chart-2"
                : "text-chart-3"
            }`}
          >
            {formatCurrency(metricsData?.total_return?.amount || 0)}
          </div>
          <p className="text-xs text-muted-foreground">
            {formatPercentage(metricsData?.total_return?.percentage || 0)} from
            initial investment
          </p>
        </div>

        <div
          className="glass-card-hover p-6 animate-slide-up"
          style={{ animationDelay: "0.1s" }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-muted-foreground">
              Best Performer
            </h3>
            <div className="p-2 rounded-lg bg-chart-1/10">
              <TrendingUp className="h-4 w-4 text-chart-1" />
            </div>
          </div>
          <div className="text-3xl font-bold text-foreground mb-1">
            {metricsData?.best_performer?.ticker || "N/A"}
          </div>
          <p className="text-xs text-muted-foreground">
            {metricsData?.best_performer
              ? formatPercentage(metricsData.best_performer.percentage) +
                " gain this period"
              : "No data available"}
          </p>
        </div>

        <div
          className="glass-card-hover p-6 animate-slide-up"
          style={{ animationDelay: "0.2s" }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-muted-foreground">
              Portfolio Size
            </h3>
            <div className="p-2 rounded-lg bg-chart-4/10">
              <Briefcase className="h-4 w-4 text-chart-4" />
            </div>
          </div>
          <div className="text-3xl font-bold text-foreground mb-1">
            {metricsData?.holdings_count || 0} Holdings
          </div>
          <p className="text-xs text-muted-foreground">
            {metricsData?.volatility || "Medium"} volatility
          </p>
        </div>
      </div>

      {/* Portfolio Performance Chart - Show if we have data */}
      {portfolioData && portfolioData.length > 0 ? (
        <PortfolioPerformanceChart
          data={portfolioData}
          title="Portfolio Value Over Time"
          description={`Your actual portfolio performance over the last ${periods
            .find((p) => p.value === selectedPeriod)
            ?.label.toLowerCase()}`}
          className="col-span-full"
        />
      ) : (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">
              Portfolio history data is loading...
            </p>
          </CardContent>
        </Card>
      )}

      {/* Grid Layout for Allocation and Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Portfolio Allocation Chart */}
        {allocationData?.by_holdings &&
        allocationData.by_holdings.length > 0 ? (
          <PortfolioAllocationChart
            data={allocationData.by_holdings}
            title="Current Portfolio Allocation"
            description="Distribution of your actual investments by holdings"
          />
        ) : (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">
                Allocation data is loading...
              </p>
            </CardContent>
          </Card>
        )}

        {/* Performance Comparison Chart */}
        {comparisonData && comparisonData.length > 0 ? (
          <PerformanceComparisonChart
            data={comparisonData}
            title="Performance vs Market"
            description={`Your portfolio vs market indices (${periods
              .find((p) => p.value === selectedPeriod)
              ?.label.toLowerCase()})`}
            showSP500={true}
            showNasdaq={true}
          />
        ) : (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">
                Performance comparison data is loading...
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Charts;
