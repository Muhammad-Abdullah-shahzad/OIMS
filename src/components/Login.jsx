import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/AuthForm.css';

const Login = () => {
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault(); // ✅ Prevent browser default submit behavior
    navigate('/RoleSelection'); // ✅ Navigate in same tab
  };

  return (
    <div className="auth-container">
      <h2>Login to OIMS</h2>
      <form className="auth-form" onSubmit={handleLogin}>
        <input type="email" placeholder="Email" required />
        <input type="password" placeholder="Password" required />
        <button type="submit">Login</button>
        <p>
          Don't have an account? <a href="/signup">Sign Up</a>
        </p>
      </form>
    </div>
  );
};

export default Login;
