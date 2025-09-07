import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  TrendingUp,
  Shield,
  Brain,
  BarChart3,
  CheckCircle,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { AddHolding } from "@/features/holdings";

interface OnboardingFlowProps {
  onComplete: () => void;
}

type OnboardingStep = "welcome" | "features" | "add-holding" | "success";

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({
  onComplete,
}) => {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>("welcome");
  const [hasAddedHolding, setHasAddedHolding] = useState(false);

  const steps = [
    { id: "welcome", label: "Welcome", completed: true },
    { id: "features", label: "Features", completed: currentStep !== "welcome" },
    { id: "add-holding", label: "Add Holding", completed: hasAddedHolding },
    { id: "success", label: "Complete", completed: currentStep === "success" },
  ];

  const currentStepIndex = steps.findIndex((step) => step.id === currentStep);
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  const handleNext = () => {
    if (currentStep === "welcome") setCurrentStep("features");
    else if (currentStep === "features") setCurrentStep("add-holding");
    else if (currentStep === "add-holding") setCurrentStep("success");
    else if (currentStep === "success") onComplete();
  };

  const handleHoldingAdded = () => {
    setHasAddedHolding(true);
    setCurrentStep("success");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Progress Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome to StockWise
            </h1>
            <Badge variant="outline">
              {currentStepIndex + 1} of {steps.length}
            </Badge>
          </div>
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between mt-2 text-sm text-gray-600">
            {steps.map((step, index) => (
              <span
                key={step.id}
                className={`flex items-center ${
                  index <= currentStepIndex ? "text-blue-600 font-medium" : ""
                }`}
              >
                {step.completed && <CheckCircle className="w-4 h-4 mr-1" />}
                {step.label}
              </span>
            ))}
          </div>
        </div>

        {/* Step Content */}
        {currentStep === "welcome" && (
          <div className="text-center space-y-8">
            <div className="space-y-4">
              <div className="w-20 h-20 mx-auto bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900">
                Smarter insights for your investments
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                StockWise is an AI-powered portfolio dashboard that helps you
                track holdings, analyze risk, and get actionable investment
                insights. Let's get you started!
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
              <Card className="text-center p-6">
                <TrendingUp className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Track Performance</h3>
                <p className="text-sm text-gray-600">
                  Monitor your portfolio value, P&L, and top performers
                </p>
              </Card>
              <Card className="text-center p-6">
                <Shield className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Analyze Risk</h3>
                <p className="text-sm text-gray-600">
                  Get risk metrics and overexposure analysis
                </p>
              </Card>
              <Card className="text-center p-6">
                <Brain className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                <h3 className="font-semibold mb-2">AI Insights</h3>
                <p className="text-sm text-gray-600">
                  Receive personalized investment recommendations
                </p>
              </Card>
            </div>

            <Button size="lg" onClick={handleNext} className="px-8">
              Get Started <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}

        {currentStep === "features" && (
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-bold text-gray-900">
                Powerful Features
              </h2>
              <p className="text-gray-600">
                Here's what you can do with StockWise
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="p-6">
                <CardHeader className="pb-4">
                  <div className="flex items-center space-x-3">
                    <BarChart3 className="w-6 h-6 text-blue-600" />
                    <CardTitle>Portfolio Dashboard</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm">
                      Real-time portfolio value tracking
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm">Profit/Loss calculations</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm">Asset allocation charts</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm">Top/worst performers</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="p-6">
                <CardHeader className="pb-4">
                  <div className="flex items-center space-x-3">
                    <Shield className="w-6 h-6 text-blue-600" />
                    <CardTitle>Risk Analysis</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm">
                      Sector concentration analysis
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm">Geographic diversification</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm">Volatility metrics</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm">Risk heatmaps</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="p-6">
                <CardHeader className="pb-4">
                  <div className="flex items-center space-x-3">
                    <Brain className="w-6 h-6 text-blue-600" />
                    <CardTitle>AI-Powered Insights</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm">
                      Personalized recommendations
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm">Diversification suggestions</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm">Risk alerts</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm">Market analysis</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="p-6">
                <CardHeader className="pb-4">
                  <div className="flex items-center space-x-3">
                    <TrendingUp className="w-6 h-6 text-blue-600" />
                    <CardTitle>Performance Tracking</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm">
                      Historical performance charts
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm">Benchmark comparisons</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm">Performance analytics</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm">Automated price updates</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="text-center">
              <Button size="lg" onClick={handleNext} className="px-8">
                Add Your First Holding <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {currentStep === "add-holding" && (
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-bold text-gray-900">
                Add Your First Holding
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Start by adding a stock, ETF, or other asset to your portfolio.
                We'll automatically fetch current prices and track your
                performance.
              </p>
            </div>

            <div className="max-w-lg mx-auto">
              <AddHolding onSuccess={handleHoldingAdded} />
            </div>

            <div className="text-center">
              <Button
                variant="ghost"
                onClick={handleNext}
                className="text-gray-600"
              >
                Skip for now
              </Button>
            </div>
          </div>
        )}

        {currentStep === "success" && (
          <div className="text-center space-y-8">
            <div className="space-y-4">
              <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900">
                You're All Set! 🎉
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                {hasAddedHolding
                  ? "Great! You've added your first holding. Your portfolio is now being tracked and analyzed."
                  : "Welcome to StockWise! You can add holdings anytime from your dashboard."}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
              <Card className="text-center p-6 border-blue-200 bg-blue-50">
                <BarChart3 className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                <h3 className="font-semibold mb-2">View Dashboard</h3>
                <p className="text-sm text-gray-600">
                  See your portfolio overview and performance
                </p>
              </Card>
              <Card className="text-center p-6 border-blue-200 bg-blue-50">
                <Brain className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Get Insights</h3>
                <p className="text-sm text-gray-600">
                  Receive AI-powered investment recommendations
                </p>
              </Card>
              <Card className="text-center p-6 border-blue-200 bg-blue-50">
                <Shield className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Analyze Risk</h3>
                <p className="text-sm text-gray-600">
                  Review your portfolio's risk profile
                </p>
              </Card>
            </div>

            <Button size="lg" onClick={onComplete} className="px-8">
              Go to Dashboard <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
