import React from "react";
import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  text?: string;
  className?: string;
  fullScreen?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = "md",
  text = "Loading...",
  className = "",
  fullScreen = false,
}) => {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  };

  const containerClasses = fullScreen
    ? "min-h-screen flex items-center justify-center"
    : "flex items-center justify-center py-8";

  return (
    <div className={`${containerClasses} ${className}`}>
      <div className="flex items-center space-x-3 p-6 glass-card-hover animate-fade-in">
        <Loader2 className={`${sizeClasses[size]} animate-spin text-chart-1`} />
        <span className="text-foreground font-medium">{text}</span>
      </div>
    </div>
  );
};

interface LoadingCardProps {
  title?: string;
  className?: string;
}

export const LoadingCard: React.FC<LoadingCardProps> = ({
  title = "Loading data...",
  className = "",
}) => {
  return (
    <div className={`glass-card-hover p-6 animate-pulse ${className}`}>
      <div className="space-y-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-2 h-2 bg-chart-1 rounded-full animate-pulse" />
          <div className="h-4 bg-accent rounded w-32"></div>
        </div>
        <div className="space-y-3">
          <div className="h-4 bg-accent rounded w-3/4"></div>
          <div className="h-4 bg-accent rounded w-1/2"></div>
          <div className="h-4 bg-accent rounded w-5/6"></div>
        </div>
      </div>
    </div>
  );
};

interface LoadingStateProps {
  title?: string;
  description?: string;
  children?: React.ReactNode;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  title = "Loading",
  description = "Please wait while we fetch your data...",
  children,
}) => {
  return (
    <div className="space-y-8">
      <div className="glass-card p-6 animate-fade-in">
        <h1 className="text-3xl font-semibold text-foreground mb-2">{title}</h1>
        <p className="text-muted-foreground">{description}</p>
      </div>

      {children || (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <LoadingCard key={i} />
          ))}
        </div>
      )}
    </div>
  );
};

export default LoadingSpinner;
