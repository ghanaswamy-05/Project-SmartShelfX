// RoleBasedDashboard.jsx - New component for role-specific dashboards
import React, { useEffect, useState } from "react";
import { getDashboardData } from "../api/analyticsApi";
import UserDashboard from "./UserDashboard";
import AdminDashboard from "./AdminDashboard";
import StoreManagerDashboard from "./StoreManagerDashboard";
import "./RoleBasedDashboard.css";
import BuyerDashboard from './BuyerDashboard';

export default function RoleBasedDashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const userRole = localStorage.getItem("userRole");
  const userName = localStorage.getItem("userName");

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const data = await getDashboardData();
      setDashboardData(data);
    } catch (err) {
      setError("Failed to load dashboard data");
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  const renderDashboard = () => {
    if (loading) {
      return <div className="dashboard-loading">⏳ Loading Dashboard...</div>;
    }

    if (error) {
      return <div className="dashboard-error">❌ {error}</div>;
    }

    // In RoleBasedDashboard.jsx - Add this case
    switch (userRole) {
      case 'ADMIN':
        return <AdminDashboard />;
      case 'STORE_MANAGER':
        return <StoreManagerDashboard />;
      case 'BUYER':
        return <BuyerDashboard />; // Add this line
      case 'USER':
      default:
        return <UserDashboard />;
    }
  };

  return (
    <div className="role-based-dashboard" data-role={userRole}>
      <div className="dashboard-header">
        <h1>
          {userRole === "ADMIN" && "👑 "}
          {userRole === "STORE_MANAGER" && "💼 "}
          {userRole === "USER" && "👤 "}
          Welcome, {userName}!
        </h1>
        <p>
          {userRole === "ADMIN" && "Administrator Dashboard - Multi-Warehouse Overview"}
          {userRole === "STORE_MANAGER" && `Store Manager Dashboard - ${dashboardData?.warehouse || 'Your Warehouse'}`}
          {userRole === "USER" && "Product Management Dashboard"}
        </p>
      </div>
      {renderDashboard()}
    </div>

  );
}