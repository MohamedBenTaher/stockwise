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
  // TEMPORARY: Comment out auth to test landing page
  // const { data: user, isLoading, error } = useUser();

  // Debug logging
  console.log("App: TESTING - Auth disabled, showing landing page");

  // Check if user has completed onboarding (this would typically come from user profile or localStorage)
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(() => {
    return localStorage.getItem("stockwise_onboarding_completed") === "true";
  });

  const handleOnboardingComplete = () => {
    setHasCompletedOnboarding(true);
    // Save to localStorage
    localStorage.setItem("stockwise_onboarding_completed", "true");
  };

  // TEMPORARY: Always show landing page for testing
  return (
    <Router>
      <div className="w-full min-h-screen">
        <Routes>
          <Route path="/auth" element={<AuthForm />} />
          <Route path="/" element={<LandingPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Toaster />
      </div>
    </Router>
  );
}
export default App;
