import React, { useState } from "react";
import "../styles/AuthForm.css"; // Assuming this CSS file exists and styles the form
import handleChange from "./handleChange";
import handleSubmit from "./makeSignUp";

const Signup = () => {
  // State for form inputs
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // State for UI feedback
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [validationErrors, setValidationErrors] = useState({}); // For client-side validation errors

  const AUTH_API_URL = "http://localhost:5000/auth/signup";

  return (
    <div className="auth-container">
      <h2>Create OIMS Account</h2>
      <form
        className="auth-form"
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
        <div className="form-group">
          <input
            type="text"
            name="firstName"
            placeholder="First Name"
            value={firstName}
            onChange={(e)=>handleChange(
              {e,setValidationErrors,setFirstName,setLastName,setEmail,setConfirmPassword,validationErrors,setPassword}
            )}
            required
            className={validationErrors.firstName ? "input-error" : ""}
          />
          {validationErrors.firstName && (
            <p className="error-message">{validationErrors.firstName}</p>
          )}
        </div>

        <div className="form-group">
          <input
            type="text"
            name="lastName"
            placeholder="Last Name"
            value={lastName}
            onChange={(e)=>handleChange(
              {e,setValidationErrors,setFirstName,setLastName,setEmail,setConfirmPassword,validationErrors,setPassword}
            )}
            required
            className={validationErrors.lastName ? "input-error" : ""}
          />
          {validationErrors.lastName && (
            <p className="error-message">{validationErrors.lastName}</p>
          )}
        </div>

        <div className="form-group">
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={email}
            onChange={(e)=>handleChange(
              {e,setValidationErrors,setFirstName,setLastName,setEmail,setConfirmPassword,validationErrors,setPassword}
            )}
            required
            className={validationErrors.email ? "input-error" : ""}
          />
          {validationErrors.email && (
            <p className="error-message">{validationErrors.email}</p>
          )}
        </div>

        <div className="form-group">
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={password}
            onChange={(e)=>handleChange(
              {e,setValidationErrors,setFirstName,setLastName,setEmail,setConfirmPassword,validationErrors,setPassword}
            )}
            required
            className={validationErrors.password ? "input-error" : ""}
          />
          {validationErrors.password && (
            <p className="error-message">{validationErrors.password}</p>
          )}
        </div>

        <div className="form-group">
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e)=>handleChange(
              {e,setValidationErrors,setFirstName,setLastName,setEmail,setConfirmPassword,validationErrors,setPassword}
            )}
            required
            className={validationErrors.confirmPassword ? "input-error" : ""}
          />
          {validationErrors.confirmPassword && (
            <p className="error-message">{validationErrors.confirmPassword}</p>
          )}
        </div>

        {/* Display messages */}
        {error && <p className="api-error-message">{error}</p>}
        {successMessage && <p className="success-message">{successMessage}</p>}

        <button type="submit" disabled={loading}>
          {loading ? "Signing Up..." : "Sign Up"}
        </button>

        <p>
          Already have an account? <a href="/login">Login</a>
        </p>
      </form>
    </div>
  );
};

export default Signup;
