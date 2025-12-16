// src/components/StoreManagerDashboard.jsx
import React, { useEffect, useState } from "react";
import { getDashboardData } from "../api/analyticsApi";
import "./StoreManagerDashboard.css";

export default function StoreManagerDashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const data = await getDashboardData();
      setDashboardData(data);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="dashboard-loading">⏳ Loading dashboard data...</div>;
  }

  if (!dashboardData) {
    return <div className="dashboard-error">❌ Failed to load dashboard data</div>;
  }

  const fastMovingProducts = dashboardData.fastMovingProducts || [];

  return (
    <div className="store-manager-dashboard">
      <div className="warehouse-header">
        <h2>🏬 {dashboardData.warehouse || 'Your Warehouse'} - Daily Overview</h2>
      </div>

      <div className="stats-overview">
        <div className="stat-card">
          <h3>Daily Turnover</h3>
          <div className="stat-number">
            ${dashboardData.dailyTurnover ? dashboardData.dailyTurnover.toFixed(2) : '0.00'}
          </div>
        </div>
        <div className="stat-card">
          <h3>Total Products</h3>
          <div className="stat-number">{dashboardData.totalProducts || 0}</div>
        </div>
        <div className="stat-card warning">
          <h3>Stock Alerts</h3>
          <div className="stat-number">{dashboardData.lowStockAlerts || 0}</div>
        </div>
        <div className="stat-card">
          <h3>Inventory Value</h3>
          <div className="stat-number">
            ${dashboardData.totalInventoryValue ? dashboardData.totalInventoryValue.toFixed(2) : '0.00'}
          </div>
        </div>
      </div>

      <div className="fast-moving-products">
        <h2>🚀 Fast Moving Products</h2>
        <div className="products-list">
          {fastMovingProducts.length > 0 ? (
            fastMovingProducts.map((product, index) => (
              <div key={index} className="product-rank-item">
                <div className="rank">#{index + 1}</div>
                <div className="product-info">
                  <h4>{product.name}</h4>
                  <p>{product.sales} units sold</p>
                </div>
                <div className="revenue">${product.revenue?.toFixed(2)}</div>
              </div>
            ))
          ) : (
            <div className="no-data">No sales data available</div>
          )}
        </div>
      </div>

      <div className="warehouse-metrics">
        <h2>📈 Warehouse Performance</h2>
        <div className="metrics-grid">
          <div className="metric-card">
            <h4>Today's Sales</h4>
            <div className="metric-value">{dashboardData.todaySalesCount || 0}</div>
          </div>
          <div className="metric-card">
            <h4>Items Sold Today</h4>
            <div className="metric-value">{dashboardData.totalItemsSoldToday || 0}</div>
          </div>
          <div className="metric-card">
            <h4>Restock Needed</h4>
            <div className="metric-value">{dashboardData.lowStockAlerts || 0} items</div>
          </div>
        </div>
      </div>
    </div>
  );
}