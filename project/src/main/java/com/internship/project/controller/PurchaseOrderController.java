package com.internship.project.controller;

import com.internship.project.entity.PurchaseOrder;
import com.internship.project.service.PurchaseOrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/purchase-orders")
@CrossOrigin(origins = "http://localhost:3000")
public class PurchaseOrderController {

    @Autowired
    private PurchaseOrderService purchaseOrderService;

    @PostMapping("/manual")
    public ResponseEntity<?> createManualOrder(
            @RequestParam Long productId,
            @RequestParam Long buyerId,
            @RequestParam int quantity,
            @RequestParam(required = false) String notes) {
        try {
            PurchaseOrder order = purchaseOrderService.createManualPurchaseOrder(productId, buyerId, quantity, notes);
            return ResponseEntity.ok(order);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/buyer/{buyerId}")
    public List<PurchaseOrder> getBuyerOrders(@PathVariable Long buyerId) {
        return purchaseOrderService.getBuyerOrders(buyerId);
    }

    @GetMapping("/pending")
    public List<PurchaseOrder> getPendingOrders() {
        return purchaseOrderService.getPendingOrders();
    }

    @PostMapping("/{orderId}/approve")
    public ResponseEntity<?> approveOrder(@PathVariable Long orderId) {
        try {
            PurchaseOrder order = purchaseOrderService.approveOrder(orderId);
            return ResponseEntity.ok(order);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/{orderId}/complete")
    public ResponseEntity<?> completeOrder(@PathVariable Long orderId) {
        try {
            PurchaseOrder order = purchaseOrderService.completeOrder(orderId);
            return ResponseEntity.ok(order);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error completing order: " + e.getMessage());
        }
    }

    @GetMapping("/auto-triggered")
    public List<PurchaseOrder> getAutoTriggeredOrders() {
        return purchaseOrderService.getAutoTriggeredOrders();
    }
}