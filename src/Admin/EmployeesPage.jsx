import React from 'react';
import '../styles/AdminPage.css';

const EmployeesPage = () => {
  return (
    <div className="admin-page">
      <h2>Employees</h2>
      <table>
        <thead>
          <tr>
            <th>emp_id</th>
            <th>user_id</th>
            <th>full_name</th>
            <th>cnic</th>
            <th>dob</th>
            <th>gender</th>
            <th>contact</th>
            <th>email</th>
            <th>address</th>
            <th>join_date</th>
          </tr>
        </thead>
        <tbody>
          {/* Data from backend later */}
        </tbody>
      </table>
    </div>
  );
};

export default EmployeesPage;
