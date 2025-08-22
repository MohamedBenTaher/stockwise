import React from "react";
import { Outlet } from "react-router-dom";
import { useUser } from "../hooks/useAuth";
import { Loader2 } from "lucide-react";
import { SidebarInset, SidebarProvider } from "./ui/sidebar";
import { AppSidebar } from "./app-sidebar";
import { SiteHeader } from "./site-header";

export const Layout: React.FC = () => {
  const { data: user, isLoading } = useUser();

  // Debug logging
  console.log("Layout: user =", user);
  console.log("Layout: isLoading =", isLoading);

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
