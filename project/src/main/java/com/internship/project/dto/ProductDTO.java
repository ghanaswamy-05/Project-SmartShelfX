package com.internship.project.dto;

import lombok.Getter;
import lombok.Setter;
import org.springframework.web.multipart.MultipartFile;

@Getter
@Setter
public class ProductDTO {
    private String name;
    private String description;
    private int quantity;
    private int reorderThreshold;
    private double price;
    private MultipartFile image;
    private String imageBase64; // For base64 encoded images
}