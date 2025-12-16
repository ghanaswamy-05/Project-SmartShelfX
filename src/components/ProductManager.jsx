import React, { useEffect, useState } from "react";
import {
  getProducts,
  addProduct,
  updateProduct,
  deleteProduct,
} from "../api/productApi";
import "./ProductManager.css";

export default function ProductManager() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({
    name: "",
    description: "",
    quantity: "",
    reorderThreshold: "",
    price: ""
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await getProducts();
      setProducts(data || []);
    } catch (error) {
      console.error('Failed to load products:', error);
      alert('Failed to load products.');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name || form.quantity === "" || form.reorderThreshold === "" || !form.price) {
      alert("Please fill all required fields.");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append('name', form.name.trim());
      formData.append('description', form.description.trim());
      formData.append('quantity', form.quantity);
      formData.append('reorderThreshold', form.reorderThreshold);
      formData.append('price', form.price);

      if (imageFile) {
        formData.append('image', imageFile);
      }

      if (editingId) {
        await updateProduct(editingId, formData);
      } else {
        await addProduct(formData);
      }

      await loadProducts();
      resetForm();
      alert(editingId ? "Product updated successfully!" : "Product added successfully!");
    } catch (error) {
      console.error('Operation failed:', error);
      alert(`Operation failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({
      name: "",
      description: "",
      quantity: "",
      reorderThreshold: "",
      price: ""
    });
    setImageFile(null);
    setImagePreview(null);
    setEditingId(null);

    // Clear file input
    const fileInput = document.getElementById('product-image');
    if (fileInput) fileInput.value = '';
  };

  const handleEdit = (product) => {
    setForm({
      name: product.name || "",
      description: product.description || "",
      quantity: product.quantity?.toString() || "0",
      reorderThreshold: product.reorderThreshold?.toString() || "0",
      price: product.price?.toString() || "0"
    });
    setEditingId(product.id);

    // Set image preview if product has image
    if (product.imageFileName) {
      setImagePreview(`http://localhost:8080/uploads/${product.imageFileName}`);
    } else {
      setImagePreview(null);
    }
    setImageFile(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) {
      return;
    }

    try {
      setLoading(true);
      await deleteProduct(id);
      await loadProducts();
      alert("Product deleted successfully!");
    } catch (error) {
      console.error('Delete failed:', error);
      alert(`Delete failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const getStockStatus = (product) => {
    if (product.quantity === 0) return { status: "Out of Stock", class: "out-of-stock" };
    if (product.quantity <= product.reorderThreshold) return { status: "Low Stock", class: "low-stock" };
    return { status: "In Stock", class: "in-stock" };
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    const fileInput = document.getElementById('product-image');
    if (fileInput) fileInput.value = '';
  };

  return (
    <div className="product-manager">
      <div className="product-manager-container">
        <div className="product-manager-header">
          <h2>📦 Product Manager</h2>
        </div>

        <div className="product-form-section">
          <form onSubmit={handleSubmit} className="product-form" encType="multipart/form-data">
            <div className="form-group">
              <label>Product Name *</label>
              <input
                placeholder="Enter product name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                disabled={loading}
                required
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <input
                placeholder="Enter product description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label>Quantity *</label>
              <input
                type="number"
                placeholder="Enter quantity"
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                min="0"
                disabled={loading}
                required
              />
            </div>

            <div className="form-group">
              <label>Reorder Threshold *</label>
              <input
                type="number"
                placeholder="Enter reorder threshold"
                value={form.reorderThreshold}
                onChange={(e) => setForm({ ...form, reorderThreshold: e.target.value })}
                min="0"
                disabled={loading}
                required
              />
            </div>

            <div className="form-group">
              <label>Price ($) *</label>
              <input
                type="number"
                step="0.01"
                placeholder="Enter price"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                min="0"
                disabled={loading}
                required
              />
            </div>

            {/* Image Upload Section */}
            <div className="form-group full-width">
              <label>Product Image</label>
              <div className="image-upload-container">
                <input
                  id="product-image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  disabled={loading}
                  className="image-input"
                />

                {imagePreview && (
                  <div className="image-preview">
                    <img src={imagePreview} alt="Preview" />
                    <button
                      type="button"
                      className="remove-image-btn"
                      onClick={removeImage}
                      disabled={loading}
                    >
                      ❌
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? "⏳ Processing..." : editingId ? "🔄 Update Product" : "➕ Add Product"}
              </button>

              {editingId && (
                <button type="button" className="cancel-btn" onClick={resetForm} disabled={loading}>
                  ❌ Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="products-section">
          <h3 className="section-title">📋 Product Inventory ({products.length})</h3>

          {loading && (
            <div className="loading">
              ⏳ Loading products...
            </div>
          )}

          <div className="products-grid">
            {products.map((product) => {
              const stockStatus = getStockStatus(product);
              return (
                <div key={product.id} className={`product-card ${stockStatus.class}`}>
                  <div className="product-image-section">
                    {product.imageFileName ? (
                      <img
                        src={`http://localhost:8080/uploads/${product.imageFileName}`}
                        alt={product.name}
                        className="product-image"
                        onError={(e) => {
                          console.error('Error loading image:', product.imageFileName);
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'block';
                        }}
                      />
                    ) : null}
                    <div className="no-image" style={{display: product.imageFileName ? 'none' : 'block'}}>
                      📷 No Image
                    </div>
                  </div>

                  <div className="product-header">
                    <h3 className="product-name">{product.name}</h3>
                    <span className={`stock-badge ${stockStatus.class}`}>
                      {stockStatus.status}
                    </span>
                  </div>

                  <p className="product-description">
                    {product.description || "No description available"}
                  </p>

                  <div className="product-stats">
                    <div className="stat-item">
                      <span className="stat-label">Quantity</span>
                      <span className="stat-value">{product.quantity} units</span>
                    </div>

                    <div className="stat-item">
                      <span className="stat-label">Reorder At</span>
                      <span className="stat-value">{product.reorderThreshold} units</span>
                    </div>

                    <div className="stat-item">
                      <span className="stat-label">Price</span>
                      <span className="stat-value price">${product.price?.toFixed(2) || '0.00'}</span>
                    </div>

                    <div className="stat-item">
                      <span className="stat-label">Status</span>
                      <span className={`stat-value status ${stockStatus.class}`}>
                        {stockStatus.status}
                      </span>
                    </div>
                  </div>

                  {product.quantity <= product.reorderThreshold && product.quantity > 0 && (
                    <div className="reorder-alert">
                      ⚠️ Time to reorder! Stock is getting low.
                    </div>
                  )}

                  {product.quantity === 0 && (
                    <div className="reorder-alert out-of-stock-alert">
                      🚫 Out of Stock! Please restock immediately.
                    </div>
                  )}

                  <div className="product-actions">
                    <button
                      onClick={() => handleEdit(product)}
                      className="edit-btn"
                      disabled={loading}
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="delete-btn"
                      disabled={loading}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {products.length === 0 && !loading && (
            <div className="no-products">
              📦 No products found. Add your first product above.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}