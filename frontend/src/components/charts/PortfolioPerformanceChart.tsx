import { ChartContainer, type ChartConfig } from "@/components/ui/chart";
import {
  Line,
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

interface PortfolioData {
  date: string;
  value: number;
  gain?: number;
}

interface PortfolioPerformanceChartProps {
  data: PortfolioData[];
  title?: string;
  description?: string;
  className?: string;
}

const chartConfig: ChartConfig = {
  value: {
    label: "Portfolio Value",
    color: "var(--chart-1)",
  },
  gain: {
    label: "Daily Gain",
    color: "var(--chart-2)",
  },
};

export function PortfolioPerformanceChart({
  data,
  title = "Portfolio Performance",
  description = "Your portfolio value over time",
  className,
}: PortfolioPerformanceChartProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className={`glass-card-hover animate-fade-in ${className}`}>
      <div className="p-6 border-b border-border/50">
        <h3 className="text-xl font-semibold text-foreground mb-1">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="p-6">
        <ChartContainer config={chartConfig}>
          <LineChart
            data={data}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid
              vertical={false}
              stroke="oklch(var(--border))"
              strokeDasharray="2,2"
              opacity={0.3}
            />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={formatDate}
              tick={{ fill: "oklch(var(--muted-foreground))", fontSize: 12 }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={formatCurrency}
              tick={{ fill: "oklch(var(--muted-foreground))", fontSize: 12 }}
            />
            <Tooltip
              cursor={{
                stroke: "var(--chart-1)",
                strokeWidth: 1,
                strokeDasharray: "4,4",
              }}
              content={({ active, payload, label }) => {
                if (active && payload && payload.length && label) {
                  return (
                    <div className="glass-card p-4 border border-border/50 shadow-lg">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col">
                          <span className="text-xs font-medium uppercase text-muted-foreground mb-1">
                            Date
                          </span>
                          <span className="font-semibold text-foreground">
                            {formatDate(label as string)}
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-medium uppercase text-muted-foreground mb-1">
                            Value
                          </span>
                          <span className="font-semibold text-chart-1">
                            {formatCurrency(payload[0].value as number)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Line
              dataKey="value"
              type="monotone"
              stroke="var(--chart-1)"
              strokeWidth={3}
              dot={{
                fill: "var(--chart-1)",
                strokeWidth: 2,
                r: 4,
              }}
              activeDot={{
                r: 6,
                fill: "var(--chart-1)",
                strokeWidth: 2,
                stroke: "oklch(var(--background))",
              }}
            />
          </LineChart>
        </ChartContainer>
      </div>
    </div>
  );
}
