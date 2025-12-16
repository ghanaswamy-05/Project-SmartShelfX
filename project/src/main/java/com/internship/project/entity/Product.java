package com.internship.project.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "products")
@Getter
@Setter
@RequiredArgsConstructor
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name = "";

    @Column(length = 1000)
    private String description = "";

    @Column(nullable = false)
    private int quantity = 0;

    @Column(name = "reorder_threshold", nullable = false)
    private int reorderThreshold = 0;

    @Column(nullable = false)
    private double price = 0.0;

    // Store only the image file name
    @Column(name = "image_file_name")
    private String imageFileName;

    // Helper method to check if product has image
    public boolean hasImage() {
        return imageFileName != null && !imageFileName.isEmpty();
    }

    // Helper method to get image URL
    public String getImageUrl() {
        return hasImage() ? "/uploads/" + imageFileName : null;
    }
}