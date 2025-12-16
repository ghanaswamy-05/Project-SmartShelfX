// src/components/AdminDashboard.jsx
import React, { useEffect, useState } from "react";
import { getDashboardData } from "../api/analyticsApi";
import "./AdminDashboard.css";

export default function AdminDashboard() {
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

  const warehouseAnalysis = dashboardData.warehouseAnalysis || [];
  const topProducts = dashboardData.topProducts || [];
  const categoryPerformance = dashboardData.categoryPerformance || {};

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h2>👑 Multi-Warehouse Analytics Dashboard</h2>
      </div>

      <div className="overall-stats">
        <div className="stat-card large">
          <h3>Total Inventory Value</h3>
          <div className="stat-number">
            ${dashboardData.totalInventoryValue ? dashboardData.totalInventoryValue.toFixed(2) : '0.00'}
          </div>
        </div>
        <div className="stat-card large">
          <h3>Total Products</h3>
          <div className="stat-number">{dashboardData.totalProducts || 0}</div>
        </div>
        <div className="stat-card large">
          <h3>Monthly Revenue</h3>
          <div className="stat-number">
            ${dashboardData.totalRevenueLastMonth ? dashboardData.totalRevenueLastMonth.toFixed(2) : '0.00'}
          </div>
        </div>
      </div>

      <div className="warehouse-comparison">
        <h2>🏬 Warehouse Performance Analysis</h2>
        <div className="warehouse-grid">
          {warehouseAnalysis.map((warehouse, index) => (
            <div key={index} className="warehouse-card">
              <h3>{warehouse.warehouse}</h3>
              <div className="warehouse-stats">
                <div className="warehouse-stat">
                  <span>Revenue:</span>
                  <strong>${warehouse.totalRevenue?.toFixed(2)}</strong>
                </div>
                <div className="warehouse-stat">
                  <span>Transactions:</span>
                  <strong>{warehouse.totalTransactions}</strong>
                </div>
                <div className="warehouse-stat">
                  <span>Products:</span>
                  <strong>{warehouse.productCount}</strong>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="category-performance">
        <h2>📊 Category Performance</h2>
        <div className="category-grid">
          {Object.entries(categoryPerformance).map(([category, revenue]) => (
            <div key={category} className="category-card">
              <h4>{category}</h4>
              <div className="revenue">${revenue.toFixed(2)}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="top-products">
        <h2>⭐ Top Performing Products</h2>
        <div className="top-products-list">
          {topProducts.length > 0 ? (
            topProducts.map((product, index) => (
              <div key={index} className="top-product-item">
                <div className="product-rank">#{index + 1}</div>
                <div className="product-details">
                  <h4>{product.name}</h4>
                  <p>Sales: {product.sales} units</p>
                </div>
                <div className="product-revenue">
                  <strong>${product.revenue?.toFixed(2)}</strong>
                </div>
                <div className="product-warehouse">
                  {product.warehouse}
                </div>
              </div>
            ))
          ) : (
            <div className="no-data">No product data available</div>
          )}
        </div>
      </div>

      <div className="system-overview">
        <h2>🔍 System Overview</h2>
        <div className="system-stats">
          <div className="system-stat">
            <span>Total Low Stock Items:</span>
            <strong>{dashboardData.totalLowStockItems || 0}</strong>
          </div>
          <div className="system-stat">
            <span>Total Out of Stock Items:</span>
            <strong>{dashboardData.totalOutOfStockItems || 0}</strong>
          </div>
          <div className="system-stat">
            <span>Monthly Transactions:</span>
            <strong>{dashboardData.totalTransactionsLastMonth || 0}</strong>
          </div>
        </div>
      </div>
    </div>
  );
}