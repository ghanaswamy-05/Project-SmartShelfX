// SalesRecordController.java (Updated)
package com.internship.project.controller;

import com.internship.project.entity.SalesRecord;
import com.internship.project.service.SalesRecordService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/transactions") // Renamed mapping for general transactions
@CrossOrigin(origins = "http://localhost:3000")
public class SalesRecordController {

    @Autowired
    private SalesRecordService salesRecordService;

    /**
     * Endpoint to record an incoming shipment (Stock-In).
     * Maps to salesRecordService.recordStockInShipment
     */
    @PostMapping("/shipment")
    public ResponseEntity<?> recordShipment(
            @RequestParam Long productId,
            @RequestParam int quantity,
            @RequestParam String warehouseLocation,
            @RequestParam String handlerName) { // New required parameter
        try {
            SalesRecord shipmentRecord = salesRecordService.recordStockInShipment(productId, quantity, warehouseLocation, handlerName);
            return ResponseEntity.ok(shipmentRecord);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error recording shipment: " + e.getMessage());
        }
    }

    /**
     * Endpoint to record an outgoing sale (Stock-Out).
     * Maps to salesRecordService.recordStockOut
     */
    @PostMapping("/sale")
    public ResponseEntity<?> recordSale(
            @RequestParam Long productId,
            @RequestParam int quantity,
            @RequestParam String warehouseLocation,
            @RequestParam String handlerName) { // New required parameter
        try {
            // Renamed from recordSale to recordStockOut
            SalesRecord salesRecord = salesRecordService.recordStockOut(productId, quantity, warehouseLocation, handlerName);
            return ResponseEntity.ok(salesRecord);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error recording sale: " + e.getMessage());
        }
    }

    /**
     * Endpoint to record a product return (Stock-In).
     * Maps to salesRecordService.recordStockInReturn
     */
    @PostMapping("/return")
    public ResponseEntity<?> recordReturn(
            @RequestParam Long productId,
            @RequestParam int quantity,
            @RequestParam String warehouseLocation,
            @RequestParam String handlerName) { // New required parameter
        try {
            // Renamed from recordReturn to recordStockInReturn
            SalesRecord returnRecord = salesRecordService.recordStockInReturn(productId, quantity, warehouseLocation, handlerName);
            return ResponseEntity.ok(returnRecord);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error recording return: " + e.getMessage());
        }
    }

    /**
     * Endpoint to fetch all transactions (sales, shipments, returns).
     * Maps to salesRecordService.getAllTransactions
     */
    @GetMapping
    public List<SalesRecord> getAllTransactions() {
        // Renamed from getAllSales to getAllTransactions
        return salesRecordService.getAllTransactions();
    }

    /**
     * Endpoint to fetch transactions filtered by warehouse location.
     * Maps to salesRecordService.getTransactionsByWarehouse
     */
    @GetMapping("/warehouse/{warehouse}")
    public List<SalesRecord> getTransactionsByWarehouse(@PathVariable("warehouse") String warehouse) {
        // Renamed from getSalesByWarehouse to getTransactionsByWarehouse
        return salesRecordService.getTransactionsByWarehouse(warehouse);
    }
}