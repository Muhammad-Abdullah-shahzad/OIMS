// src/components/ProfileCard.jsx
import React from 'react';
import "./NavBar.css";

export default function ProfileCard({ userData, onAddImageClick }) {
  return (
    <div className="profile-card">
      <div className="profile-card-header">
        <div className="profile-image-wrapper">
          <img
            className="profile-card-image"
            src={userData.profile_image_url || 'https://www.shutterstock.com/image-vector/default-avatar-profile-icon-social-600nw-2409187029.jpg' }
            alt="User Profile"
          />
          <div className="add-image-icon" onClick={onAddImageClick}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 4V20M20 12H4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
        <div className="profile-card-details">
          <h3 className="profile-card-name">{userData.firstName +' '+ userData.lastName}</h3>
          <p className="profile-card-id">ID: {'ORA-0' + userData.userId}</p>
          <p className="profile-card-role">{userData.role}</p>
        </div>
      </div>
      <div className="profile-card-footer">
        <p className="profile-card-email">{userData.email}</p>
      </div>
    </div>
  );
}
