package com.internship.project.service;

import com.internship.project.entity.Product;
import com.internship.project.entity.PurchaseOrder;
import com.internship.project.entity.SalesRecord;
import com.internship.project.entity.User;
import com.internship.project.repository.ProductRepository;
import com.internship.project.repository.PurchaseOrderRepository;
import com.internship.project.repository.SalesRecordRepository;
import com.internship.project.repository.UserRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class SalesRecordService {

    @Autowired
    private SalesRecordRepository salesRecordRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private PurchaseOrderRepository purchaseOrderRepository;

    @Autowired
    private UserRepository userRepository;

    /**
     * Records a shipment (Stock-In) and updates product quantity.
     */
    public SalesRecord recordStockInShipment(Long productId, int quantity, String warehouseLocation, String handlerName) {
        Optional<Product> productOpt = productRepository.findById(productId);

        if (productOpt.isPresent()) {
            Product product = productOpt.get();

            // Create shipment record with type "SHIPMENT"
            SalesRecord shipmentRecord = new SalesRecord(product, quantity, warehouseLocation, "SHIPMENT", handlerName);
            SalesRecord savedRecord = salesRecordRepository.save(shipmentRecord);

            // Update product quantity (add new stock)
            product.setQuantity(product.getQuantity() + quantity);
            productRepository.save(product);

            return savedRecord;
        } else {
            throw new IllegalArgumentException("Product not found with ID: " + productId);
        }
    }

    /**
     * Records a sale (Stock-Out) and updates product quantity.
     */
    public SalesRecord recordStockOut(Long productId, int quantity, String warehouseLocation, String handlerName) {
        Optional<Product> productOpt = productRepository.findById(productId);

        if (productOpt.isPresent()) {
            Product product = productOpt.get();

            // Check if enough stock is available
            if (product.getQuantity() >= quantity) {
                // Create sales record with type "SALE"
                SalesRecord salesRecord = new SalesRecord(product, quantity, warehouseLocation, "SALE", handlerName);
                SalesRecord savedRecord = salesRecordRepository.save(salesRecord);

                // Update product quantity (decrement stock)
                product.setQuantity(product.getQuantity() - quantity);
                productRepository.save(product);

                // Check for auto-replenishment after stock out
                checkAndTriggerAutoReplenishment(product);

                return savedRecord;
            } else {
                throw new IllegalArgumentException("Insufficient stock for product: " + product.getName());
            }
        } else {
            throw new IllegalArgumentException("Product not found with ID: " + productId);
        }
    }

    /**
     * Records a return (Stock-In) and updates product quantity.
     */
    public SalesRecord recordStockInReturn(Long productId, int quantity, String warehouseLocation, String handlerName) {
        Optional<Product> productOpt = productRepository.findById(productId);

        if (productOpt.isPresent()) {
            Product product = productOpt.get();

            // Create return record with type "RETURN"
            SalesRecord returnRecord = new SalesRecord(product, quantity, warehouseLocation, "RETURN", handlerName);
            SalesRecord savedRecord = salesRecordRepository.save(returnRecord);

            // Update product quantity (add back returned items)
            product.setQuantity(product.getQuantity() + quantity);
            productRepository.save(product);

            return savedRecord;
        } else {
            throw new IllegalArgumentException("Product not found with ID: " + productId);
        }
    }

    /**
     * Check and trigger auto-replenishment when stock is low
     */
    private void checkAndTriggerAutoReplenishment(Product product) {
        // Check if stock is 2 less than threshold
        if (product.getQuantity() <= (product.getReorderThreshold() - 2)) {
            // Find a buyer to assign this purchase order
            List<User> buyers = userRepository.findAll().stream()
                    .filter(user -> user.getRole() == User.Role.BUYER)
                    .collect(Collectors.toList());

            if (!buyers.isEmpty()) {
                User buyer = buyers.get(0); // Assign to first available buyer

                // Calculate replenishment quantity (threshold + safety stock)
                int replenishQuantity = product.getReorderThreshold() + 10;

                // Create auto-triggered purchase order
                PurchaseOrder autoOrder = new PurchaseOrder(product, buyer, replenishQuantity, true);
                autoOrder.setStatus("APPROVED"); // Auto-approve for immediate processing
                autoOrder.setSupplierInfo("Auto-generated supplier");
                autoOrder.setNotes("Automatically triggered replenishment for product: " + product.getName() +
                        ". Current stock: " + product.getQuantity() + ", Threshold: " + product.getReorderThreshold());

                purchaseOrderRepository.save(autoOrder);

                System.out.println("Auto-replenishment triggered for product: " + product.getName() +
                        ", Quantity: " + replenishQuantity);

                // Auto-complete the purchase order (simulate instant buying)
                completePurchaseOrder(autoOrder.getId());
            }
        }
    }

    /**
     * Complete a purchase order and update stock
     */
    public void completePurchaseOrder(Long orderId) {
        Optional<PurchaseOrder> orderOpt = purchaseOrderRepository.findById(orderId);

        if (orderOpt.isPresent()) {
            PurchaseOrder order = orderOpt.get();

            if ("APPROVED".equals(order.getStatus())) {
                // Update product stock
                Product product = order.getProduct();
                product.setQuantity(product.getQuantity() + order.getQuantity());
                productRepository.save(product);

                // Update order status
                order.setStatus("COMPLETED");
                order.setCompletionDate(LocalDateTime.now());
                purchaseOrderRepository.save(order);

                // Record this as a shipment
                SalesRecord shipmentRecord = new SalesRecord(
                        product,
                        order.getQuantity(),
                        "Main Warehouse",
                        "SHIPMENT",
                        "Auto-Buyer System"
                );
                salesRecordRepository.save(shipmentRecord);

                System.out.println("Purchase order completed and stock updated for: " + product.getName());
            }
        }
    }

    public List<SalesRecord> getAllTransactions() {
        return salesRecordRepository.findAll();
    }

    public List<SalesRecord> getTransactionsByWarehouse(String warehouseLocation) {
        return salesRecordRepository.findByWarehouseLocation(warehouseLocation);
    }

    /**
     * Get sales records by date range
     */
    public List<SalesRecord> getTransactionsByDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        return salesRecordRepository.findBySaleDateBetween(startDate, endDate);
    }

    /**
     * Get sales records by product
     */
    public List<SalesRecord> getTransactionsByProduct(Long productId) {
        return salesRecordRepository.findByProductId(productId);
    }

    /**
     * Get sales records by warehouse and date range
     */
    public List<SalesRecord> getTransactionsByWarehouseAndDateRange(String warehouseLocation, LocalDateTime startDate, LocalDateTime endDate) {
        return salesRecordRepository.findByWarehouseLocationAndSaleDateBetween(warehouseLocation, startDate, endDate);
    }
    // Add to SalesRecordService.java
    @PostConstruct
    public void initDemoData() {
        try {
            // Check if we already have transactions
            if (salesRecordRepository.count() == 0) {
                System.out.println("Creating demo transactions...");

                // Get some products to associate with transactions
                List<Product> products = productRepository.findAll();

                if (!products.isEmpty()) {
                    // Create some sample transactions
                    Product sampleProduct = products.get(0);

                    // Stock In (Shipment)
                    SalesRecord shipment = new SalesRecord(
                            sampleProduct, 50, "Main Warehouse", "SHIPMENT", "Demo System"
                    );
                    salesRecordRepository.save(shipment);

                    // Stock Out (Sale)
                    SalesRecord sale = new SalesRecord(
                            sampleProduct, 5, "Main Warehouse", "SALE", "Demo Customer"
                    );
                    salesRecordRepository.save(sale);

                    // Stock In (Return)
                    SalesRecord returnRecord = new SalesRecord(
                            sampleProduct, 2, "Main Warehouse", "RETURN", "Demo Customer"
                    );
                    salesRecordRepository.save(returnRecord);

                    System.out.println("Demo transactions created successfully!");
                }
            }
        } catch (Exception e) {
            System.out.println("Could not create demo transactions: " + e.getMessage());
        }
    }
}