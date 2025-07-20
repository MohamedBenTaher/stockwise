import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Dashboard } from "./components/Dashboard";
import { Holdings } from "./components/Holdings";
import { AddHoldingPage } from "./components/AddHoldingPage";
import { Insights } from "./components/Insights";
import { RiskAnalysis } from "./components/RiskAnalysis";
import AuthForm from "./components/Auth_new";
import { Layout } from "./components/Layout";
import { Toaster } from "./components/ui/sonner";
import "./App.css";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/auth" element={<AuthForm />} />
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="holdings" element={<Holdings />} />
            <Route path="holdings/add" element={<AddHoldingPage />} />
            <Route path="insights" element={<Insights />} />
            <Route path="risk" element={<RiskAnalysis />} />
          </Route>
        </Routes>
        <Toaster />
      </div>
    </Router>
  );
}

export default App;
