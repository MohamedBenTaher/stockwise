import React, { useState, useEffect } from "react";
import { CheckCircle, X, Bookmark } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { cn } from "@/lib/utils";

interface ToastProps {
  message: string;
  type?: "success" | "error" | "info";
  duration?: number;
  onClose?: () => void;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  type = "success",
  duration = 3000,
  onClose,
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onClose?.(), 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => onClose?.(), 300);
  };

  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "error":
        return <X className="h-4 w-4 text-red-500" />;
      case "info":
        return <Bookmark className="h-4 w-4 text-blue-500" />;
      default:
        return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
  };

  const getColorClasses = () => {
    switch (type) {
      case "success":
        return "border-green-500/20 bg-green-50/90 dark:bg-green-950/90 text-green-800 dark:text-green-200";
      case "error":
        return "border-red-500/20 bg-red-50/90 dark:bg-red-950/90 text-red-800 dark:text-red-200";
      case "info":
        return "border-blue-500/20 bg-blue-50/90 dark:bg-blue-950/90 text-blue-800 dark:text-blue-200";
      default:
        return "border-green-500/20 bg-green-50/90 dark:bg-green-950/90 text-green-800 dark:text-green-200";
    }
  };

  return (
    <div
      className={cn(
        "fixed top-4 right-4 z-50 transition-all duration-300",
        isVisible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
      )}
    >
      <Card
        className={cn(
          "backdrop-blur-md shadow-lg border p-4 min-w-64 max-w-80",
          getColorClasses()
        )}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {getIcon()}
            <span className="text-sm font-medium">{message}</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="h-6 w-6 p-0 hover:bg-black/5 dark:hover:bg-white/10"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </Card>
    </div>
  );
};

// Toast Manager Context
interface ToastContextType {
  showToast: (message: string, type?: ToastProps["type"]) => void;
}

const ToastContext = React.createContext<ToastContextType | null>(null);

interface ToastProviderProps {
  children: React.ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toasts, setToasts] = useState<
    Array<{ id: string; props: ToastProps }>
  >([]);

  const showToast = (message: string, type: ToastProps["type"] = "success") => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [
      ...prev,
      {
        id,
        props: {
          message,
          type,
          onClose: () => {
            setToasts((prev) => prev.filter((toast) => toast.id !== id));
          },
        },
      },
    ]);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast.props} />
      ))}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};
