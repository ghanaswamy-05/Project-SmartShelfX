// src/components/UserDashboard.jsx
import React, { useEffect, useState } from "react";
import { getDashboardData } from "../api/analyticsApi";
import "./UserDashboard.css";

export default function UserDashboard() {
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

  return (
    <div className="user-dashboard">
      <div className="stats-overview">
        <div className="stat-card">
          <h3>Total Products</h3>
          <div className="stat-number">{dashboardData.totalProducts || 0}</div>
        </div>
        <div className="stat-card warning">
          <h3>Low Stock Items</h3>
          <div className="stat-number">{dashboardData.lowStockProducts || 0}</div>
        </div>
        <div className="stat-card">
          <h3>Out of Stock</h3>
          <div className="stat-number">{dashboardData.outOfStockProducts || 0}</div>
        </div>
      </div>

      <div className="recent-products">
        <h2>Recently Added Products</h2>
        <div className="products-grid">
          {dashboardData.recentProducts && dashboardData.recentProducts.length > 0 ? (
            dashboardData.recentProducts.map((product, index) => (
              <div key={index} className="product-card">
                <div className="product-image">
                  {product.imageFileName ? (
                    <img
                      src={`http://localhost:8080/uploads/${product.imageFileName}`}
                      alt={product.name}
                    />
                  ) : (
                    <div className="no-image">📦</div>
                  )}
                </div>
                <div className="product-info">
                  <h4>{product.name}</h4>
                  <p>Quantity: {product.quantity}</p>
                  <p>Price: ${product.price?.toFixed(2)}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="no-data">No products found</div>
          )}
        </div>
      </div>
    </div>
  );
}