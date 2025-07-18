import React from 'react';
import '../styles/Dashboard.css';

const DashboardCard = ({ title, count, onClick }) => {
  return (
    <div className="card" onClick={onClick}>
      <h3>{title}</h3>
      <p>{count} items</p>
    </div>
  );
};

export default DashboardCard;
