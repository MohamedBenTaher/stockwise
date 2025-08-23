"use client";

import { useState, useEffect } from "react";
import {
  Bar,
  BarChart,
  Pie,
  PieChart,
  Cell,
  Area,
  AreaChart,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
  Tooltip,
  LineChart,
  Line,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  TrendingUp,
  TrendingDown,
  Activity,
  PieChart as PieChartIcon,
} from "lucide-react";

// Sample data with vibrant themes
const performanceData = [
  { month: "Jan", portfolio: 95000, benchmark: 92000, volume: 1200 },
  { month: "Feb", portfolio: 98000, benchmark: 94000, volume: 1400 },
  { month: "Mar", portfolio: 102000, benchmark: 96000, volume: 1100 },
  { month: "Apr", portfolio: 108000, benchmark: 99000, volume: 1800 },
  { month: "May", portfolio: 112000, benchmark: 102000, volume: 1600 },
  { month: "Jun", portfolio: 127543, benchmark: 105000, volume: 2100 },
];

const sectorData = [
  { name: "Technology", value: 35, color: "#6366f1", trend: "+12.5%" },
  { name: "Healthcare", value: 22, color: "#8b5cf6", trend: "+8.2%" },
  { name: "Finance", value: 18, color: "#06b6d4", trend: "+5.7%" },
  { name: "Energy", value: 15, color: "#10b981", trend: "+15.3%" },
  { name: "Consumer", value: 10, color: "#f59e0b", trend: "-2.1%" },
];

const volumeData = [
  { time: "9AM", volume: 1200, price: 425 },
  { time: "10AM", volume: 1800, price: 428 },
  { time: "11AM", volume: 1100, price: 432 },
  { time: "12PM", volume: 2100, price: 429 },
  { time: "1PM", volume: 1600, price: 435 },
  { time: "2PM", volume: 1900, price: 441 },
  { time: "3PM", volume: 2300, price: 438 },
  { time: "4PM", volume: 2800, price: 445 },
];

export function StockWiseDashboardPreview() {
  const [activeChart, setActiveChart] = useState("performance");
  const [animatedValues, setAnimatedValues] = useState({
    portfolio: 0,
    todaysPL: 0,
    riskScore: 0,
  });

  // Animate values on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedValues({
        portfolio: 127543.21,
        todaysPL: 1234.56,
        riskScore: 7.2,
      });
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900/95 backdrop-blur-xl border border-slate-600/50 rounded-2xl p-6 shadow-2xl">
          <p className="font-semibold text-white text-lg mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-3 mb-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-slate-300">
                {entry.name}: ${entry.value.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-[calc(100vw-64px)] md:w-[900px] lg:w-[1000px] group">
      {/* Main Container with Fey-inspired gradients */}
      <div className="relative bg-gradient-to-br from-indigo-900/20 via-purple-900/10 to-cyan-900/20 rounded-2xl p-2 shadow-2xl border border-white/10 transition-all duration-700 hover:scale-[1.01] hover:shadow-3xl overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-gradient-to-br from-cyan-500/20 to-teal-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>

        <div className="relative bg-slate-950/40 backdrop-blur-xl rounded-xl p-4 md:p-6 border border-white/5">
          {/* Header with animated stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* Portfolio Value */}
            <Card className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-500/20 backdrop-blur-sm hover:scale-105 transition-all duration-500 group/card cursor-pointer">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-indigo-400" />
                  <CardDescription className="text-indigo-200">
                    Portfolio Value
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <CardTitle className="text-3xl font-bold text-white group-hover/card:text-indigo-300 transition-colors">
                  ${animatedValues.portfolio.toLocaleString()}
                </CardTitle>
                <div className="flex items-center gap-2 mt-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-green-400 font-semibold">
                    +$2,341.12 (+1.87%)
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Today's P&L */}
            <Card className="bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 border-emerald-500/20 backdrop-blur-sm hover:scale-105 transition-all duration-500 group/card cursor-pointer">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-emerald-400" />
                  <CardDescription className="text-emerald-200">
                    Today's P&L
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <CardTitle className="text-3xl font-bold text-white group-hover/card:text-emerald-300 transition-colors">
                  +${animatedValues.todaysPL.toLocaleString()}
                </CardTitle>
                <div className="flex items-center gap-2 mt-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-green-400 font-semibold">+0.98%</span>
                </div>
              </CardContent>
            </Card>

            {/* Risk Score */}
            <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/20 backdrop-blur-sm hover:scale-105 transition-all duration-500 group/card cursor-pointer">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <PieChartIcon className="w-5 h-5 text-amber-400" />
                  <CardDescription className="text-amber-200">
                    Risk Score
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <CardTitle className="text-3xl font-bold text-white group-hover/card:text-amber-300 transition-colors">
                  {animatedValues.riskScore.toFixed(1)}/10
                </CardTitle>
                <div className="flex items-center gap-2 mt-2">
                  <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
                  <span className="text-amber-400 font-semibold">
                    Moderate Risk
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Interactive Chart Navigation */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4">
            <h2 className="text-xl md:text-2xl font-bold text-white">
              Portfolio Analytics
            </h2>
            <div className="flex gap-2 sm:ml-auto flex-wrap">
              {[
                { id: "performance", label: "Performance", icon: TrendingUp },
                { id: "allocation", label: "Allocation", icon: PieChartIcon },
                { id: "volume", label: "Volume", icon: Activity },
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveChart(tab.id)}
                    className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg font-medium transition-all duration-300 ${
                      activeChart === tab.id
                        ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                        : "bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dynamic Chart Area */}
          <Card className="bg-gradient-to-br from-slate-900/40 to-slate-800/40 border-white/10 backdrop-blur-xl h-64 md:h-80 mb-6">
            <CardContent className="p-4 md:p-6 h-full">
              {activeChart === "performance" && (
                <div className="h-full">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">
                      Portfolio vs Benchmark
                    </h3>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-indigo-500 rounded-full" />
                        <span className="text-sm text-gray-300">Portfolio</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-purple-500 rounded-full" />
                        <span className="text-sm text-gray-300">Benchmark</span>
                      </div>
                    </div>
                  </div>
                  <ResponsiveContainer width="100%" height="90%">
                    <AreaChart data={performanceData}>
                      <defs>
                        <linearGradient
                          id="portfolioGradient"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#6366f1"
                            stopOpacity={0.8}
                          />
                          <stop
                            offset="95%"
                            stopColor="#6366f1"
                            stopOpacity={0.1}
                          />
                        </linearGradient>
                        <linearGradient
                          id="benchmarkGradient"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#8b5cf6"
                            stopOpacity={0.6}
                          />
                          <stop
                            offset="95%"
                            stopColor="#8b5cf6"
                            stopOpacity={0.1}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#374151"
                        opacity={0.3}
                      />
                      <XAxis dataKey="month" stroke="#9ca3af" />
                      <YAxis
                        stroke="#9ca3af"
                        tickFormatter={(value) =>
                          `$${(value / 1000).toFixed(0)}k`
                        }
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Area
                        type="monotone"
                        dataKey="portfolio"
                        stroke="#6366f1"
                        strokeWidth={3}
                        fill="url(#portfolioGradient)"
                        name="Portfolio"
                      />
                      <Area
                        type="monotone"
                        dataKey="benchmark"
                        stroke="#8b5cf6"
                        strokeWidth={2}
                        fill="url(#benchmarkGradient)"
                        name="Benchmark"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}

              {activeChart === "allocation" && (
                <div className="h-full flex items-center">
                  <div className="w-1/2 h-full">
                    <h3 className="text-lg font-semibold text-white mb-4">
                      Sector Allocation
                    </h3>
                    <ResponsiveContainer width="100%" height="80%">
                      <PieChart>
                        <Pie
                          data={sectorData}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          stroke="none"
                        >
                          {sectorData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          content={({ active, payload }: any) => {
                            if (active && payload && payload.length) {
                              const data = payload[0].payload;
                              return (
                                <div className="bg-slate-900/95 backdrop-blur-xl border border-slate-600/50 rounded-xl p-4 shadow-2xl">
                                  <p className="font-semibold text-white text-lg">
                                    {data.name}
                                  </p>
                                  <p className="text-slate-300 text-sm mt-1">
                                    {data.value}% allocation
                                  </p>
                                  <p className="text-green-400 text-sm">
                                    {data.trend}
                                  </p>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="w-1/2 space-y-4 pl-8">
                    {sectorData.map((sector, index) => (
                      <div
                        key={sector.name}
                        className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-all duration-300"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: sector.color }}
                          />
                          <span className="text-white font-medium">
                            {sector.name}
                          </span>
                        </div>
                        <div className="text-right">
                          <div className="text-white font-semibold">
                            {sector.value}%
                          </div>
                          <div
                            className={`text-sm ${
                              sector.trend.startsWith("+")
                                ? "text-green-400"
                                : "text-red-400"
                            }`}
                          >
                            {sector.trend}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeChart === "volume" && (
                <div className="h-full">
                  <h3 className="text-lg font-semibold text-white mb-4">
                    Trading Volume & Price Action
                  </h3>
                  <ResponsiveContainer width="100%" height="90%">
                    <BarChart data={volumeData}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#374151"
                        opacity={0.3}
                      />
                      <XAxis dataKey="time" stroke="#9ca3af" />
                      <YAxis
                        yAxisId="volume"
                        orientation="left"
                        stroke="#06b6d4"
                      />
                      <YAxis
                        yAxisId="price"
                        orientation="right"
                        stroke="#10b981"
                      />
                      <Tooltip
                        content={({ active, payload, label }: any) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="bg-slate-900/95 backdrop-blur-xl border border-slate-600/50 rounded-xl p-4 shadow-2xl">
                                <p className="font-semibold text-white text-lg mb-2">
                                  {label}
                                </p>
                                <div className="flex items-center gap-3 mb-1">
                                  <div className="w-3 h-3 bg-cyan-400 rounded-full" />
                                  <span className="text-slate-300">
                                    Volume:{" "}
                                    {payload[0]?.value?.toLocaleString()}
                                  </span>
                                </div>
                                <div className="flex items-center gap-3">
                                  <div className="w-3 h-3 bg-green-400 rounded-full" />
                                  <span className="text-slate-300">
                                    Price: ${payload[1]?.value}
                                  </span>
                                </div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Bar
                        yAxisId="volume"
                        dataKey="volume"
                        fill="#06b6d4"
                        opacity={0.7}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Holdings Table with Enhanced Design */}
          <Card className="bg-gradient-to-br from-slate-900/40 to-slate-800/40 border-white/10 backdrop-blur-xl">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
                <CardTitle className="text-white">Top Holdings</CardTitle>
                <div className="ml-auto text-sm text-gray-400">
                  Live Updates
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    symbol: "AAPL",
                    name: "Apple Inc.",
                    value: "$25,432.10",
                    change: "+2.34%",
                    color: "#6366f1",
                  },
                  {
                    symbol: "MSFT",
                    name: "Microsoft Corp.",
                    value: "$18,765.43",
                    change: "+1.87%",
                    color: "#10b981",
                  },
                  {
                    symbol: "GOOGL",
                    name: "Alphabet Inc.",
                    value: "$15,234.67",
                    change: "-0.45%",
                    color: "#f59e0b",
                  },
                  {
                    symbol: "TSLA",
                    name: "Tesla Inc.",
                    value: "$12,987.54",
                    change: "+4.23%",
                    color: "#8b5cf6",
                  },
                ].map((stock, index) => (
                  <div
                    key={stock.symbol}
                    className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 hover:scale-[1.02] transition-all duration-300 cursor-pointer group"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-white border-2 group-hover:scale-110 transition-transform duration-300"
                        style={{
                          backgroundColor: `${stock.color}20`,
                          borderColor: stock.color,
                          color: stock.color,
                        }}
                      >
                        {stock.symbol.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold text-white group-hover:text-lg transition-all duration-300">
                          {stock.symbol}
                        </div>
                        <div className="text-sm text-gray-400 group-hover:text-white transition-colors">
                          {stock.name}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-white group-hover:text-lg transition-all duration-300">
                        {stock.value}
                      </div>
                      <div
                        className={`text-sm font-medium flex items-center gap-2 ${
                          stock.change.startsWith("+")
                            ? "text-green-400"
                            : "text-red-400"
                        }`}
                      >
                        <div
                          className={`w-2 h-2 rounded-full animate-pulse ${
                            stock.change.startsWith("+")
                              ? "bg-green-400"
                              : "bg-red-400"
                          }`}
                        />
                        {stock.change}
                        <span className="text-xs opacity-75">
                          {stock.change.startsWith("+") ? "↗" : "↘"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
