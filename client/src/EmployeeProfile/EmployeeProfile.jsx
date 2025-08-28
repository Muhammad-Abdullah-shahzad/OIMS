import React from 'react';
import "../styles/employeeProfileCard.scss";

/**
 * A React component to display an employee's profile in a card format.
 * @param {object} props The component props.
 * @param {string} props.employee_image_url The URL of the employee's profile image.
 * @param {string} props.name The name of the employee.
 * @param {string} props.designation The job title or designation of the employee.
 */
export default function EmployeeProfile({ profileImageUrl, name, designation }) {
  // Fallback image in case the provided URL is broken
  const handleImageError = (e) => {
    e.target.onerror = null; // Prevents infinite loop
    e.target.src = "https://placehold.co/100x100"; // Placeholder image
  };

  return (
    // <div className="employee-profile-card">
      <div className="profile-image-container">
        <img
          src={profileImageUrl || 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSksG4mm4xFN-Ufeaf1ZZ8ixWe2k4aZknK1MQ&s'}
          alt={`Profile picture of ${name}`}
          onError={handleImageError}
          className="profile-image"
        />
      </div>
  
    // </div>
  );
}
