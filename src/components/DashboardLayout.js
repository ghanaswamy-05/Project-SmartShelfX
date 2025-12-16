// src/components/DashboardPage.js
import React from "react";
import DashboardLayout from "./DashboardLayout";
import ProductManager from "./ProductManager";
import "./DashboardPage.css";

export default function DashboardPage() {
  return (
    <DashboardLayout userName="Admin">
      <div className="dashboard-widgets">
        {/* we can add more widgets here later */}
        <section className="dashboard-section">
          <h2>📦 Product Overview</h2>
          <ProductManager />
        </section>
      </div>
    </DashboardLayout>
  );
}