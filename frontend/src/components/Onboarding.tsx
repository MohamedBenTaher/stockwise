import React from "react";
import { Button } from "./ui/button";

interface OnboardingProps {
  onNext: () => void;
}

export const Onboarding: React.FC<OnboardingProps> = ({ onNext }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
      <h1 className="text-3xl font-bold mb-4">Welcome to StockWise! 🎉</h1>
      <p className="text-lg mb-6 max-w-xl">
        Smarter insights for your investments. Track your portfolio, analyze
        risk, and get actionable AI-powered suggestions. Let’s get started by
        adding your first holding!
      </p>
      <Button size="lg" onClick={onNext}>
        Get Started
      </Button>
    </div>
  );
};
