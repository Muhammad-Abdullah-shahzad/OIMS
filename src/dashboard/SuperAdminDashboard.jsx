import React, { useState } from 'react';
import UsersPage from '../Admin/UsersPage';
import EmployeesPage from '../Admin/EmployeesPage';
import ClientsPage from '../Admin/ClientsPage';
import ProjectsPage from '../Admin/ProjectsPage';
import AssignmentsPage from '../Admin/AssignmentsPage';
import '../styles/Dashboard.css';

const SuperAdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('users');

  const renderTab = () => {
    switch (activeTab) {
      case 'users':
        return <UsersPage />;
      case 'employees':
        return <EmployeesPage />;
      case 'clients':
        return <ClientsPage />;
      case 'projects':
        return <ProjectsPage />;
      case 'assignments':
        return <AssignmentsPage />;
      default:
        return null;
    }
  };

  return (
    <div className="superadmin-dashboard">
      <div className="tab-bar">
        <button
          className={activeTab === 'users' ? 'active' : ''}
          onClick={() => setActiveTab('users')}
        >
          Users
        </button>
        <button
          className={activeTab === 'employees' ? 'active' : ''}
          onClick={() => setActiveTab('employees')}
        >
          Employees
        </button>
        <button
          className={activeTab === 'clients' ? 'active' : ''}
          onClick={() => setActiveTab('clients')}
        >
          Clients
        </button>
        <button
          className={activeTab === 'projects' ? 'active' : ''}
          onClick={() => setActiveTab('projects')}
        >
          Projects
        </button>
        <button
          className={activeTab === 'assignments' ? 'active' : ''}
          onClick={() => setActiveTab('assignments')}
        >
          Assignments
        </button>
      </div>

      <div className="tab-content">{renderTab()}</div>
    </div>
  );
};

export default SuperAdminDashboard;
