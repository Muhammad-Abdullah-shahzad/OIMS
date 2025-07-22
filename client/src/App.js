import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import WelcomePage from "./pages/WelcomePage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";

import HRPage from "./pages/employeePage";
import HRDashboard from "./dashboard/HRDashboard";

import ProjectDashboard from "./dashboard/projectManagerDashboard";
import ProjectManagerPage from "./pages/projectManagementPage";

import FinanceDashboard from "./dashboard/FinanceDashboard";
import FinanceManagerSection from "./pages/FinanceManager";

function App() {
  return (
    <Routes>
      <Route path="/" element={<WelcomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      {/* finance manager section */}
      <Route path="/fm" element={<FinanceManagerSection />} />
      {/* <Route path="/fm-dashboard" /> */}
      {/* hr manager routes */}
      <Route path="/hr" element={<HRPage />} />
      <Route path="/hr-dashboard" element={<HRDashboard />} />
      {/* project manager routes */}
      <Route path="/pm" element={<ProjectManagerPage />} />
      <Route path="/pm-dashboard" element={<ProjectDashboard />} />
    </Routes>
  );
}

export default App;
