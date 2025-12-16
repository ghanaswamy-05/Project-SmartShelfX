// src/components/Login.jsx
import React, { useState } from "react";
import axios from "axios";
import Signup from "./Signup";
import { useNavigate, useLocation } from "react-router-dom";
import "./Login.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showSignup, setShowSignup] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const handleLogin = async () => {
    if (!email || !password) {
      alert("Please enter both email and password");
      return;
    }

    try {
      setLoading(true);
      console.log("Attempting login with:", { email });

      const response = await axios.post(
        "http://localhost:8080/api/auth/login",
        {
          email: email.trim(),
          password: password
        },
        {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 10000
        }
      );

      console.log("Full login response:", response);
      console.log("Response data:", response.data);

      // Handle different response formats
      if (response.data && response.data.token) {
        localStorage.setItem("authToken", response.data.token);
        localStorage.setItem("userRole", response.data.user?.role || "USER");
        localStorage.setItem("userName", response.data.user?.fullName || email.split('@')[0]);
        localStorage.setItem("assignedWarehouse", response.data.user?.assignedWarehouse || "");

        alert("Login successful!");
        navigate("/", { replace: true });
      } else if (response.data === "Login successful") {
        localStorage.setItem("authToken", "demo-token");
        localStorage.setItem("userRole", "USER");
        localStorage.setItem("userName", email.split('@')[0]);
        localStorage.setItem("assignedWarehouse", "");

        alert("Login successful!");
        navigate("/", { replace: true });
      } else if (response.data.message === "Login successful") {
        localStorage.setItem("authToken", "demo-token");
        localStorage.setItem("userRole", "USER");
        localStorage.setItem("userName", email.split('@')[0]);
        localStorage.setItem("assignedWarehouse", "");

        alert("Login successful!");
        navigate("/", { replace: true });
      } else {
        console.error("Unexpected response format:", response.data);
        alert("Login failed: Unexpected response format from server");
      }
    } catch (error) {
      console.error("Login error details:", error);

      let errorMessage = "Login failed";

      if (error.code === 'ECONNABORTED') {
        errorMessage = "Login failed: Request timeout. Please try again.";
      } else if (error.response) {
        const errorData = error.response.data;
        console.log("Error response data:", errorData);

        if (typeof errorData === 'string') {
          errorMessage = `Login failed: ${errorData}`;
        } else if (typeof errorData === 'object') {
          if (errorData.message) {
            errorMessage = `Login failed: ${errorData.message}`;
          } else if (errorData.error) {
            errorMessage = `Login failed: ${errorData.error}`;
          } else {
            errorMessage = `Login failed: ${JSON.stringify(errorData)}`;
          }
        } else {
          errorMessage = `Login failed: ${errorData}`;
        }
      } else if (error.request) {
        console.error("No response received:", error.request);
        errorMessage = "Login failed: No response from server. Please check if the backend server is running on http://localhost:8080";
      } else {
        errorMessage = `Login failed: ${error.message}`;
      }

      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Fixed: This should navigate to forgot password page
  const handleForgotPassword = () => {
    navigate("/forgot-password");
  };

  // Test backend connection
  const testBackendConnection = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:8080/api/auth/test", {
        timeout: 5000
      });
      alert(`✅ Backend is running: ${response.data}`);
    } catch (error) {
      alert("❌ Backend is not accessible. Please make sure the Spring Boot server is running on http://localhost:8080");
    } finally {
      setLoading(false);
    }
  };

  const handleBackToHome = () => {
    navigate("/");
  };

  return (
    <div className="login-page">
      <div className="login-container">
        {!showSignup ? (
          <>
            <div className="login-header">
              <h2>🔐 Login to SmartShelfX</h2>
              <button
                onClick={handleBackToHome}
                className="back-home-btn"
                disabled={loading}
              >
                ← Back to Home
              </button>
            </div>



            <div className="form-group">
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="login-input"
              />
            </div>

            <div className="form-group">
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className="login-input"
              />
            </div>

            <div className="login-actions">
              <button
                onClick={handleLogin}
                disabled={loading}
                className="login-btn primary"
              >
                {loading ? "⏳ Logging in..." : "🔐 Login"}
              </button>
              <button
                onClick={() => setShowSignup(true)}
                disabled={loading}
                className="login-btn secondary"
              >
                📝 Signup
              </button>
            </div>

            <div className="login-footer">
              {/* Fixed: This button now navigates to forgot password page */}
              <button
                onClick={handleForgotPassword}
                className="forgot-password-btn"
                disabled={loading}
              >
                Forgot Password?
              </button>
            </div>
          </>
        ) : (
          <>
            <Signup />
            <button
              onClick={() => setShowSignup(false)}
              className="back-to-login-btn"
              disabled={loading}
            >
              ← Back to Login
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default Login;