import React from "react";
import { Routes, Route } from "react-router-dom";

import WelcomePage from "./pages/WelcomePage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";

import HRPage from "./pages/employeePage";
import HRDashboard from "./pages/HrDashboardPage";

import ProjectDashboardPage from "./pages/ProjectManagerDashboardPage";
import ProjectManagerPage from "./pages/projectManagementPage";

import FinanceDashboardPage from "./pages/FinanceDashboardPage";
import FinanceManagerSection from "./pages/FinanceManager";

import SuperAdminEmployeePage from "./pages/SuperAdminEmployeePage";
import SuperAdminProjectPage from "./pages/SuperAdminProjectPage";
import SuperAdminFinancePage from "./pages/SuperAdminFinancePage";
import SuperAdminDashboardPage from "./pages/SuperAdminDashboardPage";
function App() {
  return (
    <Routes>
      <Route path="/" element={<WelcomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      {/* Super Admin Routes */}

      <Route path="s-hr" element={<SuperAdminEmployeePage />} />
      <Route path="s-pm" element={<SuperAdminProjectPage />} />
      <Route path="s-fm" element={<SuperAdminFinancePage />} />
      <Route path = "s-dashboard" element={<SuperAdminDashboardPage/>}/>

      {/* finance manager section */}
      <Route path="/fm" element={<FinanceManagerSection />} />
      <Route path="/fm-dashboard" element={<FinanceDashboardPage />} />
      {/* <Route path="/fm-dashboard" /> */}
      {/* hr manager routes */}
      <Route path="/hr" element={<HRPage />} />
      <Route path="/hr-dashboard" element={<HRDashboard />} />
      {/* project manager routes */}
      <Route path="/pm" element={<ProjectManagerPage />} />
      <Route path="/pm-dashboard" element={<ProjectDashboardPage />} />
    </Routes>
  );
}

export default App;
