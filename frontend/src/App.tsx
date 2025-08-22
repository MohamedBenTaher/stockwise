import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useState } from "react";
import { Dashboard } from "./components/Dashboard";
import { Holdings } from "./components/Holdings";
import { AddHoldingPage } from "./components/AddHoldingPage";
import { Insights } from "./components/Insights";
import { RiskAnalysis } from "./components/RiskAnalysis";
import Charts from "./pages/Charts";
import AuthForm from "./components/Auth_new";
import { Layout } from "./components/Layout";
import { Toaster } from "./components/ui/sonner";
import { OnboardingFlow } from "./components/OnboardingFlow";
import LandingPage from "./components/LandingPage";
import { useUser } from "./hooks/useAuth";
import { Loader2 } from "lucide-react";
import "./App.css";

function App() {
  const { data: user, isLoading, error } = useUser();

  // Check if user has completed onboarding (this would typically come from user profile or localStorage)
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(() => {
    return localStorage.getItem("stockwise_onboarding_completed") === "true";
  });

  const handleOnboardingComplete = () => {
    setHasCompletedOnboarding(true);
    // Save to localStorage
    localStorage.setItem("stockwise_onboarding_completed", "true");
  };

  if (isLoading) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin w-8 h-8 text-primary" />
      </div>
    );
  }

  return (
    <Router>
      <div className="w-full min-h-screen">
        <Routes>
          {/* Landing page is always public */}
          <Route path="/" element={<LandingPage />} />
          {/* Auth page is public */}
          <Route path="/auth" element={<AuthForm />} />

          {/* Dashboard and all protected subroutes */}
          <Route
            path="/dashboard"
            element={user ? <Layout /> : <Navigate to="/" replace />}
          >
            <Route index element={<Dashboard />} />
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
  );
}
export default App;
