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
import { LandingPage } from "./components/LandingPage";
import "./App.css";

function App() {
  // Check if user has completed onboarding (this would typically come from user profile or localStorage)
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(() => {
    return localStorage.getItem("stockwise_onboarding_completed") === "true";
  });

  const handleOnboardingComplete = () => {
    setHasCompletedOnboarding(true);
    // Save to localStorage
    localStorage.setItem("stockwise_onboarding_completed", "true");
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/auth" element={<AuthForm />} />
          <Route
            path="/onboarding"
            element={
              !hasCompletedOnboarding ? (
                <OnboardingFlow onComplete={handleOnboardingComplete} />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
          <Route
            path="/"
            element={!hasCompletedOnboarding ? <LandingPage /> : <Layout />}
          >
            {hasCompletedOnboarding && (
              <>
                <Route index element={<Dashboard />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="holdings" element={<Holdings />} />
                <Route path="holdings/add" element={<AddHoldingPage />} />
                <Route path="insights" element={<Insights />} />
                <Route path="risk" element={<RiskAnalysis />} />
                <Route path="charts" element={<Charts />} />
              </>
            )}
          </Route>
        </Routes>
        <Toaster />
      </div>
    </Router>
  );
}

export default App;
