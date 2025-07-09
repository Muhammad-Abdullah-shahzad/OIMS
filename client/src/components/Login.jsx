import React from 'react';
import '../styles/AuthForm.css';

const Login = () => {
  return (
    <div className="auth-container">
      <h2>Login to OIMS</h2>
      <form className="auth-form">
        <input type="email" placeholder="Email" required />
        <input type="password" placeholder="Password" required />
        <button type="submit">Login</button>
        <p>Don't have an account? <a href="/signup">Sign Up</a></p>
      </form>
    </div>
  );
};

export default Login;
