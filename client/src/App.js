import React from 'react';
import {  Routes, Route } from 'react-router-dom';

import WelcomePage from './pages/WelcomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import SuperAdminDashboard from './dashboard/SuperAdminDashboard';
import HRDashboardPage from './pages/HrDashboardPage';
import FinanceDashboard from './dashboard/FinanceDashboard';
import ProjectDashboard from './dashboard/ProjectDashboard';
import EmployeePage from './pages/employeePage';
import ProjectManagementPage from './pages/projectManagementPage';

function App() {
  return (
      <Routes>
        <Route path='/project-management' element={<ProjectManagementPage/>}/>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/employee" element={<EmployeePage/>} />
        {/* Dashboards */}
        <Route path="/dashboard/super-admin" element={<SuperAdminDashboard />} />
        <Route path="/employee-dashboard" element={<HRDashboardPage />} />
        <Route path="/dashboard/finance" element={<FinanceDashboard />} />
        <Route path="/dashboard/project" element={<ProjectDashboard />} />
      </Routes>

  );
}

export default App;
