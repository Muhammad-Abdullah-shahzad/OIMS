import "../styles/forgetPassword.scss";
import { useState } from "react";
import { FaEnvelope } from "react-icons/fa"; // Remember to install react-icons
import { Link , useNavigate} from "react-router-dom";

const BASE_URL = "http://localhost:5000";

function ForgetPassword() {
  const [email, setEmail] = useState("");
   const navigate = useNavigate();
   
  const [userData, setUserData] = useState({
    userId: null,
    email: null,
  });
  const [error, setError] = useState({});

  async function handleForgetPassword() {
    try {
      // Step 1: Send a POST request to the /password/forget API with the user's email
      const forgetPasswordResponse = await fetch(
        `${BASE_URL}/password/forget`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        }
      );

      if (forgetPasswordResponse.ok) {
        const user = await forgetPasswordResponse.json();
        // Store the user data in state
        setUserData({...userData, userId: user.userId, email: user.email });
        console.log("User data received:", user);

        // Step 2: If the first request is successful, send a request to the /otp/request API
        const otpRequestResponse = await fetch(`${BASE_URL}/otp/request`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userId: user.userId, email: user.email }),
        });

        if (otpRequestResponse.ok) {
          console.log("OTP request successful." );
          navigate("/otp-verify", { state: { userId: user.userId, email: user.email } });
          // You can add logic here to navigate to a new page or show a success message
        } else {
          const res = await otpRequestResponse.json();
          console.error("Failed to request OTP:", res.message);
          // Handle OTP request failure (e.g., show an error message)
        }
      } else {
        setError({
          ...error,
          userNotFound: "No user not found with this Email",
        });
        console.error("Failed to find user with that email.");
        // Handle forget password failure (e.g., show an error message)
      }
    } catch (error) {
      console.error("An error occurred:", error);
      // Handle network or other errors
    }
  }

  return (
    <>
      <div className="forget-password-wrapper">
        <div className="forget-password-form">
          <div className="forget-password-logo-container"></div>
          <h2 className="forget-password-heading">Forgot Password?</h2>
          <div className="forget-password-input-group">
            <label htmlFor="email" className="forget-password-label">
              Email Address
            </label>
            <div className="forget-password-input-with-icon">
              <FaEnvelope className="forget-password-input-icon" />
              <input
                type="email"
                name="email"
                id="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                }}
                className={`forget-password-input ${error.userNotFound && `red-border`}`}
              />
            </div>
            {error.userNotFound && (
              <div className={`errorMessage ${error.userNotFound && `visible`}`}>{error.userNotFound}</div>
            )}
          </div>
          <button
            type="button"
            onClick={handleForgetPassword}
            className="forget-password-reset-button"
          >
            Reset Password
          </button>
          <Link to="/login" className="forget-password-back-to-login">
            Back to Login
          </Link>
        </div>
      </div>
    </>
  );
}

export default ForgetPassword;
