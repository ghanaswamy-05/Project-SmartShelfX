import React, { useEffect, useState } from "react";
import { getProducts } from "../api/productApi";
import "./DashboardPage.css";

export default function DashboardPage() {
  const [products, setProducts] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await getProducts();
      setProducts(data || []);

      // Filter low stock products
      const lowStock = data.filter(
        product => product.quantity <= product.reorderThreshold
      );
      setLowStockProducts(lowStock);
    } catch (error) {
      console.error('Failed to load products:', error);
      setProducts([]);
      setLowStockProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const getStockStatus = (quantity, threshold) => {
    if (quantity === 0) return { status: "Out of Stock", class: "out-of-stock" };
    if (quantity <= threshold) return { status: "Low Stock", class: "low-stock" };
    return { status: "In Stock", class: "in-stock" };
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <h1>📊 Inventory Dashboard</h1>
        <p>Real-time overview of your product inventory</p>
      </div>

      <div className="dashboard-stats">
        <div className="stat-card">
          <h3>Total Products</h3>
          <div className="stat-number">{products.length}</div>
        </div>
        <div className="stat-card warning">
          <h3>Low Stock Items</h3>
          <div className="stat-number">{lowStockProducts.length}</div>
        </div>
        <div className="stat-card">
          <h3>In Stock Items</h3>
          <div className="stat-number">
            {products.filter(p => p.quantity > p.reorderThreshold && p.quantity > 0).length}
          </div>
        </div>
      </div>

      {lowStockProducts.length > 0 && (
        <div className="alert-section">
          <div className="alert alert-warning">
            <strong>⚠️ Attention Needed:</strong> {lowStockProducts.length} product(s) are running low on stock.
          </div>
        </div>
      )}

      <div className="products-overview">
        <h2>📦 Product Overview</h2>

        {loading && (
          <div className="loading">
            ⏳ Loading products...
          </div>
        )}

        <div className="dashboard-products-grid">
          {products.map(product => {
            const stockStatus = getStockStatus(product.quantity, product.reorderThreshold);

            return (
              <div key={product.id} className="dashboard-product-card">
                <div className="product-image-container">
                  {product.imageFileName ? (
                    <img
                      src={`http://localhost:8080/uploads/${product.imageFileName}`}
                      alt={product.name}
                      className="product-image"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div className="no-image-placeholder" style={{display: product.imageFileName ? 'none' : 'flex'}}>
                    📷
                  </div>
                </div>

                <div className="product-info">
                  <h3 className="product-name">{product.name}</h3>
                  <p className="product-description">
                    {product.description || "No description available"}
                  </p>

                  <div className="product-details">
                    <div className="detail-row">
                      <span className="detail-label">Quantity:</span>
                      <span className={`detail-value ${stockStatus.class}`}>
                        {product.quantity} units
                      </span>
                    </div>

                    <div className="detail-row">
                      <span className="detail-label">Reorder At:</span>
                      <span className="detail-value">{product.reorderThreshold} units</span>
                    </div>

                    <div className="detail-row">
                      <span className="detail-label">Price:</span>
                      <span className="detail-value price">${product.price?.toFixed(2) || '0.00'}</span>
                    </div>

                    <div className="detail-row">
                      <span className="detail-label">Status:</span>
                      <span className={`status-badge ${stockStatus.class}`}>
                        {stockStatus.status}
                      </span>
                    </div>
                  </div>

                  {product.quantity <= product.reorderThreshold && (
                    <div className="stock-alert">
                      {product.quantity === 0 ? '🚫 Out of Stock' : '⚠️ Low Stock'}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {products.length === 0 && !loading && (
          <div className="no-products">
            📦 No products found. Add products in the Product Manager.
          </div>
        )}
      </div>
    </div>
  );
}