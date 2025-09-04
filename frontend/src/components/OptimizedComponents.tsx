import React, { Suspense } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

// Lazy load chart components
const PortfolioPerformanceChart = React.lazy(
  () => import("./charts/PortfolioPerformanceChart")
);
const PortfolioAllocationChart = React.lazy(
  () => import("./charts/PortfolioAllocationChart")
);
const PerformanceComparisonChart = React.lazy(
  () => import("./charts/PerformanceComparisonChart")
);

// Chart loading skeleton
const ChartSkeleton: React.FC<{ title?: string }> = ({ title }) => (
  <Card className="glass-card">
    <CardHeader>
      {title && <CardTitle>{title}</CardTitle>}
      <Skeleton className="h-4 w-48" />
    </CardHeader>
    <CardContent>
      <Skeleton className="h-64 w-full" />
    </CardContent>
  </Card>
);

// Optimized chart wrapper with suspense
export const LazyPortfolioChart: React.FC<any> = (props) => (
  <Suspense fallback={<ChartSkeleton title="Portfolio Performance" />}>
    <PortfolioPerformanceChart {...props} />
  </Suspense>
);

export const LazyAllocationChart: React.FC<any> = (props) => (
  <Suspense fallback={<ChartSkeleton title="Portfolio Allocation" />}>
    <PortfolioAllocationChart {...props} />
  </Suspense>
);

export const LazyComparisonChart: React.FC<any> = (props) => (
  <Suspense fallback={<ChartSkeleton title="Performance Comparison" />}>
    <PerformanceComparisonChart {...props} />
  </Suspense>
);

// Memoized performance metrics card
export const PerformanceMetricsCard = React.memo<{
  title: string;
  value: string;
  change?: number;
  icon: React.ReactNode;
  variant?: "default" | "positive" | "negative";
}>(({ title, value, change, icon, variant = "default" }) => {
  const getVariantStyles = () => {
    switch (variant) {
      case "positive":
        return "border-green-500/20 bg-green-500/5";
      case "negative":
        return "border-red-500/20 bg-red-500/5";
      default:
        return "border-border bg-card";
    }
  };

  return (
    <Card className={`glass-card interactive-element ${getVariantStyles()}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground">{value}</div>
        {change !== undefined && (
          <p
            className={`text-xs ${
              change >= 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            {change >= 0 ? "+" : ""}
            {change.toFixed(2)}%
          </p>
        )}
      </CardContent>
    </Card>
  );
});

PerformanceMetricsCard.displayName = "PerformanceMetricsCard";

// Memoized holding item for lists
export const HoldingListItem = React.memo<{
  holding: any;
  showActions?: boolean;
  onEdit?: (holding: any) => void;
  onDelete?: (holding: any) => void;
}>(({ holding, showActions = false, onEdit, onDelete }) => {
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);

  const profitLossColor =
    holding.profit_loss_percentage >= 0 ? "text-green-600" : "text-red-600";

  return (
    <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-card/50 hover:bg-card transition-colors">
      <div className="flex-1">
        <div className="font-semibold text-foreground">{holding.ticker}</div>
        <div className="text-sm text-muted-foreground">
          {holding.shares} shares at {formatCurrency(holding.purchase_price)}
        </div>
      </div>
      <div className="text-right">
        <div className="font-semibold text-foreground">
          {formatCurrency(holding.current_value)}
        </div>
        <div className={`text-sm ${profitLossColor}`}>
          {holding.profit_loss_percentage >= 0 ? "+" : ""}
          {holding.profit_loss_percentage.toFixed(2)}%
        </div>
      </div>
      {showActions && (
        <div className="ml-4 flex space-x-2">
          {onEdit && (
            <button
              onClick={() => onEdit(holding)}
              className="p-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              Edit
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(holding)}
              className="p-2 text-muted-foreground hover:text-red-600 transition-colors"
            >
              Delete
            </button>
          )}
        </div>
      )}
    </div>
  );
});

HoldingListItem.displayName = "HoldingListItem";
