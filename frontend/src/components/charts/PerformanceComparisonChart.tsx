import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "@/components/ui/chart";

interface PerformanceData {
  date: string;
  portfolio: number;
  sp500?: number;
  nasdaq?: number;
}

interface PerformanceComparisonChartProps {
  data: PerformanceData[];
  title?: string;
  description?: string;
  className?: string;
  showSP500?: boolean;
  showNasdaq?: boolean;
}

const chartConfig = {
  portfolio: {
    label: "Your Portfolio",
    color: "hsl(--color-chart-1)",
  },
  sp500: {
    label: "S&P 500",
    color: "hsl(--color-chart-2)",
  },
  nasdaq: {
    label: "NASDAQ",
    color: "hsl(--color-chart-3)",
  },
};

export function PerformanceComparisonChart({
  data,
  title = "Performance Comparison",
  description = "Your portfolio vs market indices",
  className,
  showSP500 = true,
  showNasdaq = false,
}: PerformanceComparisonChartProps) {
  const formatPercentage = (value: number) => {
    return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <LineChart
            data={data}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={formatDate}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={formatPercentage}
            />
            <Tooltip
              cursor={false}
              content={({ active, payload, label }) => {
                if (active && payload && payload.length && label) {
                  return (
                    <div className="rounded-lg border bg-background p-2 shadow-sm">
                      <div className="mb-2">
                        <span className="text-[0.70rem] uppercase text-muted-foreground">
                          Date
                        </span>
                        <div className="font-bold text-muted-foreground">
                          {formatDate(label as string)}
                        </div>
                      </div>
                      <div className="grid gap-2">
                        {payload.map((item, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between gap-4"
                          >
                            <div className="flex items-center gap-2">
                              <div
                                className="h-3 w-3 rounded-full"
                                style={{ backgroundColor: item.color }}
                              />
                              <span className="text-sm">
                                {chartConfig[
                                  item.dataKey as keyof typeof chartConfig
                                ]?.label || item.dataKey}
                              </span>
                            </div>
                            <span className="font-bold">
                              {formatPercentage(item.value as number)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Line
              dataKey="portfolio"
              type="monotone"
              stroke="var(--chart-1)"
              strokeWidth={2}
              dot={{
                fill: "var(--chart-1)",
                strokeWidth: 2,
              }}
            />
            {showSP500 && (
              <Line
                dataKey="sp500"
                type="natural"
                stroke="var(--chart-2)"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{
                  fill: "var(--chart-2)",
                  strokeWidth: 2,
                }}
              />
            )}
            {showNasdaq && (
              <Line
                dataKey="nasdaq"
                type="monotone"
                stroke="var(--chart-3)"
                strokeWidth={2}
                strokeDasharray="3 3"
                dot={{
                  fill: "var(--chart-3)",
                  strokeWidth: 2,
                }}
              />
            )}
            <Legend />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
