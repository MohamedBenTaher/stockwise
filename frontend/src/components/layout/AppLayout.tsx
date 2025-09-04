import React from "react";

interface AppLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  className?: string;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  children,
  title,
  description,
  className = "",
}) => {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 opacity-[0.02]">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern
                id="grid"
                width="40"
                height="40"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 40 0 L 0 0 0 40"
                  fill="none"
                  stroke="hsl(var(--foreground))"
                  strokeWidth="1"
                  strokeDasharray="2,2"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>
      </div>

      <div className={`relative z-10 space-y-8 ${className}`}>
        {/* Page Header */}
        {(title || description) && (
          <div className="glass-card p-6 animate-fade-in">
            {title && (
              <h1 className="text-3xl font-semibold text-foreground mb-2">
                {title}
              </h1>
            )}
            {description && (
              <p className="text-muted-foreground">{description}</p>
            )}
          </div>
        )}

        {/* Content */}
        <div className="space-y-8">{children}</div>
      </div>
    </div>
  );
};

export default AppLayout;
