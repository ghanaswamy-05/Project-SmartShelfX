// src/components/Layout.js
import React from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import "./Layout.css";

const Layout = ({ children }) => {
  const navigate = useNavigate();
  const currentLocation = useLocation();
  const isLoggedIn = localStorage.getItem("authToken");
  const userRole = localStorage.getItem("userRole");
  const userName = localStorage.getItem("userName");

  // Role-based component visibility
  const showAddProduct = userRole === "USER" || userRole === "STORE_MANAGER";
  const showEmployeeInfo = userRole === "ADMIN" || userRole === "STORE_MANAGER";

  const handleProtectedNav = (path) => {
    navigate(isLoggedIn ? path : "/login");
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userName");
    localStorage.removeItem("assignedWarehouse");
    navigate("/login");
  };

  return (
    <div className="layout-container">
      <nav className="navbar">
        <div className="navbar-brand">SmartShelfX</div>
        <div className="navbar-links">
          <NavLink to="/" end className="nav-link">
            Home
          </NavLink>

          {/* Dashboard NavLink */}
          {userRole === "USER"|| userRole === "ADMIN" || userRole === "STORE_MANAGER"&&(
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `nav-link ${isActive ? "active" : ""}`
            }
          >
            Dashboard
          </NavLink>)}

          {userRole === "BUYER" && (
            <button
              onClick={() => handleProtectedNav("/buyer-dashboard")}
              className={`nav-button ${currentLocation.pathname === "/buyer-dashboard" ? "active" : ""}`}
            >
              🛒 Buyer Dashboard
            </button>
          )}
       {(userRole === "ADMIN" || userRole === "STORE_MANAGER") && (
         <button
           onClick={() => handleProtectedNav("/demand-forecast")}
           className={`nav-button ${
             currentLocation.pathname === "/demand-forecast" ? "active" : ""
           }`}
         >
           📈 Demand Forecast
         </button>
       )}



            {isLoggedIn &&  userRole==="ADMIN"&&(
                <button
                  className={`nav-link ${currentLocation.pathname === "/transactions" ? "active" : ""}`}
                  onClick={() => navigate("/transactions")}
                >
                  Transaction History
                </button>
              )}

          {/* Show Add Product only for USER and STORE_MANAGER */}
          {showAddProduct && (
            <button
              onClick={() => handleProtectedNav("/products")}
              className={`nav-button ${currentLocation.pathname === "/products" ? "active" : ""}`}
            >
              Add Product
            </button>
          )}

          {/* Show Employee Info for ADMIN and STORE_MANAGER */}
          {showEmployeeInfo && (
            <button
              onClick={() => handleProtectedNav("/employees")}
              className={`nav-button ${currentLocation.pathname === "/employees" ? "active" : ""}`}
            >
              Employee Info
            </button>
          )}

          {isLoggedIn ? (
            <button onClick={handleLogout} className="nav-button logout">
              Logout
            </button>
          ) : (
            <NavLink to="/login" className="nav-link">
              Login
            </NavLink>
          )}
        </div>
      </nav>

      <main className="page-content">
        {children}
      </main>
    </div>
  );
};

export default Layout;