package com.internship.project.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Entity
@Table(name = "purchase_orders")
@Getter
@Setter
public class PurchaseOrder {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @ManyToOne
    @JoinColumn(name = "buyer_id", nullable = false)
    private User buyer;

    @Column(nullable = false)
    private int quantity;

    @Column(nullable = false)
    private double unitPrice;

    @Column(nullable = false)
    private double totalAmount;

    @Column(nullable = false)
    private String status; // PENDING, APPROVED, COMPLETED, CANCELLED

    @Column(nullable = false)
    private LocalDateTime orderDate;

    private LocalDateTime completionDate;

    private String supplierInfo;

    @Column(length = 1000)
    private String notes;

    // Automatically triggered flag
    private boolean autoTriggered = false;

    public PurchaseOrder() {
        this.orderDate = LocalDateTime.now();
        this.status = "PENDING";
    }

    public PurchaseOrder(Product product, User buyer, int quantity, boolean autoTriggered) {
        this();
        this.product = product;
        this.buyer = buyer;
        this.quantity = quantity;
        this.unitPrice = product.getPrice() * 0.8; // 20% discount for bulk purchase
        this.totalAmount = this.unitPrice * quantity;
        this.autoTriggered = autoTriggered;
        this.notes = autoTriggered ?
                "Automatically generated purchase order for low stock replenishment" :
                "Manual purchase order";
    }
}