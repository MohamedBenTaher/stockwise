import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Dashboard } from "@/features/dashboard";
import { Holdings, AddHoldingPage } from "@/features/holdings";
import { Insights } from "@/features/insights";
import { RiskAnalysis } from "@/features/risk";
import Charts from "./pages/Charts";
import { AuthForm } from "@/features/auth";
import { Layout } from "@/features/layout";
import { Toaster } from "./components/ui/sonner";
import { LandingPage } from "@/features/landing";
import { useUser } from "./hooks/useAuth";
import { Loader2 } from "lucide-react";
import { ThemeProvider } from "./contexts/ThemeContext";
import "./App.css";
import { News } from "@/features/news";
import ColorShowcase from "./components/ColorShowcase";

function App() {
  const { data: user, isLoading } = useUser();

  if (isLoading) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin w-8 h-8 text-primary" />
      </div>
    );
  }

  return (
    <ThemeProvider>
      <Router>
        <div className="w-full min-h-screen">
          <Routes>
            {/* Landing page is always public */}
            <Route path="/" element={<LandingPage />} />
            {/* Auth page is public */}
            <Route path="/auth" element={<AuthForm />} />
            {/* Color showcase - temporary for design review */}
            <Route path="/colors" element={<ColorShowcase />} />

            {/* Dashboard and all protected subroutes */}
            <Route
              path="/dashboard"
              element={user ? <Layout /> : <Navigate to="/" replace />}
            >
              <Route index element={<Dashboard />} />
              <Route path="news" element={<News />} />
              <Route path="holdings" element={<Holdings />} />
              <Route path="holdings/add" element={<AddHoldingPage />} />
              <Route path="insights" element={<Insights />} />
              <Route path="risk" element={<RiskAnalysis />} />
              <Route path="charts" element={<Charts />} />
              {/* Add more nested/protected routes here as needed */}
            </Route>

            {/* Catch-all: redirect to landing */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <Toaster />
        </div>
      </Router>
    </ThemeProvider>
  );
}
export default App;
