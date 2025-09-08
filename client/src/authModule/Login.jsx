import React, { useState } from 'react';
import styles from '../styles/AuthForm.module.css';
import { useNavigate } from 'react-router-dom';
import loginUser from './userLogin';
import {Link} from "react-router-dom"
const Login = () => {
  const navigate = useNavigate();
  const Base_Url = `http://localhost:5000/auth`;
  
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
        navigate("/s-dashboard");
      }
      else if(result.data.role==="project_manager"){
        navigate("/pm-dashboard");
      }
      else if (result.data.role === "hr_manager"){
        navigate("/hr-dashboard");
      }
      else if (result.data.role === "fm_manager"){ 
        navigate("/fm-dashboard");
      }
    } else {
      setError(result.message);
    }

    setLoading(false);
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.authContainer}>
        <h2 className={styles.heading}>Oradigitals-ERP</h2>
        <p className={styles.subtitle}>login to access your oims account</p>
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
          <div className={styles.forgetPasswordHeadingLogin}>
           Forget password? <Link to="/forget-password" style={{ textDecoration:"none"}} >click here</Link>
          </div>
          <span>
            Don't have an account? <Link   style={{ textDecoration:"none"}} to="/signup">Sign Up</Link>
          </span>
        </form>
      </div>
    </div>
  );
};

export default Login;