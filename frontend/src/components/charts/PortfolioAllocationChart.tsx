import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from "@/components/ui/chart";

interface AllocationData {
  symbol: string;
  name: string;
  value: number;
  percentage: number;
  color?: string;
}

interface PortfolioAllocationChartProps {
  data: AllocationData[];
  title?: string;
  description?: string;
  className?: string;
}

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

const chartConfig = {
  value: {
    label: "Portfolio Value",
  },
};

export function PortfolioAllocationChart({
  data,
  title = "Portfolio Allocation",
  description = "Distribution of your investments",
  className,
}: PortfolioAllocationChartProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const dataWithColors = data.map((item, index) => ({
    ...item,
    fill: item.color || COLORS[index % COLORS.length],
  }));

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <PieChart>
            <Pie
              data={dataWithColors}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percentage }) =>
                `${name} ${percentage.toFixed(1)}%`
              }
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {dataWithColors.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="rounded-lg border bg-background p-2 shadow-sm">
                      <div className="grid gap-2">
                        <div className="flex items-center gap-2">
                          <div
                            className="h-3 w-3 rounded-full"
                            style={{ backgroundColor: data.fill }}
                          />
                          <span className="font-medium">{data.name}</span>
                          <span className="text-sm text-muted-foreground">
                            ({data.symbol})
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <span className="text-[0.70rem] uppercase text-muted-foreground">
                              Value
                            </span>
                            <div className="font-bold">
                              {formatCurrency(data.value)}
                            </div>
                          </div>
                          <div>
                            <span className="text-[0.70rem] uppercase text-muted-foreground">
                              Allocation
                            </span>
                            <div className="font-bold">
                              {data.percentage.toFixed(1)}%
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
