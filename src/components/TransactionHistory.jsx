// src/components/TransactionHistory.jsx
import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import "./TransactionHistory.css";

const TransactionHistory = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("ALL");

  // Wrap loadRealTransactions in useCallback to fix the dependency issue
  const loadRealTransactions = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("authToken");

      const transactionsResponse = await axios.get("http://localhost:8080/api/transactions", {
        headers: {
          'Authorization': token
        }
      });

      // Map the backend transactions to the required front-end format
      const mappedTransactions = transactionsResponse.data.map(t => {
        // Normalize the transaction type from backend (SHIPMENT, SALE, RETURN)
        // to front-end display type (STOCK_IN, STOCK_OUT)
        let type;
        if (t.transactionType === "SALE") {
          type = "STOCK_OUT";
        } else if (t.transactionType === "SHIPMENT" || t.transactionType === "RETURN") {
          type = "STOCK_IN";
        } else {
            type = t.transactionType; // Default to the raw type if unknown
        }

        return {
          id: `${t.transactionType.toLowerCase()}-${t.id}`,
          type: type,
          productName: t.product?.name || "Unknown Product",
          quantity: t.quantitySold, // Note: quantitySold is used for all types
          timestamp: t.saleDate,
          handler: t.handlerName || "N/A", // Use handlerName from the updated entity
          reference: `${t.transactionType} #${t.id}`,
          totalAmount: t.totalAmount,
          warehouse: t.warehouseLocation
        }
      });

      const allTransactions = mappedTransactions
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      setTransactions(allTransactions);

    } catch (error) {
      console.error("Failed to load real transactions:", error);
      // The alert will only show if the request failed AND we have no existing data.
      if (transactions.length === 0) {
        alert("Could not load transaction history. Please check if sales data exists and the backend is running.");
      }
    } finally {
      setLoading(false);
    }
  }, [transactions.length]); // Add transactions.length as dependency

  useEffect(() => {
    loadRealTransactions();

    // The polling mechanism (setInterval) has been removed here to stop the auto-refresh.

    // If you need the polling functionality later, you can re-introduce the following:
    /*
    const intervalId = setInterval(() => {
      loadRealTransactions();
    }, 10000); // Update every 10 seconds

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
    */

  }, [filter, loadRealTransactions]); // Add loadRealTransactions to dependencies

  const handleRefresh = () => {
    loadRealTransactions();
  };

  const filteredTransactions = filter === "ALL"
    ? transactions
    : transactions.filter(t => t.type === filter);

  const getTransactionTypeBadge = (type) => {
    // Check for both front-end and backend types in case of inconsistent data
    return (type === "STOCK_OUT" || type === "SALE")
      ? { class: "stock-out", label: "📤 Stock Out" }
      : { class: "stock-in", label: "📥 Stock In" };
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  // Calculate statistics
  const totalTransactions = transactions.length;
  const stockOutCount = transactions.filter(t => t.type === "STOCK_OUT").length;
  const stockInCount = transactions.filter(t => t.type === "STOCK_IN").length;
  const totalRevenue = transactions
    .filter(t => t.type === "STOCK_OUT" && t.totalAmount) // Calculate revenue only from Stock-Out (Sales)
    .reduce((sum, t) => sum + t.totalAmount, 0);

  return (
    <div className="transaction-history">
      <div className="transaction-header">
        <h2>📋 Transaction History</h2>
        <p>Real-time stock movements tracking</p>
        <button
          onClick={handleRefresh}
          className="refresh-btn"
          disabled={loading}
        >
          {loading ? "⏳ Refreshing..." : "🔄 Refresh"}
        </button>
      </div>

      <div className="transaction-filters">
        <button
          className={`filter-btn ${filter === "ALL" ? "active" : ""}`}
          onClick={() => setFilter("ALL")}
        >
          All Transactions
        </button>
        <button
          className={`filter-btn ${filter === "STOCK_OUT" ? "active" : ""}`}
          onClick={() => setFilter("STOCK_OUT")}
        >
          Stock Out (Sales)
        </button>
        <button
          className={`filter-btn ${filter === "STOCK_IN" ? "active" : ""}`}
          onClick={() => setFilter("STOCK_IN")}
        >
          Stock In
        </button>
      </div>

      {loading && transactions.length === 0 ? (
        <div className="loading">⏳ Loading real transactions...</div>
      ) : (
        <div className="transactions-table">
          <table>
            <thead>
              <tr>
                <th>Type</th>
                <th>Product</th>
                <th>Quantity</th>
                <th>Amount</th>
                <th>Date & Time</th>
                <th>Warehouse</th>
                <th>Handler</th>
                <th>Reference</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map(transaction => {
                  const typeBadge = getTransactionTypeBadge(transaction.type);
                  return (
                    <tr key={transaction.id} className={typeBadge.class}>
                      <td>
                        <span className={`type-badge ${typeBadge.class}`}>
                          {typeBadge.label}
                        </span>
                      </td>
                      <td className="product-name">{transaction.productName}</td>
                      <td className="quantity">{transaction.quantity}</td>
                      <td className="amount">
                        {/* Only display amount for sales/stock-out for revenue tracking */}
                        {transaction.type === "STOCK_OUT" && transaction.totalAmount > 0 ? `$${transaction.totalAmount.toFixed(2)}` : '-'}
                      </td>
                      <td className="timestamp">{formatDate(transaction.timestamp)}</td>
                      <td className="warehouse">{transaction.warehouse || 'Main'}</td>
                      <td className="handler">{transaction.handler}</td>
                      <td className="reference">{transaction.reference}</td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="8" className="no-data">
                    {filter === "STOCK_IN"
                      ? "No stock-in transactions recorded yet"
                      : "No transactions found. Record some movements to see history."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <div className="transaction-stats">
        <div className="stat-card">
          <h3>Total Movements</h3>
          <div className="stat-number">{totalTransactions}</div>
        </div>
        <div className="stat-card">
          <h3>Stock-Out Count</h3>
          <div className="stat-number">{stockOutCount}</div>
        </div>
        <div className="stat-card">
          <h3>Stock-In Count</h3>
          <div className="stat-number">{stockInCount}</div>
        </div>
        <div className="stat-card">
          <h3>Total Revenue</h3>
          <div className="stat-number">${totalRevenue.toFixed(2)}</div>
        </div>
      </div>
    </div>
  );
};

export default TransactionHistory;