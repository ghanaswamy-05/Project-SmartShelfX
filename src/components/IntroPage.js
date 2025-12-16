// src/components/IntroPage.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./IntroPage.css";

const IntroPage = () => {
  const [fadeIn, setFadeIn] = useState(false);
  const [showFeatures, setShowFeatures] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    checkLoginStatus();
    setFadeIn(true);

    const featuresTimer = setTimeout(() => {
      setShowFeatures(true);
    }, 800);

    const statsTimer = setTimeout(() => {
      setShowStats(true);
    }, 1500);

    return () => {
      clearTimeout(featuresTimer);
      clearTimeout(statsTimer);
    };
  }, []);

  const checkLoginStatus = () => {
    const token = localStorage.getItem("authToken");
    setIsLoggedIn(!!token);
  };

  const handleGetStarted = () => {
    if (isLoggedIn) {
      navigate("/dashboard");
    } else {
      navigate("/login");
    }
  };

  const handleLogin = () => {
    navigate("/login");
  };

  const handleDashboard = () => {
    navigate("/dashboard");
  };

  const handleProducts = () => {
    navigate("/products");
  };

  const handleEmployees = () => {
    navigate("/employees");
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userName");
    localStorage.removeItem("assignedWarehouse");
    setIsLoggedIn(false);
    window.location.reload();
  };

  const features = [
    {
      icon: "📦",
      title: "Smart Inventory Management",
      description: "Track products, monitor stock levels, and automate reordering"
    },
    {
      icon: "📊",
      title: "Real-time Analytics",
      description: "Get insights into your inventory performance and trends"
    },
    {
      icon: "👥",
      title: "Team Collaboration",
      description: "Manage multiple users with different roles and permissions"
    },
    {
      icon: "🔔",
      title: "Smart Alerts",
      description: "Get notified when stock is low or needs reordering"
    },
    {
      icon: "🛒",
      title: "Purchase Management",
      description: "Manage purchase orders and automate inventory replenishment"
    }
  ];

  const stats = [
    { number: "99%", label: "Accuracy" },
    { number: "50%", label: "Time Saved" },
    { number: "24/7", label: "Availability" },
    { number: "1000+", label: "Products Managed" }
  ];

  const userRole = localStorage.getItem("userRole");
  const userName = localStorage.getItem("userName");

  // Role-based component visibility
  const showAddProduct = userRole === "USER" || userRole === "STORE_MANAGER";
  const showEmployeeInfo = userRole === "ADMIN" || userRole === "STORE_MANAGER";

  return (
    <div className="intro-page">
      {/* Animated Background */}
      <div className="animated-background">
        <div className="floating-shape shape-1"></div>
        <div className="floating-shape shape-2"></div>
        <div className="floating-shape shape-3"></div>
        <div className="floating-shape shape-4"></div>
      </div>

      {/* NAVBAR REMOVED - Using the one from Layout.js */}

      {/* Hero Section */}
      <div className={`hero-section ${fadeIn ? 'fade-in' : ''}`}>
        <div className="hero-content">
          <div className="hero-badge">
            {isLoggedIn ? `🎉 Welcome Back, ${userName || 'User'}!` : "🚀 Intelligent Inventory Solution"}
          </div>
          <h1 className="hero-title">
            {isLoggedIn ? "Ready to Manage Your Inventory?" : "Welcome to "}
            {!isLoggedIn && <span className="gradient-text"> SmartShelfX</span>}
          </h1>
          <p className="hero-description">
            {isLoggedIn
              ? `Welcome back! You're logged in as ${userRole?.toLowerCase() || 'user'}. Access your personalized dashboard and manage your inventory efficiently.`
              : "Revolutionize your inventory management with our AI-powered platform. Track products, automate reordering, and gain real-time insights to optimize your business operations."
            }
          </p>

          <div className="hero-actions">
            <button
              className="cta-button primary"
              onClick={handleGetStarted}
            >
              {isLoggedIn ? "📊 Go to Dashboard" : "🚀 Get Started Free"}
            </button>
            {!isLoggedIn && (
              <button
                className="cta-button secondary"
                onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })}
              >
                📚 Learn More
              </button>
            )}
          </div>

          {/* Animated Stats - Only show when not logged in */}
          {!isLoggedIn && (
            <div className={`stats-container ${showStats ? 'slide-up' : ''}`}>
              {stats.map((stat, index) => (
                <div key={index} className="stat-item">
                  <div className="stat-number">{stat.number}</div>
                  <div className="stat-label">{stat.label}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Hero Visual - Show different visuals based on login status */}
        <div className="hero-visual">
          <div className="main-visual">
            <div className="dashboard-preview">
              <div className="preview-header">
                <div className="preview-logo"></div>
                {isLoggedIn && (
                  <div className="preview-role-badge">
                    {userRole === "ADMIN" && "👑 Admin"}
                    {userRole === "STORE_MANAGER" && "💼 Store Manager"}
                    {userRole === "USER" && "👤 User"}
                    {userRole === "BUYER" && "🛒 Buyer"}
                  </div>
                )}
              </div>
              <div className="preview-content">
                <div className="preview-chart">
                  <div className="chart-bar" style={{height: '60%'}}></div>
                  <div className="chart-bar" style={{height: '80%'}}></div>
                  <div className="chart-bar" style={{height: '45%'}}></div>
                  <div className="chart-bar" style={{height: '90%'}}></div>
                </div>
                <div className="preview-items">
                  <div className="preview-item"></div>
                  <div className="preview-item"></div>
                  <div className="preview-item"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section - Enhanced for logged-in users */}
      <section id="features" className="features-section">
        <div className="container">
          <h2 className="section-title">
            {isLoggedIn ? "Your Role Features" : "Why Choose SmartShelfX?"}
          </h2>
          <div className="features-grid">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`feature-card ${showFeatures ? 'fade-in-stagger' : ''}`}
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <div className="feature-icon">{feature.icon}</div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>

                {/* Role-specific badges for logged-in users */}
                {isLoggedIn && (
                  <div className="feature-access">
                    {userRole === "ADMIN" && <span className="access-badge admin">👑 Full Access</span>}
                    {userRole === "STORE_MANAGER" && <span className="access-badge manager">💼 Store Access</span>}
                    {userRole === "USER" && <span className="access-badge user">👤 Basic Access</span>}
                    {userRole === "BUYER" && <span className="access-badge buyer">🛒 Purchase Manager</span>}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>
              {isLoggedIn
                ? `Ready to Explore Your ${userRole === "ADMIN" ? "Admin" : userRole === "STORE_MANAGER" ? "Store Manager" : userRole === "BUYER" ? "Buyer" : "User"} Features?`
                : "Ready to Transform Your Inventory Management?"
              }
            </h2>
            <p>
              {isLoggedIn
                ? `Access your personalized ${userRole?.toLowerCase()} dashboard with customized features and analytics.`
                : "Join thousands of businesses using SmartShelfX to streamline their operations"
              }
            </p>
            <button
              className="cta-button large"
              onClick={handleGetStarted}
            >
              {isLoggedIn ? "📊 Access Dashboard" : "🔐 Start Free Trial"}
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="intro-footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-brand">
              <span className="brand-icon">📦</span>
              <span className="brand-text">SmartShelfX</span>
              {isLoggedIn && (
                <span className="footer-role">
                  • {userRole === "ADMIN" ? "Administrator" :
                     userRole === "STORE_MANAGER" ? "Store Manager" :
                     userRole === "BUYER" ? "Buyer" : "User"} Account
                </span>
              )}
            </div>
            <p className="footer-tagline">
              Intelligent inventory management for modern businesses
            </p>
            <div className="footer-links">
              {!isLoggedIn && <button onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}>Features</button>}
              <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Home</button>
              {isLoggedIn && <button onClick={handleDashboard}>Dashboard</button>}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default IntroPage;