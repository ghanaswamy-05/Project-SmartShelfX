// src/components/PurchaseOrderForm.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './PurchaseOrderForm.css';

const PurchaseOrderForm = () => {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/products');
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedProduct || !quantity) {
      alert('Please select a product and enter quantity');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      const buyerId = localStorage.getItem('userId');

      await axios.post(`http://localhost:8080/api/purchase-orders/manual`, null, {
        params: {
          productId: selectedProduct,
          buyerId: buyerId,
          quantity: parseInt(quantity),
          notes: notes
        },
        headers: { Authorization: `Bearer ${token}` }
      });

      alert('Purchase order created successfully!');
      // Reset form
      setSelectedProduct('');
      setQuantity('');
      setNotes('');
    } catch (error) {
      console.error('Error creating purchase order:', error);
      alert('Error creating purchase order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="purchase-order-form">
      <h3>Create Manual Purchase Order</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Product:</label>
          <select
            value={selectedProduct}
            onChange={(e) => setSelectedProduct(e.target.value)}
            required
          >
            <option value="">Select a product</option>
            {products.map(product => (
              <option key={product.id} value={product.id}>
                {product.name} (Stock: {product.quantity})
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Quantity:</label>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            min="1"
            required
          />
        </div>

        <div className="form-group">
          <label>Notes (Optional):</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add any notes for this purchase order..."
            rows="3"
          />
        </div>

        <button type="submit" disabled={loading} className="submit-btn">
          {loading ? 'Creating...' : 'Create Purchase Order'}
        </button>
      </form>
    </div>
  );
};

export default PurchaseOrderForm;