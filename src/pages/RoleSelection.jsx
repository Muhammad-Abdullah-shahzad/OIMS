import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/RoleSelection.css';

const RoleSelection = () => {
  const navigate = useNavigate();

  const goToDashboard = (role) => {
    navigate(`/dashboard/${role}`);
  };

  return (
    <div className="page-container">
      <div className="role-selection">
        <h2>Select Your Role</h2>
        <div className="role-grid">
          <div className="role-card super-admin" onClick={() => goToDashboard('super-admin')}>
            Super Admin
          </div>
          <div className="role-card hr" onClick={() => goToDashboard('hr')}>
            HR
          </div>
          <div className="role-card finance" onClick={() => goToDashboard('finance')}>
            Finance
          </div>
          <div className="role-card project-manager" onClick={() => goToDashboard('project-manager')}>
            Project Manager
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleSelection;
