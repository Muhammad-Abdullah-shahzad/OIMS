import React, { useState } from 'react';
import '../styles/AuthForm.css';
import { useNavigate } from 'react-router-dom';
import loginUser  from './userLogin'; // adjust path if needed

const Login = () => {
  const navigate = useNavigate(); // To redirect after login
  const Base_Url =`http://localhost:5000/auth`
  // State variables
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setLoading(true);
    const result = await loginUser({ email, password , Base_Url});

    if (result.success) {
      setSuccessMessage('Login successful!');
    
      if(result.data.role==="super_admin"){
        navigate("/fm")
      }
      // Optionally store token: localStorage.setItem('token', result.data.token)
     
    } else {
      setError(result.message);
    }

    setLoading(false);
  };

  return (
    <div className="auth-container">
      <h2>Login to OIMS</h2>
      <form className="auth-form" onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
        {error && <p className="error-msg">{error}</p>}
        {successMessage && <p className="success-msg">{successMessage}</p>}
        <p>
          Don't have an account? <a href="/signup">Sign Up</a>
        </p>
      </form>
    </div>
  );
};

export default Login;
