import React, { useState, useEffect, useCallback } from 'react'; // Add useCallback
import axios from 'axios';
import './DemandForecast.css';

const DemandForecast = () => {
  const [forecastData, setForecastData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [forecastDays, setForecastDays] = useState(30);
  const [error, setError] = useState(null);

  // Wrap loadForecastData in useCallback
  const loadForecastData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('authToken');

      const response = await axios.get(`http://localhost:8080/api/forecast/demand?days=${forecastDays}`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json'
        }
      });

      setForecastData(response.data);
    } catch (error) {
      console.error('Error loading forecast data:', error);
      setError('Failed to load demand forecast data. Please make sure the backend is running and has sales data.');
    } finally {
      setLoading(false);
    }
  }, [forecastDays]); // Add forecastDays as dependency

  useEffect(() => {
    loadForecastData();
  }, [loadForecastData]); // Include loadForecastData in dependencies

  const getRiskBadgeClass = (riskLevel) => {
    switch (riskLevel) {
      case 'CRITICAL': return 'risk-critical';
      case 'HIGH': return 'risk-high';
      case 'MEDIUM': return 'risk-medium';
      case 'LOW': return 'risk-low';
      default: return 'risk-safe';
    }
  };

  if (loading) {
    return <div className="demand-forecast loading">📊 Loading demand forecast...</div>;
  }

  return (
    <div className="demand-forecast">
      <div className="forecast-header">
        <h2>📈 AI Demand Forecasting</h2>
        <div className="forecast-controls">
          <select
            value={forecastDays}
            onChange={(e) => setForecastDays(parseInt(e.target.value))}
            className="forecast-select"
          >
            <option value={7}>7 Days Forecast</option>
            <option value={30}>30 Days Forecast</option>
            <option value={60}>60 Days Forecast</option>
            <option value={90}>90 Days Forecast</option>
          </select>
          <button onClick={loadForecastData} className="refresh-btn">
            🔄 Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <p>❌ {error}</p>
          <p>Please ensure:</p>
          <ul>
            <li>Spring Boot backend is running on port 8080</li>
            <li>You have products in the database</li>
            <li>You have recorded some sales transactions</li>
          </ul>
        </div>
      )}

      {forecastData && (
        <>
          {/* Summary Stats */}
          <div className="forecast-summary">
            <div className="summary-card">
              <h3>Total Products</h3>
              <div className="summary-number">{forecastData.totalProducts}</div>
            </div>
            <div className="summary-card">
              <h3>High Risk</h3>
              <div className="summary-number risk-high">{forecastData.highRiskCount}</div>
            </div>
            <div className="summary-card">
              <h3>Medium Risk</h3>
              <div className="summary-number risk-medium">{forecastData.mediumRiskCount}</div>
            </div>
            <div className="summary-card">
              <h3>Forecast Period</h3>
              <div className="summary-period">{forecastData.forecastPeriod}</div>
            </div>
          </div>

          {/* Products Forecast Table */}
          <div className="forecast-table-section">
            <h3>Product Demand Forecast</h3>
            <div className="table-container">
              <table className="forecast-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Current Stock</th>
                    <th>Avg Daily Sales</th>
                    <th>Days Stock Left</th>
                    <th>Forecasted Demand</th>
                    <th>Risk Level</th>
                    <th>Recommended Action</th>
                  </tr>
                </thead>
                <tbody>
                  {forecastData.productForecasts.map((product) => (
                    <tr key={product.productId} className={`forecast-row ${getRiskBadgeClass(product.riskLevel)}`}>
                      <td className="product-name">
                        <strong>{product.productName}</strong>
                      </td>
                      <td className="stock-info">
                        {product.currentStock}
                        {product.currentStock <= product.reorderThreshold && (
                          <span className="low-stock-indicator"> ⚠️</span>
                        )}
                      </td>
                      <td className="sales-info">{product.avgDailySales?.toFixed(2)}</td>
                      <td className="days-left">
                        <span className={product.daysOfStockLeft <= 7 ? 'warning' : ''}>
                          {/* Fixed: Use a large number instead of Integer.MAX_VALUE */}
                          {product.daysOfStockLeft > 10000 ? '∞' : product.daysOfStockLeft}
                        </span>
                      </td>
                      <td className="forecast-demand">{product.forecastedDemand}</td>
                      <td className="risk-level">
                        <span className={`risk-badge ${getRiskBadgeClass(product.riskLevel)}`}>
                          {product.riskLevel}
                        </span>
                      </td>
                      <td className="recommended-action">
                        {product.recommendedAction}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Forecast Chart Section */}
          <div className="forecast-chart-section">
            <h3>Demand Trend Projection</h3>
            <div className="chart-container">
              {forecastData.productForecasts.slice(0, 5).map((product) => (
                <div key={product.productId} className="chart-item">
                  <div className="chart-label">{product.productName}</div>
                  <div className="chart-bar-container">
                    <div
                      className="chart-bar current-stock"
                      style={{ width: `${Math.min((product.currentStock / 100) * 100, 100)}%` }}
                      title={`Current Stock: ${product.currentStock}`}
                    ></div>
                    <div
                      className="chart-bar forecast-demand"
                      style={{ width: `${Math.min((product.forecastedDemand / 100) * 100, 100)}%` }}
                      title={`Forecasted Demand: ${product.forecastedDemand}`}
                    ></div>
                  </div>
                  <div className="chart-legend">
                    <span>Stock: {product.currentStock}</span>
                    <span>Forecast: {product.forecastedDemand}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {!forecastData && !loading && !error && (
        <div className="no-data">
          <p>No forecast data available. Start by adding products and recording sales.</p>
          <button onClick={loadForecastData} className="refresh-btn">
            Try Loading Again
          </button>
        </div>
      )}
    </div>
  );
};

export default DemandForecast;