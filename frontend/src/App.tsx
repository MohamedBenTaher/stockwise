import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
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
import { Onboarding } from "./components/Onboarding";
import { AddHoldingOnboarding } from "./components/AddHoldingOnboarding";
import { LandingPage } from "./components/LandingPage";
import "./App.css";

function App() {
  // This can be replaced with a real onboarding check (e.g. from user profile or localStorage)
  const [onboardingStep, setOnboardingStep] = useState<0 | 1 | 2 | 3>(0);

  // 0 = landing, 1 = onboarding, 2 = add holding, 3 = done
  const handleNext = () =>
    setOnboardingStep((step) => {
      if (step === 0) return 1;
      if (step === 1) return 2;
      return 3;
    });

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/auth" element={<AuthForm />} />
          <Route
            path="/onboarding"
            element={
              onboardingStep === 1 ? (
                <Onboarding onNext={handleNext} />
              ) : onboardingStep === 2 ? (
                <AddHoldingOnboarding onNext={handleNext} />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
          <Route
            path="/"
            element={
              onboardingStep === 0 ? (
                <LandingPage onStart={handleNext} />
              ) : onboardingStep < 3 ? (
                <Navigate to="/onboarding" replace />
              ) : (
                <Layout />
              )
            }
          >
            {onboardingStep === 3 && (
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
