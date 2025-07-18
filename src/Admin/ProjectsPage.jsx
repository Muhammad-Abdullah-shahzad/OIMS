import React from 'react';
import '../styles/AdminPage.css';

const ProjectsPage = () => {
  return (
    <div className="admin-page">
      <h2>Projects</h2>
      <table>
        <thead>
          <tr>
            <th>project_id</th>
            <th>client_id</th>
            <th>project_name</th>
            <th>start_date</th>
            <th>end_date</th>
            <th>status</th>
          </tr>
        </thead>
        <tbody>
          {/* Data from backend later */}
        </tbody>
      </table>
    </div>
  );
};

export default ProjectsPage;
