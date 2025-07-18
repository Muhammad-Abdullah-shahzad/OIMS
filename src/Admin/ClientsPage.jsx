import React from 'react';
import '../styles/AdminPage.css';

const ClientsPage = () => {
  return (
    <div className="admin-page">
      <h2>Clients</h2>
      <table>
        <thead>
          <tr>
            <th>client_id</th>
            <th>client_name</th>
            <th>company</th>
            <th>email</th>
            <th>contact</th>
            <th>address</th>
          </tr>
        </thead>
        <tbody>
          {/* Data from backend later */}
        </tbody>
      </table>
    </div>
  );
};

export default ClientsPage;
