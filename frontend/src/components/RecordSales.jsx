// RecordSale.jsx
import React, { useState, useEffect } from "react";
import { getProducts } from "../api/productApi";
import "./RecordSale.css";

export default function RecordSale() {
    const [products, setProducts] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState("");
    const [quantity, setQuantity] = useState(1);
    const [warehouse, setWarehouse] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadProducts();
        // Set default warehouse from user data
        const userWarehouse = localStorage.getItem("assignedWarehouse");
        if (userWarehouse) {
            setWarehouse(userWarehouse);
        }
    }, []);

    const loadProducts = async () => {
        try {
            const data = await getProducts();
            setProducts(data || []);
        } catch (error) {
            console.error('Failed to load products:', error);
        }
    };

    const handleRecordSale = async () => {
        if (!selectedProduct || quantity < 1 || !warehouse) {
            alert("Please fill all fields");
            return;
        }

        try {
            setLoading(true);
            // You'll need to create this API call
            await recordSale(selectedProduct, quantity, warehouse);
            alert("Sale recorded successfully!");
            setSelectedProduct("");
            setQuantity(1);
        } catch (error) {
            alert("Failed to record sale: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="record-sale">
            <h2>💰 Record Sale</h2>
            <div className="sale-form">
                <select
                    value={selectedProduct}
                    onChange={(e) => setSelectedProduct(e.target.value)}
                >
                    <option value="">Select Product</option>
                    {products.map(product => (
                        <option key={product.id} value={product.id}>
                            {product.name} (Stock: {product.quantity})
                        </option>
                    ))}
                </select>

                <input
                    type="number"
                    placeholder="Quantity"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                    min="1"
                />

                <input
                    type="text"
                    placeholder="Warehouse Location"
                    value={warehouse}
                    onChange={(e) => setWarehouse(e.target.value)}
                />

                <button
                    onClick={handleRecordSale}
                    disabled={loading}
                >
                    {loading ? "Recording..." : "Record Sale"}
                </button>
            </div>
        </div>
    );
}