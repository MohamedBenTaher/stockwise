import React from "react";
import { Outlet, Link, useLocation, Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  BarChart3,
  Briefcase,
  TrendingUp,
  Shield,
  LogOut,
  User,
  Loader2,
} from "lucide-react";
import { SidebarInset, SidebarProvider } from "./ui/sidebar";
import { AppSidebar } from "./app-sidebar";
import { SiteHeader } from "./site-header";

export const Layout: React.FC = () => {
  const { user, isLoading, logout } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          <span className="text-gray-600">Loading...</span>
        </div>
      </div>
    );
  }

  // Redirect to auth if no user
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const handleLogout = () => {
    logout();
  };

  const navigation = [
    { name: "Dashboard", href: "/", icon: BarChart3 },
    { name: "Holdings", href: "/holdings", icon: Briefcase },
    { name: "Insights", href: "/insights", icon: TrendingUp },
    { name: "Risk Analysis", href: "/risk", icon: Shield },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <SidebarProvider
        style={
          {
            "--sidebar-width": "calc(var(--spacing) * 72)",
            "--header-height": "calc(var(--spacing) * 12)",
          } as React.CSSProperties
        }
      >
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader />
          {/* Mainpm dlx shadcn@latest add sidebarn content */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Top header */}

            {/* Main content area */}
            <main className="flex-1 overflow-y-auto bg-gray-50">
              <div className="p-6">
                <Outlet />
              </div>
            </main>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
};
