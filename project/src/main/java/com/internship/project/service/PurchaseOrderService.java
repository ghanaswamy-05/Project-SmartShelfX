package com.internship.project.service;

import com.internship.project.entity.Product;
import com.internship.project.entity.PurchaseOrder;
import com.internship.project.entity.User;
import com.internship.project.repository.ProductRepository;
import com.internship.project.repository.PurchaseOrderRepository;
import com.internship.project.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class PurchaseOrderService {

    @Autowired
    private PurchaseOrderRepository purchaseOrderRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SalesRecordService salesRecordService;

    public PurchaseOrder createManualPurchaseOrder(Long productId, Long buyerId, int quantity, String notes) {
        Optional<Product> productOpt = productRepository.findById(productId);
        Optional<User> buyerOpt = userRepository.findById(buyerId);

        if (productOpt.isPresent() && buyerOpt.isPresent()) {
            Product product = productOpt.get();
            User buyer = buyerOpt.get();

            if (buyer.getRole() != User.Role.BUYER) {
                throw new IllegalArgumentException("Only buyers can create purchase orders");
            }

            PurchaseOrder order = new PurchaseOrder(product, buyer, quantity, false);
            order.setNotes(notes);

            return purchaseOrderRepository.save(order);
        } else {
            throw new IllegalArgumentException("Product or Buyer not found");
        }
    }

    public List<PurchaseOrder> getBuyerOrders(Long buyerId) {
        return purchaseOrderRepository.findByBuyerId(buyerId);
    }

    public List<PurchaseOrder> getPendingOrders() {
        return purchaseOrderRepository.findByStatus("PENDING");
    }

    public PurchaseOrder approveOrder(Long orderId) {
        Optional<PurchaseOrder> orderOpt = purchaseOrderRepository.findById(orderId);

        if (orderOpt.isPresent()) {
            PurchaseOrder order = orderOpt.get();
            order.setStatus("APPROVED");
            return purchaseOrderRepository.save(order);
        }
        throw new IllegalArgumentException("Order not found");
    }

    public PurchaseOrder completeOrder(Long orderId) {
        salesRecordService.completePurchaseOrder(orderId);
        return purchaseOrderRepository.findById(orderId).orElse(null);
    }

    public List<PurchaseOrder> getAutoTriggeredOrders() {
        return purchaseOrderRepository.findByAutoTriggeredTrue();
    }

    public List<PurchaseOrder> getAllOrders() {
        return purchaseOrderRepository.findAll();
    }
}