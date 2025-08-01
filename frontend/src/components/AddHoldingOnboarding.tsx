import React from "react";
import { AddHolding } from "./AddHolding";
import { Button } from "./ui/button";

interface AddHoldingOnboardingProps {
  onNext?: () => void;
}

export const AddHoldingOnboarding: React.FC<AddHoldingOnboardingProps> = ({
  onNext,
}) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-6">
      <h2 className="text-2xl font-bold mb-4">Add Your First Holding</h2>
      <p className="mb-6 max-w-xl text-center text-gray-700">
        Enter your first stock, ETF, or crypto holding to get started. You can
        always add more later!
      </p>
      <div className="w-full max-w-md mb-6">
        <AddHolding onSuccess={onNext} />
      </div>
      {onNext && (
        <Button variant="ghost" onClick={onNext}>
          Skip for now
        </Button>
      )}
    </div>
  );
};
