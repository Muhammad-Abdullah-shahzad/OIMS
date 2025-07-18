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

function App() {
  return (
    <Routes>
      <Route path="/" element={<WelcomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />

      {/* hr manager routes */}
      <Route path="/hr" element={<HRPage />} />
      <Route path="/hr-dashboard" element={<HRDashboard />} />
      {/* project manager routes */}
      <Route path="/pm" element={<ProjectManagerPage />} />
      <Route path="/pm-dashboard" element= {<ProjectDashboard/>} />

     
    </Routes>
  );
}

export default App;
