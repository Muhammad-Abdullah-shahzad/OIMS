import React from 'react';
import '../styles/AdminPage.css';

const AssignmentsPage = () => {
  return (
    <div className="admin-page">
      <h2>Assignments</h2>
      <table>
        <thead>
          <tr>
            <th>assignment_id</th>
            <th>project_id</th>
            <th>emp_id</th>
            <th>role</th>
            <th>assigned_date</th>
          </tr>
        </thead>
        <tbody>
          {/* Data from backend later */}
        </tbody>
      </table>
    </div>
  );
};

export default AssignmentsPage;
