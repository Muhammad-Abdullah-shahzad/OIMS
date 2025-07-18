import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Pages
import WelcomePage from './pages/WelcomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import RoleSelection from './pages/RoleSelection';

// Dashboards
import SuperAdminDashboard from './dashboard/SuperAdminDashboard';
import HRDashboard from './dashboard/HRDashboard';
import FinanceDashboard from './dashboard/FinanceDashboard';
import ProjectDashboard from './dashboard/ProjectDashboard';

// Admin Pages (only accessible to Super Admin)
import UsersPage from './Admin/UsersPage';
import EmployeesPage from './Admin/EmployeesPage';
import ClientsPage from './Admin/ClientsPage';
import ProjectsPage from './Admin/ProjectsPage';
import AssignmentsPage from './Admin/AssignmentsPage';

function App() {
  return (
    <Router>
      <Routes>

        {/* Public Pages */}
        <Route path="/" element={<WelcomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/roleselection" element={<RoleSelection />} />

        {/* Dashboards */}
        <Route path="/dashboard/super-admin" element={<SuperAdminDashboard />} />
        <Route path="/dashboard/hr" element={<HRDashboard />} />
        <Route path="/dashboard/finance" element={<FinanceDashboard />} />
        <Route path="/dashboard/project-manager" element={<ProjectDashboard />} />

        {/* Super Admin - Admin Pages */}
        <Route path="/admin/users" element={<UsersPage />} />
        <Route path="/admin/employees" element={<EmployeesPage />} />
        <Route path="/admin/clients" element={<ClientsPage />} />
        <Route path="/admin/projects" element={<ProjectsPage />} />
        <Route path="/admin/assignments" element={<AssignmentsPage />} />

      </Routes>
    </Router>
  );
}

export default App;
