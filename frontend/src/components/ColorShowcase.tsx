import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  PieChart,
  AlertCircle,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";

export const ColorShowcase: React.FC = () => {
  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="gradient-bg p-8 rounded-lg border border-border shadow-card">
        <h1 className="text-4xl font-bold text-foreground mb-3">
          StockWise Design System
        </h1>
        <p className="text-lg text-muted-foreground">
          Optimized colors for both light and dark themes with excellent
          contrast and accessibility
        </p>
      </div>

      {/* Color Palette Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Primary Colors */}
        <Card className="card-enhanced">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="w-4 h-4 bg-primary rounded-full"></div>
              Primary Colors
            </CardTitle>
            <CardDescription>
              Main brand colors and interactive elements
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Button className="btn-premium">Primary Button</Button>
              <Button variant="outline" className="interactive-element">
                Secondary Button
              </Button>
            </div>
            <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
              <p className="text-primary font-medium">
                Primary accent background
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Financial Colors */}
        <Card className="card-enhanced">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-success" />
              Financial Colors
            </CardTitle>
            <CardDescription>
              Semantic colors for financial data visualization
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <Badge className="status-success">
                <TrendingUp className="w-3 h-3 mr-1" />
                +12.5%
              </Badge>
              <Badge className="status-warning">
                <AlertTriangle className="w-3 h-3 mr-1" />
                Neutral
              </Badge>
              <Badge className="status-error">
                <TrendingDown className="w-3 h-3 mr-1" />
                -5.2%
              </Badge>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Portfolio Value</span>
                <span className="financial-positive font-bold">
                  $125,430.50
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Daily Change</span>
                <span className="financial-negative font-bold">-$2,340.80</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">YTD Return</span>
                <span className="financial-neutral font-bold">+8.42%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart Colors */}
      <Card className="card-enhanced">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="w-4 h-4 text-chart-1" />
            Chart Color Palette
          </CardTitle>
          <CardDescription>
            Professional data visualization colors with excellent contrast
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5].map((num) => (
              <div key={num} className="text-center space-y-2">
                <div
                  className={`w-full h-20 rounded-lg bg-chart-${num} border border-border shadow-sm`}
                ></div>
                <span className="text-sm text-muted-foreground">
                  Chart {num}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-6 p-4 bg-muted/30 rounded-lg">
            <h4 className="font-medium mb-2 text-foreground">
              Usage Guidelines:
            </h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Chart 1 (Blue) - Primary data series, portfolio values</li>
              <li>
                • Chart 2 (Green) - Positive values, gains, growth metrics
              </li>
              <li>
                • Chart 3 (Red) - Negative values, losses, risk indicators
              </li>
              <li>• Chart 4 (Orange) - Warning states, neutral changes</li>
              <li>• Chart 5 (Purple) - Secondary data, comparisons</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Card Variations */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="card-enhanced">
          <CardHeader>
            <CardTitle className="text-foreground">Standard Card</CardTitle>
            <CardDescription>
              Default card with shadow and border
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Clean, professional appearance with subtle elevation
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-foreground">Glass Card</CardTitle>
            <CardDescription>Premium glassmorphism effect</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Modern glass effect with backdrop blur for premium feel
            </p>
          </CardContent>
        </Card>

        <Card className="chart-container">
          <CardHeader>
            <CardTitle className="text-foreground">Chart Container</CardTitle>
            <CardDescription>Optimized for data visualization</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-16 bg-gradient-to-r from-chart-1/20 to-chart-2/20 rounded border"></div>
          </CardContent>
        </Card>
      </div>

      {/* Interactive Elements */}
      <Card className="card-enhanced">
        <CardHeader>
          <CardTitle>Interactive Elements</CardTitle>
          <CardDescription>
            Hover and focus states with smooth animations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="interactive-element p-4 bg-card border border-border rounded-lg text-center">
              <CheckCircle className="w-6 h-6 text-success mx-auto mb-2" />
              <p className="text-sm font-medium">Success State</p>
            </div>
            <div className="interactive-element p-4 bg-card border border-border rounded-lg text-center">
              <AlertTriangle className="w-6 h-6 text-warning mx-auto mb-2" />
              <p className="text-sm font-medium">Warning State</p>
            </div>
            <div className="interactive-element p-4 bg-card border border-border rounded-lg text-center">
              <AlertCircle className="w-6 h-6 text-destructive mx-auto mb-2" />
              <p className="text-sm font-medium">Error State</p>
            </div>
            <div className="interactive-element p-4 bg-card border border-border rounded-lg text-center">
              <DollarSign className="w-6 h-6 text-chart-1 mx-auto mb-2" />
              <p className="text-sm font-medium">Info State</p>
            </div>
          </div>

          <div className="data-table">
            <table className="w-full">
              <thead>
                <tr>
                  <th>Asset</th>
                  <th>Value</th>
                  <th>Change</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="font-medium">AAPL</td>
                  <td>$175.50</td>
                  <td className="financial-positive">+2.3%</td>
                  <td>
                    <Badge className="status-success">Strong</Badge>
                  </td>
                </tr>
                <tr>
                  <td className="font-medium">TSLA</td>
                  <td>$238.80</td>
                  <td className="financial-negative">-1.2%</td>
                  <td>
                    <Badge className="status-warning">Watch</Badge>
                  </td>
                </tr>
                <tr>
                  <td className="font-medium">NVDA</td>
                  <td>$445.20</td>
                  <td className="financial-positive">+5.7%</td>
                  <td>
                    <Badge className="status-success">Strong</Badge>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Theme Toggle Demonstration */}
      <Card className="card-enhanced">
        <CardHeader>
          <CardTitle>Theme Compatibility</CardTitle>
          <CardDescription>
            All colors automatically adapt to light and dark themes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-6 bg-background border border-border rounded-lg">
            <p className="text-foreground mb-4">
              The design system uses CSS custom properties with oklch color
              space for:
            </p>
            <ul className="space-y-2 text-muted-foreground">
              <li>✓ Consistent perceptual brightness across themes</li>
              <li>✓ Excellent contrast ratios for accessibility (WCAG AA+)</li>
              <li>✓ Future-proof wide color gamut support</li>
              <li>✓ Smooth theme transitions with no color shifts</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ColorShowcase;
