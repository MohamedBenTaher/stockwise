import React from "react";
import { Outlet, Link, useLocation, Navigate } from "react-router-dom";
import { useUser, useLogout } from "../hooks/useAuth";
import {
  BarChart3,
  Briefcase,
  TrendingUp,
  Shield,
  LogOut,
  User,
  Loader2,
} from "lucide-react";

export const Layout: React.FC = () => {
  const { data: user, isLoading, error } = useUser();
  const logoutMutation = useLogout();
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

  // Redirect to auth if no user or authentication error
  if (!user || error) {
    return <Navigate to="/auth" replace />;
  }

  const handleLogout = () => {
    logoutMutation.mutate();
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
      <div className="w-64 bg-white shadow-sm border-r border-gray-200">
        <div className="flex items-center justify-center h-16 px-4 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-900">StockWise</h1>
        </div>

        <nav className="mt-5 px-2">
          <div className="space-y-1">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`
                    group flex items-center px-2 py-2 text-sm font-medium rounded-md
                    ${
                      isActive
                        ? "bg-primary-100 text-primary-900"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }
                  `}
                >
                  <item.icon
                    className={`
                      mr-3 h-5 w-5 flex-shrink-0
                      ${
                        isActive
                          ? "text-primary-500"
                          : "text-gray-400 group-hover:text-gray-500"
                      }
                    `}
                  />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Welcome back, {user.full_name || user.email}
              </h2>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5 text-gray-400" />
                <span className="text-sm text-gray-600">{user.email}</span>
              </div>

              <button
                onClick={handleLogout}
                disabled={logoutMutation.isPending}
                className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-900 disabled:opacity-50"
              >
                {logoutMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <LogOut className="h-4 w-4" />
                )}
                <span>Logout</span>
              </button>
            </div>
          </div>
        </header>

        {/* Main content area */}
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <div className="p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
