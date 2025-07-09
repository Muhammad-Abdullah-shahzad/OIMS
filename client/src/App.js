import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import WelcomePage from './pages/WelcomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';

import SuperAdminDashboard from './dashboard/SuperAdminDashboard';
import HRDashboard from './dashboard/HRDashboard';
import FinanceDashboard from './dashboard/FinanceDashboard';
import ProjectDashboard from './dashboard/ProjectDashboard';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        {/* Dashboards */}
        <Route path="/dashboard/super-admin" element={<SuperAdminDashboard />} />
        <Route path="/dashboard/hr" element={<HRDashboard />} />
        <Route path="/dashboard/finance" element={<FinanceDashboard />} />
        <Route path="/dashboard/project" element={<ProjectDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
