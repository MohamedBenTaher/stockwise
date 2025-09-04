import React from "react";
import { AlertCircle, RefreshCw, Home, ArrowLeft } from "lucide-react";
import { Button } from "./button";

interface ErrorStateProps {
  title?: string;
  message?: string;
  showRetry?: boolean;
  showHome?: boolean;
  showBack?: boolean;
  onRetry?: () => void;
  onHome?: () => void;
  onBack?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = "Something went wrong",
  message = "We encountered an error while loading your data. Please try again.",
  showRetry = true,
  showHome = false,
  showBack = false,
  onRetry,
  onHome,
  onBack,
  className = "",
}) => {
  return (
    <div
      className={`glass-card-hover p-8 animate-fade-in text-center ${className}`}
    >
      <div className="flex flex-col items-center space-y-4">
        <div className="p-4 rounded-full bg-chart-3/10 border border-chart-3/20">
          <AlertCircle className="h-8 w-8 text-chart-3" />
        </div>

        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-foreground">{title}</h3>
          <p className="text-muted-foreground max-w-md">{message}</p>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-4">
          {showRetry && onRetry && (
            <Button
              onClick={onRetry}
              variant="default"
              className="bg-chart-1/20 hover:bg-chart-1/30 text-foreground border border-chart-1/30"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          )}

          {showHome && onHome && (
            <Button
              onClick={onHome}
              variant="outline"
              className="border-border/50 hover:bg-accent"
            >
              <Home className="h-4 w-4 mr-2" />
              Go Home
            </Button>
          )}

          {showBack && onBack && (
            <Button
              onClick={onBack}
              variant="ghost"
              className="hover:bg-accent"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

interface NetworkErrorProps {
  onRetry?: () => void;
}

export const NetworkError: React.FC<NetworkErrorProps> = ({ onRetry }) => {
  return (
    <ErrorState
      title="Connection Error"
      message="Unable to connect to the server. Please check your internet connection and try again."
      showRetry={true}
      onRetry={onRetry}
    />
  );
};

interface NotFoundErrorProps {
  entity?: string;
  onHome?: () => void;
  onBack?: () => void;
}

export const NotFoundError: React.FC<NotFoundErrorProps> = ({
  entity = "page",
  onHome,
  onBack,
}) => {
  return (
    <ErrorState
      title={`${entity.charAt(0).toUpperCase() + entity.slice(1)} Not Found`}
      message={`The ${entity} you're looking for doesn't exist or has been moved.`}
      showRetry={false}
      showHome={true}
      showBack={true}
      onHome={onHome}
      onBack={onBack}
    />
  );
};

export default ErrorState;
