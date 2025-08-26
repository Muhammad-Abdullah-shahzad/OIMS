import React, { useState } from "react";
import styles from "../styles/AuthForm.module.css";
import handleChange from "./handleChange";
import handleSubmit from "./makeSignUp";
import {Link} from "react-router-dom"
const Signup = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  const AUTH_API_URL = "https://oimsapi.oradigitals.com/auth/signup";

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.authContainer}>
        <h2 className={styles.heading}>Create OIMS Account</h2>
        <p className={styles.subtitle}>with your details below</p>
        <form
          className={styles.authForm}
          onSubmit={(e) =>
            handleSubmit({
              e,
              firstName,
              lastName,
              email,
              password,
              confirmPassword,
              setValidationErrors,
              setError,
              setSuccessMessage,
              setLoading,
              setFirstName,
              setLastName,
              setEmail,
              setConfirmPassword,
              AUTH_API_URL,
              setPassword
            })
          }
        >
          <div className={styles.formGroup}>
            <input
              type="text"
              name="firstName"
              placeholder="First Name"
              value={firstName}
              onChange={(e)=>handleChange(
                {e,setValidationErrors,setFirstName,setLastName,setEmail,setConfirmPassword,validationErrors,setPassword}
              )}
              required
              className={validationErrors.firstName ? styles.inputError : ""}
            />
            {validationErrors.firstName && (
              <p className={styles.errorMessage}>{validationErrors.firstName}</p>
            )}
          </div>

          <div className={styles.formGroup}>
            <input
              type="text"
              name="lastName"
              placeholder="Last Name"
              value={lastName}
              onChange={(e)=>handleChange(
                {e,setValidationErrors,setFirstName,setLastName,setEmail,setConfirmPassword,validationErrors,setPassword}
              )}
              required
              className={validationErrors.lastName ? styles.inputError : ""}
            />
            {validationErrors.lastName && (
              <p className={styles.errorMessage}>{validationErrors.lastName}</p>
            )}
          </div>

          <div className={styles.formGroup}>
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={email}
              onChange={(e)=>handleChange(
                {e,setValidationErrors,setFirstName,setLastName,setEmail,setConfirmPassword,validationErrors,setPassword}
              )}
              required
              className={validationErrors.email ? styles.inputError : ""}
            />
            {validationErrors.email && (
              <p className={styles.errorMessage}>{validationErrors.email}</p>
            )}
          </div>

          <div className={styles.formGroup}>
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={password}
              onChange={(e)=>handleChange(
                {e,setValidationErrors,setFirstName,setLastName,setEmail,setConfirmPassword,validationErrors,setPassword}
              )}
              required
              className={validationErrors.password ? styles.inputError : ""}
            />
            {validationErrors.password && (
              <p className={styles.errorMessage}>{validationErrors.password}</p>
            )}
          </div>

          <div className={styles.formGroup}>
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e)=>handleChange(
                {e,setValidationErrors,setFirstName,setLastName,setEmail,setConfirmPassword,validationErrors,setPassword}
              )}
              required
              className={validationErrors.confirmPassword ? styles.inputError : ""}
            />
            {validationErrors.confirmPassword && (
              <p className={styles.errorMessage}>{validationErrors.confirmPassword}</p>
            )}
          </div>

          {error && <p className={styles.errorMsg}>{error}</p>}
          {successMessage && <p className={styles.successMsg}>{successMessage}</p>}

          <button type="submit" disabled={loading}>
            {loading ? "Signing Up..." : "Sign Up"}
          </button>

          <span>
            Already have an account? <Link to="/login" >Login</Link>
          </span>
        </form>
      </div>
    </div>
  );
};

export default Signup;