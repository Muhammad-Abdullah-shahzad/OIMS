import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../styles/resetPassword.scss';

const BASE_URL ='https://oimsapi.oradigitals.com';

const ResetPassword = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { userId } = location.state || {};

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handlePasswordReset = async (e) => {
    e.preventDefault();

    if (!userId) {
      setMessage('Error: No user ID found. Please go back to the previous step.');
      setIsError(true);
      return;
    }

    if (password !== confirmPassword) {
      setMessage('Error: Passwords do not match.');
      setIsError(true);
      return;
    }

    if (password.length < 6) {
      setMessage('Error: Password must be at least 6 characters long.');
      setIsError(true);
      return;
    }

    setIsLoading(true);
    setMessage('');
    setIsError(false);

    try {
      console.log("userId and  password sent to reset password api " , {userId,password} );
      const response = await fetch(`${BASE_URL}/password/reset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, password }),
      });

      if (response.ok) {
        setMessage('Password reset successfully! Redirecting to login...');
        setIsError(false);
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        const errorData = await response.json();
        setMessage(errorData.message || 'Failed to reset password. Please try again.');
        setIsError(true);
      }
    } catch (error) {
      console.error('Password reset failed:', error);
      setMessage('An error occurred. Please check your network connection and try again.');
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="reset-password-wrapper">
      <div className="reset-password-form">
        <h2 className="reset-password-heading">Reset Your Password</h2>
        <div className="reset-password-input-group">
          <label htmlFor="new-password" className="reset-password-label">New Password</label>
          <input
            type="password"
            name="new-password"
            id="new-password"
            placeholder="Enter your new password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="reset-password-input"
            required
          />
        </div>
        <div className="reset-password-input-group">
          <label htmlFor="confirm-password" className="reset-password-label">Confirm New Password</label>
          <input
            type="password"
            name="confirm-password"
            id="confirm-password"
            placeholder="Confirm your new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="reset-password-input"
            required
          />
        </div>
        <button
          type="submit"
          onClick={handlePasswordReset}
          className={`reset-password-button ${isLoading ? 'button-disabled' : ''}`}
          disabled={isLoading}
        >
          {isLoading ? 'Resetting...' : 'Reset Password'}
        </button>
        {message && (
          <p className={`reset-password-message ${isError ? 'error-message' : 'success-message'}`}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;