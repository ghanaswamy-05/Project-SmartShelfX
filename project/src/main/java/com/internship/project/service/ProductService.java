package com.internship.project.service;

import com.internship.project.entity.Product;
import com.internship.project.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class ProductService {

    @Autowired
    private ProductRepository repo;

    private final String UPLOAD_DIR = "uploads/";

    public List<Product> getAllProducts() {
        return repo.findAll();
    }

    public Product addProduct(Product product, MultipartFile imageFile) throws IOException {
        // Validate required fields
        if (product.getName() == null || product.getName().trim().isEmpty()) {
            throw new IllegalArgumentException("Product name is required");
        }

        // Handle image upload
        if (imageFile != null && !imageFile.isEmpty()) {
            // Create uploads directory if it doesn't exist
            Files.createDirectories(Paths.get(UPLOAD_DIR));

            // Generate unique file name
            String originalFileName = imageFile.getOriginalFilename();
            String fileExtension = "";
            if (originalFileName != null && originalFileName.contains(".")) {
                fileExtension = originalFileName.substring(originalFileName.lastIndexOf("."));
            }

            String uniqueFileName = UUID.randomUUID().toString() + fileExtension;
            Path filePath = Paths.get(UPLOAD_DIR + uniqueFileName);

            // Save file
            Files.copy(imageFile.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            // Store file name in database
            product.setImageFileName(uniqueFileName);

            System.out.println("Image saved: " + filePath.toAbsolutePath());
        }

        return repo.save(product);
    }

    public Optional<Product> updateProduct(Long id, Product updated, MultipartFile imageFile) throws IOException {
        return repo.findById(id).map(existing -> {
            existing.setName(updated.getName());
            existing.setDescription(updated.getDescription());
            existing.setQuantity(updated.getQuantity());
            existing.setReorderThreshold(updated.getReorderThreshold());
            existing.setPrice(updated.getPrice());

            // Handle image update
            if (imageFile != null && !imageFile.isEmpty()) {
                try {
                    // Delete old image if exists
                    if (existing.getImageFileName() != null) {
                        Path oldFilePath = Paths.get(UPLOAD_DIR + existing.getImageFileName());
                        Files.deleteIfExists(oldFilePath);
                    }

                    // Create uploads directory if it doesn't exist
                    Files.createDirectories(Paths.get(UPLOAD_DIR));

                    // Generate unique file name
                    String originalFileName = imageFile.getOriginalFilename();
                    String fileExtension = "";
                    if (originalFileName != null && originalFileName.contains(".")) {
                        fileExtension = originalFileName.substring(originalFileName.lastIndexOf("."));
                    }

                    String uniqueFileName = UUID.randomUUID().toString() + fileExtension;
                    Path filePath = Paths.get(UPLOAD_DIR + uniqueFileName);

                    // Save new file
                    Files.copy(imageFile.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

                    // Update file name in database
                    existing.setImageFileName(uniqueFileName);

                    System.out.println("Image updated: " + filePath.toAbsolutePath());
                } catch (IOException e) {
                    throw new RuntimeException("Failed to update image: " + e.getMessage());
                }
            }

            return repo.save(existing);
        });
    }

    public boolean deleteProduct(Long id) {
        Optional<Product> product = repo.findById(id);
        if (product.isPresent()) {
            // Delete image file if exists
            if (product.get().getImageFileName() != null) {
                try {
                    Path filePath = Paths.get(UPLOAD_DIR + product.get().getImageFileName());
                    Files.deleteIfExists(filePath);
                } catch (IOException e) {
                    System.err.println("Failed to delete image file: " + e.getMessage());
                }
            }
            repo.deleteById(id);
            return true;
        }
        return false;
    }

    public Optional<Product> getProductById(Long id) {
        return repo.findById(id);
    }
}