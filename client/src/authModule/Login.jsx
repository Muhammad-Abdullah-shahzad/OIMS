import React, { useState } from 'react';
import styles from '../styles/AuthForm.module.css'; // Updated import
import { useNavigate } from 'react-router-dom';
import loginUser from './userLogin'; // adjust path if needed

const Login = () => {
  const navigate = useNavigate(); // To redirect after login
  const Base_Url = `https://oimsapi.oradigitals.com/auth`
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
    const result = await loginUser({ email, password, Base_Url });

    if (result.success) {
      setSuccessMessage('Login successful!');
      
      if(result.data.role==="super_admin"){
        navigate("/s-hr")
      }
      else if(result.data.role==="project_manager"){
        navigate("/pm")
      }
      else if (result.data.role === "hr_manager"){
        navigate("/hr")
      }
      else{
        navigate("/fm")
      }
      // Optionally store token: localStorage.setItem('token', result.data.token)
     
    } else {
      setError(result.message);
    }

    setLoading(false);
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.authContainer}>
        <h2 className={styles.heading}>Login</h2>
        <p className={styles.subtitle}>to OIMS</p>
        <form className={styles.authForm} onSubmit={handleSubmit}>
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
          {error && <p className={styles.errorMsg}>{error}</p>}
          {successMessage && <p className={styles.successMsg}>{successMessage}</p>}
          <p>
            Don't have an account? <a href="/signup">Sign Up</a>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
