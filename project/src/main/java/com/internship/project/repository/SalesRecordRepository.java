// SalesRecordRepository.java
package com.internship.project.repository;

import com.internship.project.entity.SalesRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Repository
public interface SalesRecordRepository extends JpaRepository<SalesRecord, Long> {

    // Find sales by warehouse
    List<SalesRecord> findByWarehouseLocation(String warehouseLocation);

    // Find sales by date range
    List<SalesRecord> findBySaleDateBetween(LocalDateTime startDate, LocalDateTime endDate);

    // Find sales by warehouse and date range
    List<SalesRecord> findByWarehouseLocationAndSaleDateBetween(
            String warehouseLocation, LocalDateTime startDate, LocalDateTime endDate);

    // Find sales by product
    List<SalesRecord> findByProductId(Long productId);

    // Get daily sales summary
    @Query("SELECT new map(s.product.name as productName, SUM(s.quantitySold) as totalSold, " +
            "SUM(s.totalAmount) as totalRevenue) " +
            "FROM SalesRecord s " +
            "WHERE s.saleDate >= :startDate AND s.saleDate < :endDate " +
            "AND s.transactionType = 'SALE' " +
            "GROUP BY s.product.id, s.product.name " +
            "ORDER BY totalSold DESC")
    List<Map<String, Object>> findDailySalesSummary(@Param("startDate") LocalDateTime startDate,
                                                    @Param("endDate") LocalDateTime endDate);

    // Get warehouse sales summary
    @Query("SELECT new map(s.warehouseLocation as warehouse, SUM(s.totalAmount) as totalRevenue, " +
            "COUNT(s.id) as totalTransactions) " +
            "FROM SalesRecord s " +
            "WHERE s.saleDate >= :startDate AND s.transactionType = 'SALE' " +
            "GROUP BY s.warehouseLocation " +
            "ORDER BY totalRevenue DESC")
    List<Map<String, Object>> findWarehouseSalesSummary(@Param("startDate") LocalDateTime startDate);

    // Get fast moving products
    @Query("SELECT new map(s.product.id as productId, s.product.name as productName, " +
            "SUM(s.quantitySold) as totalSold, SUM(s.totalAmount) as totalRevenue, " +
            "s.product.quantity as currentStock) " +
            "FROM SalesRecord s " +
            "WHERE s.saleDate >= :startDate AND s.transactionType = 'SALE' " +
            "GROUP BY s.product.id, s.product.name, s.product.quantity " +
            "ORDER BY totalSold DESC")
    List<Map<String, Object>> findFastMovingProducts(@Param("startDate") LocalDateTime startDate);

    // Get category performance
    @Query("SELECT new map(" +
            "CASE " +
            "WHEN p.name LIKE '%laptop%' OR p.name LIKE '%computer%' THEN 'Computers' " +
            "WHEN p.name LIKE '%phone%' OR p.name LIKE '%mobile%' THEN 'Mobile Devices' " +
            "WHEN p.name LIKE '%tablet%' THEN 'Tablets' " +
            "WHEN p.name LIKE '%headphone%' OR p.name LIKE '%earphone%' THEN 'Audio' " +
            "ELSE 'Other' " +
            "END as category, " +
            "SUM(s.totalAmount) as totalRevenue, COUNT(s.id) as salesCount) " +
            "FROM SalesRecord s JOIN s.product p " +
            "WHERE s.saleDate >= :startDate AND s.transactionType = 'SALE' " +
            "GROUP BY category " +
            "ORDER BY totalRevenue DESC")

    List<Map<String, Object>> findCategoryPerformance(@Param("startDate") LocalDateTime startDate);
    // Add to SalesRecordRepository.java
    List<SalesRecord> findByProductIdAndSaleDateAfter(Long productId, LocalDateTime date);
    List<SalesRecord> findBySaleDateAfterAndTransactionType(LocalDateTime date, String transactionType);
}
