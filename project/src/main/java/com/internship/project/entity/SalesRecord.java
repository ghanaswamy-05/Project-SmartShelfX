// SalesRecord.java (Updated)
package com.internship.project.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;

@Entity
@Table(name = "sales_records")
@Getter
@Setter
@RestController
@RequestMapping("/api/transactions") // This is the correct endpoint
@CrossOrigin(origins = "http://localhost:3000")
public class SalesRecord {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(nullable = false)
    private int quantitySold;

    @Column(nullable = false)
    private double totalAmount;

    @Column(nullable = false)
    private LocalDateTime saleDate;

    private String warehouseLocation;

    @Column(nullable = false)
    private String transactionType; // SHIPMENT, SALE, RETURN

    private String handlerName; // Added field to track handler

    // Constructor to be used by the service layer
    public SalesRecord(Product product, int quantitySold, String warehouseLocation, String transactionType, String handlerName) {
        this.product = product;
        this.quantitySold = quantitySold;
        // Calculate total amount based on the product's price.
        // For SALE/SHIPMENT, the value is positive.
        // NOTE: totalAmount calculation here assumes a SALE.
        // For SHIPMENT/RETURN, you might need different logic,
        // but for now, we'll calculate the value of the stock moved.
        this.totalAmount = product.getPrice() * quantitySold;
        this.warehouseLocation = warehouseLocation;
        this.transactionType = transactionType;
        this.handlerName = handlerName;
        this.saleDate = LocalDateTime.now(); // Set the transaction timestamp
    }

    // Default constructor for JPA/Hibernate
    public SalesRecord() {
    }
}