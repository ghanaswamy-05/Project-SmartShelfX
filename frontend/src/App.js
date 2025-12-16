import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import IntroPage from "./components/IntroPage";
import Login from "./components/Login";
import ProductManager from "./components/ProductManager";
import EmployeeManager from "./components/EmployeeManager";
import RoleBasedDashboard from "./components/RoleBasedDashboard";
import ForgotPassword from "./components/ForgotPassword";
import TransactionHistory from "./components/TransactionHistory";
import DemandForecast from "./components/DemandForecast";
import "./App.css";

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem("authToken");
  return token ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <Router>
      <div className="App">
        <Layout>
          <Routes>
            <Route path="/" element={<IntroPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <RoleBasedDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/transactions"
              element={
                <PrivateRoute>
                  <TransactionHistory />
                </PrivateRoute>
              }
            />
            <Route
              path="/products"
              element={
                <PrivateRoute>
                  <ProductManager />
                </PrivateRoute>
              }
            />
            <Route
              path="/employees"
              element={
                <PrivateRoute>
                  <EmployeeManager />
                </PrivateRoute>
              }
            />
            <Route
              path="/buyer-dashboard"
              element={
                <PrivateRoute>
                  <RoleBasedDashboard />
                </PrivateRoute>
              }
            />
            {/* Add Demand Forecast Route */}
            <Route
              path="/demand-forecast"
              element={
                <PrivateRoute>
                  <DemandForecast />
                </PrivateRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </div>
    </Router>
  );
}

export default App;