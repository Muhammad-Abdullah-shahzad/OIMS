import React from 'react';
import '../styles/AdminPage.css';

const UsersPage = () => {
  return (
    <div className="admin-page">
      <h2>Manage Users</h2>

      <table>
        <thead>
          <tr>
            <th>User ID</th>
            <th>Full Name</th>
            <th>Email</th>
            <th>Password</th>
            <th>Role</th>
            <th>Status</th>
            <th>Created At</th>
          </tr>
        </thead>
        <tbody>
          {/* Data will be fetched from backend later */}
        </tbody>
      </table>
    </div>
  );
};

export default UsersPage;
