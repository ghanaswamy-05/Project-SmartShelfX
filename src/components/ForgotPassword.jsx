// src/components/ForgotPassword.jsx
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./ForgotPassword.css";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [step, setStep] = useState(1); // 1: Request reset, 2: Reset password
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const navigate = useNavigate();

  const handleRequestReset = async (e) => {
    e.preventDefault();

    if (!email) {
      alert("Please enter your email address");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const response = await axios.post(
        "http://localhost:8080/api/auth/forgot-password",
        null,
        {
          params: { email },
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      setMessage(response.data);
      setStep(2); // Move to password reset step

    } catch (error) {
      console.error("Forgot password error:", error);

      if (error.response) {
        setMessage(error.response.data);
      } else if (error.request) {
        setMessage("Network error. Please try again.");
      } else {
        setMessage("An error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (!newPassword || !confirmPassword) {
      alert("Please fill in all fields");
      return;
    }

    if (newPassword !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      alert("Password must be at least 6 characters long");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const response = await axios.post(
        "http://localhost:8080/api/auth/reset-password",
        null,
        {
          params: {
            email,
            newPassword,
            confirmPassword
          },
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      setMessage(response.data);

      // Redirect to login after successful reset
      setTimeout(() => {
        navigate("/login");
      }, 3000);

    } catch (error) {
      console.error("Reset password error:", error);

      if (error.response) {
        setMessage(error.response.data);
      } else if (error.request) {
        setMessage("Network error. Please try again.");
      } else {
        setMessage("An error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigate("/login");
  };

  return (
    <div className="forgot-password-page">
      <div className="forgot-password-container">
        <h2>🔐 Forgot Password</h2>

        {message && (
          <div className={`message ${message.includes("successfully") ? "success" : "error"}`}>
            {message}
          </div>
        )}

        {step === 1 && (
          <form onSubmit={handleRequestReset} className="forgot-password-form">
            <p className="instruction">
              Enter your email address and we'll send you instructions to reset your password.
            </p>

            <div className="form-group">
              <input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
              />
            </div>

            <div className="form-actions">
              <button type="submit" disabled={loading} className="submit-btn">
                {loading ? "⏳ Sending..." : "Send Reset Instructions"}
              </button>

              <button
                type="button"
                onClick={handleBackToLogin}
                disabled={loading}
                className="back-btn"
              >
                ← Back to Login
              </button>
            </div>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleResetPassword} className="reset-password-form">
            <p className="instruction">
              Enter your new password below.
            </p>

            <div className="form-group">
              <input
                type="password"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={loading}
                required
                minLength="6"
              />
            </div>

            <div className="form-group">
              <input
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
                required
                minLength="6"
              />
            </div>

            <div className="form-actions">
              <button type="submit" disabled={loading} className="submit-btn">
                {loading ? "⏳ Resetting..." : "Reset Password"}
              </button>

              <button
                type="button"
                onClick={() => setStep(1)}
                disabled={loading}
                className="back-btn"
              >
                ← Back
              </button>
            </div>
          </form>
        )}

        <div className="support-info">
          <p>If you continue to have problems, please contact your system administrator.</p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;