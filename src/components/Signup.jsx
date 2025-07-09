import React from 'react';
import '../styles/AuthForm.css';

const Signup = () => {
  return (
    <div className="auth-container">
      <h2>Create OIMS Account</h2>
      <form className="auth-form">
        <input type="text" placeholder="Full Name" required />
        <input type="email" placeholder="Email" required />
        <input type="password" placeholder="Password" required />
        <input type="password" placeholder="Confirm Password" required />
        <button type="submit">Sign Up</button>
        <p>Already have an account? <a href="/login">Login</a></p>
      </form>
    </div>
  );
};

export default Signup;
