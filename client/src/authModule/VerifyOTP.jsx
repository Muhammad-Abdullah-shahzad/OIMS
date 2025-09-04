import { useState, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "../styles/verifyOtp.scss";

const BASE_URL = 'http://localhost:5000';

function VerifyOtp() {
  const location = useLocation();
  const navigate = useNavigate();
  const { userId , email } = location.state || {};
  const [otp, setOtp] = useState(new Array(6).fill(""));
  const [error, setError] = useState(null); // New state for errors
  const otpBoxReference = useRef([]);

  function handleChange(value, index) {
    let newArr = [...otp];
    newArr[index] = value.replace(/[^0-9]/g, '');
    setOtp(newArr);
    setError(null); // Clear the error message on new input

    if (value && index < 5) {
      otpBoxReference.current[index + 1].focus();
    }
  }

  function handleBackspaceAndEnter(e, index) {
    if (e.key === "Backspace" && index > 0) {
      otpBoxReference.current[index - 1].focus();
    }
    if (e.key === "Enter" && index < 5) {
      otpBoxReference.current[index + 1].focus();
    }
  }

  async function handleVerifyOtp() {
    const enteredOtp = otp.join("");
    if (enteredOtp.length !== 6 || !userId) {
      setError({ verificationError: "Invalid OTP or missing user ID." });
      console.error("Invalid OTP or missing userId.");
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/otp/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, otp: enteredOtp }),
      });

      if (response.ok) {
        console.log("OTP verified successfully.");
        navigate('/reset-password', { state: { userId } });
      } else {
        const errorData = await response.json();
        setError({ verificationError: "Invalid or expired OTP." });
        console.error("OTP verification failed:", errorData.message);
      }
    } catch (error) {
      setError({ verificationError: "An error occurred. Please try again." });
      console.error("An error occurred during OTP verification:", error);
    }
  }

  return (
    <>
      <div className="otp-wrapper">
        <div className="otp-form">
          <h2 className="otp-heading">Enter OTP</h2>
          <p className="otp-sub-heading">
            A 6-digit OTP has been sent to {email}.
          </p>
          <div className="otp-inputs-container">
            {otp.map((digit, index) => (
              <input
                key={index}
                value={digit}
                onChange={(e) => handleChange(e.target.value, index)}
                onKeyUp={(e) => handleBackspaceAndEnter(e, index)}
                ref={(reference) => (otpBoxReference.current[index] = reference)}
                className="otp-input"
                maxLength={1}
                type="text"
              />
            ))}
          </div>
          {error && error.verificationError && (
            <span className="otp-errorMessage">
              {error.verificationError}
            </span>
          )}
          <button
            type="button"
            className="otp-verify-button"
            onClick={handleVerifyOtp}
            disabled={otp.join("").length !== 6}
          >
            Verify
          </button>
          <Link to="/login" className="otp-back-to-login">
            Back to Login
          </Link>
        </div>
      </div>
    </>
  );
}

export default VerifyOtp;