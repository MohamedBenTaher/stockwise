import React from "react";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate("/onboarding");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] p-8 text-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <img
        src="/stockwise.svg"
        alt="StockWise Logo"
        className="w-24 h-24 mb-6 animate-bounce"
      />
      <h1 className="text-4xl font-extrabold mb-4 tracking-tight bg-gradient-to-r from-blue-700 to-indigo-500 bg-clip-text text-transparent dark:from-blue-300 dark:to-indigo-200">
        StockWise
      </h1>
      <p className="text-lg mb-8 max-w-2xl text-gray-700 dark:text-gray-200">
        Smarter insights for your investments. Track your portfolio, analyze
        risk, and get actionable AI-powered suggestions. Start your journey to
        better investing today.
      </p>
      <Button
        size="lg"
        onClick={handleGetStarted}
        className="px-8 py-3 text-lg"
      >
        Get Started
      </Button>
    </div>
  );
};
