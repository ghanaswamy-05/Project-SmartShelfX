// src/components/BuyerDashboard.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './BuyerDashboard.css';

const BuyerDashboard = () => {
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [paymentDetails, setPaymentDetails] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardHolder: ''
  });

  useEffect(() => {
    fetchPurchaseOrders();
    fetchProducts();
  }, []);

  const fetchPurchaseOrders = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get('http://localhost:8080/api/purchase-orders', {
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json'
        }
      });
      setPurchaseOrders(response.data);
    } catch (error) {
      console.error('Error fetching purchase orders:', error);
      // If API fails, show empty state
      setPurchaseOrders([]);
    }
  };

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get('http://localhost:8080/api/products', {
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json'
        }
      });
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
      // If API fails, show empty state
      setProducts([]);
    }
  };

  const handleCreateOrder = async (e) => {
    e.preventDefault();

    if (!selectedProduct || !quantity) {
      alert('Please select a product and enter quantity');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      const buyerId = 1; // You might need to get this from user context

      await axios.post(`http://localhost:8080/api/purchase-orders/manual`, null, {
        params: {
          productId: selectedProduct,
          buyerId: buyerId,
          quantity: parseInt(quantity),
          notes: notes
        },
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json'
        }
      });

      alert('Purchase order created successfully!');
      // Reset form
      setSelectedProduct('');
      setQuantity('');
      setNotes('');
      fetchPurchaseOrders(); // Refresh orders
    } catch (error) {
      console.error('Error creating purchase order:', error);
      alert('Error creating purchase order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveOrder = async (orderId) => {
    try {
      const token = localStorage.getItem('authToken');
      await axios.post(`http://localhost:8080/api/purchase-orders/${orderId}/approve`, {}, {
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json'
        }
      });

      alert('Order approved successfully!');
      fetchPurchaseOrders();
    } catch (error) {
      console.error('Error approving order:', error);
      alert('Error approving order. Please try again.');
    }
  };

  const handleCompleteOrder = async (orderId) => {
    try {
      const token = localStorage.getItem('authToken');
      await axios.post(`http://localhost:8080/api/purchase-orders/${orderId}/complete`, {}, {
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json'
        }
      });

      alert('Order completed successfully! Stock has been updated.');
      fetchPurchaseOrders();
    } catch (error) {
      console.error('Error completing order:', error);
      alert('Error completing order. Please try again.');
    }
  };

  const handlePayment = (order) => {
    setSelectedOrder(order);
    setShowPayment(true);
  };

  const processPayment = async () => {
    if (!paymentDetails.cardNumber || !paymentDetails.expiryDate || !paymentDetails.cvv || !paymentDetails.cardHolder) {
      alert('Please fill in all payment details');
      return;
    }

    // Simulate payment processing
    setLoading(true);
    setTimeout(() => {
      alert('Payment processed successfully! Order will be completed.');
      handleCompleteOrder(selectedOrder.id);
      setShowPayment(false);
      setPaymentDetails({
        cardNumber: '',
        expiryDate: '',
        cvv: '',
        cardHolder: ''
      });
      setLoading(false);
    }, 2000);
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      PENDING: 'status-pending',
      APPROVED: 'status-approved',
      COMPLETED: 'status-completed',
      CANCELLED: 'status-cancelled'
    };

    return <span className={`status-badge ${statusColors[status]}`}>{status}</span>;
  };

  const calculateTotal = (order) => {
    return order.quantity * (order.unitPrice || order.product?.price || 0);
  };

  return (
    <div className="buyer-dashboard">
      <div className="dashboard-header">
        <h1>🛒 Buyer Dashboard</h1>
        <p>Manage purchase orders and inventory replenishment</p>
      </div>

      <div className="dashboard-stats">
        <div className="stat-card">
          <h3>Total Orders</h3>
          <p className="stat-number">{purchaseOrders.length}</p>
        </div>
        <div className="stat-card">
          <h3>Pending</h3>
          <p className="stat-number">
            {purchaseOrders.filter(order => order.status === 'PENDING').length}
          </p>
        </div>
        <div className="stat-card">
          <h3>Completed</h3>
          <p className="stat-number">
            {purchaseOrders.filter(order => order.status === 'COMPLETED').length}
          </p>
        </div>
      </div>

      {/* Create New Purchase Order */}
      <div className="create-order-section">
        <h2>Create New Purchase Order</h2>
        <form onSubmit={handleCreateOrder} className="order-form">
          <div className="form-row">
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
                    {product.name} (Stock: {product.quantity}, Threshold: {product.reorderThreshold})
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

      {/* Purchase Orders List */}
      <div className="purchase-orders-section">
        <h2>Purchase Orders</h2>

        <div className="orders-grid">
          {purchaseOrders.map((order) => (
            <div key={order.id} className="order-card">
              <div className="order-header">
                <h3>{order.product?.name || 'Product'}</h3>
                {getStatusBadge(order.status)}
              </div>

              <div className="order-details">
                <p><strong>Quantity:</strong> {order.quantity} units</p>
                <p><strong>Unit Price:</strong> ${order.unitPrice?.toFixed(2) || order.product?.price?.toFixed(2)}</p>
                <p><strong>Total Amount:</strong> ${calculateTotal(order).toFixed(2)}</p>
                <p><strong>Order Date:</strong> {new Date(order.orderDate).toLocaleDateString()}</p>
                {order.autoTriggered && <span className="auto-tag">🤖 Auto-generated</span>}
              </div>

              <div className="order-notes">
                <p><strong>Notes:</strong> {order.notes}</p>
              </div>

              <div className="order-actions">
                {order.status === 'PENDING' && (
                  <button
                    onClick={() => handleApproveOrder(order.id)}
                    className="btn-approve"
                  >
                    ✅ Approve
                  </button>
                )}

                {order.status === 'APPROVED' && (
                  <button
                    onClick={() => handlePayment(order)}
                    className="btn-pay"
                  >
                    💳 Process Payment
                  </button>
                )}

                {order.status === 'COMPLETED' && order.completionDate && (
                  <p className="completed-date">
                    Completed: {new Date(order.completionDate).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {purchaseOrders.length === 0 && (
          <div className="no-orders">
            <p>No purchase orders found.</p>
            <p>Auto-replenishment orders will appear here when stock is low.</p>
          </div>
        )}
      </div>

      {/* Payment Modal */}
      {showPayment && (
        <div className="payment-modal">
          <div className="payment-content">
            <h3>💳 Process Payment</h3>
            <p>Order: {selectedOrder?.product?.name} - ${calculateTotal(selectedOrder).toFixed(2)}</p>

            <div className="payment-form">
              <div className="form-group">
                <label>Card Number:</label>
                <input
                  type="text"
                  placeholder="1234 5678 9012 3456"
                  value={paymentDetails.cardNumber}
                  onChange={(e) => setPaymentDetails({...paymentDetails, cardNumber: e.target.value})}
                  maxLength="16"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Expiry Date:</label>
                  <input
                    type="text"
                    placeholder="MM/YY"
                    value={paymentDetails.expiryDate}
                    onChange={(e) => setPaymentDetails({...paymentDetails, expiryDate: e.target.value})}
                  />
                </div>

                <div className="form-group">
                  <label>CVV:</label>
                  <input
                    type="text"
                    placeholder="123"
                    value={paymentDetails.cvv}
                    onChange={(e) => setPaymentDetails({...paymentDetails, cvv: e.target.value})}
                    maxLength="3"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Card Holder Name:</label>
                <input
                  type="text"
                  placeholder="John Doe"
                  value={paymentDetails.cardHolder}
                  onChange={(e) => setPaymentDetails({...paymentDetails, cardHolder: e.target.value})}
                />
              </div>
            </div>

            <div className="payment-actions">
              <button onClick={processPayment} disabled={loading} className="btn-pay-confirm">
                {loading ? 'Processing...' : 'Confirm Payment'}
              </button>
              <button onClick={() => setShowPayment(false)} className="btn-cancel">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BuyerDashboard;