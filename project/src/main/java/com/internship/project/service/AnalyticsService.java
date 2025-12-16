// AnalyticsService.java - Fixed version
package com.internship.project.service;

import com.internship.project.entity.Product;
import com.internship.project.entity.PurchaseOrder;
import com.internship.project.entity.SalesRecord;
import com.internship.project.repository.ProductRepository;
import com.internship.project.repository.PurchaseOrderRepository;
import com.internship.project.repository.SalesRecordRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AnalyticsService {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private SalesRecordRepository salesRecordRepository;
    @Autowired
    private PurchaseOrderRepository purchaseOrderRepository;

    public Map<String, Object> getUserDashboardData(Long userId) {
        Map<String, Object> dashboard = new HashMap<>();

        List<Product> products = productRepository.findAll();

        // Real data calculations
        long totalProducts = products.size();
        long lowStockProducts = products.stream()
                .filter(p -> p.getQuantity() <= p.getReorderThreshold() && p.getQuantity() > 0)
                .count();
        long outOfStockProducts = products.stream()
                .filter(p -> p.getQuantity() == 0)
                .count();

        dashboard.put("totalProducts", totalProducts);
        dashboard.put("lowStockProducts", lowStockProducts);
        dashboard.put("outOfStockProducts", outOfStockProducts);

        // Recent products added
        List<Map<String, Object>> recentProducts = products.stream()
                .sorted((p1, p2) -> p2.getId().compareTo(p1.getId())) // Sort by ID descending (newest first)
                .limit(5)
                .map(p -> {
                    Map<String, Object> productMap = new HashMap<>();
                    productMap.put("id", p.getId());
                    productMap.put("name", p.getName());
                    productMap.put("quantity", p.getQuantity());
                    productMap.put("price", p.getPrice());
                    productMap.put("imageFileName", p.getImageFileName());
                    return productMap;
                })
                .collect(Collectors.toList());

        dashboard.put("recentProducts", recentProducts);

        return dashboard;
    }

    public Map<String, Object> getStoreManagerDashboardData(String warehouse) {
        Map<String, Object> dashboard = new HashMap<>();

        List<Product> products = productRepository.findAll();
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        LocalDateTime endOfDay = LocalDate.now().atTime(LocalTime.MAX);

        dashboard.put("warehouse", warehouse);
        dashboard.put("totalProducts", products.size());

        // Real daily turnover from sales records
        List<SalesRecord> todaySales = salesRecordRepository.findByWarehouseLocationAndSaleDateBetween(
                warehouse, startOfDay, endOfDay);

        double dailyTurnover = todaySales.stream()
                .filter(sale -> "SALE".equals(sale.getTransactionType()))
                .mapToDouble(SalesRecord::getTotalAmount)
                .sum();
        dashboard.put("dailyTurnover", dailyTurnover);

        // Real stock alerts
        long lowStockAlerts = products.stream()
                .filter(p -> p.getQuantity() <= p.getReorderThreshold())
                .count();
        dashboard.put("lowStockAlerts", lowStockAlerts);

        // Fast moving products (last 7 days)
        LocalDateTime weekAgo = LocalDateTime.now().minusDays(7);
        List<Map<String, Object>> fastMovingProducts = getFastMovingProducts(weekAgo, warehouse);
        dashboard.put("fastMovingProducts", fastMovingProducts);

        // Additional real metrics
        dashboard.put("todaySalesCount", todaySales.size());
        dashboard.put("totalItemsSoldToday", todaySales.stream()
                .filter(sale -> "SALE".equals(sale.getTransactionType()))
                .mapToInt(SalesRecord::getQuantitySold)
                .sum());

        // Warehouse performance metrics
        double totalInventoryValue = products.stream()
                .mapToDouble(p -> p.getPrice() * p.getQuantity())
                .sum();
        dashboard.put("totalInventoryValue", totalInventoryValue);

        return dashboard;
    }

    public Map<String, Object> getAdminDashboardData() {
        Map<String, Object> dashboard = new HashMap<>();

        List<Product> products = productRepository.findAll();
        LocalDateTime monthAgo = LocalDateTime.now().minusDays(30);

        // Overall analytics with real data
        dashboard.put("totalProducts", products.size());

        double totalInventoryValue = products.stream()
                .mapToDouble(p -> p.getPrice() * p.getQuantity())
                .sum();
        dashboard.put("totalInventoryValue", totalInventoryValue);

        // Real warehouse analysis
        List<Map<String, Object>> warehouseAnalysis = getWarehouseAnalysis(monthAgo);
        dashboard.put("warehouseAnalysis", warehouseAnalysis);

        // Real category performance
        Map<String, Double> categoryPerformance = getCategoryPerformance(monthAgo);
        dashboard.put("categoryPerformance", categoryPerformance);

        // Real top products (last 30 days)
        List<Map<String, Object>> topProducts = getFastMovingProducts(monthAgo, "ALL");
        List<Map<String, Object>> top10Products = topProducts.stream()
                .limit(10)
                .collect(Collectors.toList());
        dashboard.put("topProducts", top10Products);

        // Additional admin metrics
        double totalRevenueLastMonth = warehouseAnalysis.stream()
                .mapToDouble(w -> (Double) w.get("totalRevenue"))
                .sum();
        dashboard.put("totalRevenueLastMonth", totalRevenueLastMonth);

        long totalTransactionsLastMonth = warehouseAnalysis.stream()
                .mapToLong(w -> (Long) w.get("totalTransactions"))
                .sum();
        dashboard.put("totalTransactionsLastMonth", totalTransactionsLastMonth);

        // System overview
        dashboard.put("totalLowStockItems", products.stream()
                .filter(p -> p.getQuantity() <= p.getReorderThreshold() && p.getQuantity() > 0)
                .count());
        dashboard.put("totalOutOfStockItems", products.stream()
                .filter(p -> p.getQuantity() == 0)
                .count());

        return dashboard;
    }

    private List<Map<String, Object>> getFastMovingProducts(LocalDateTime startDate, String warehouse) {
        List<SalesRecord> salesData;
        if ("ALL".equals(warehouse)) {
            salesData = salesRecordRepository.findBySaleDateBetween(startDate, LocalDateTime.now());
        } else {
            salesData = salesRecordRepository.findByWarehouseLocationAndSaleDateBetween(
                    warehouse, startDate, LocalDateTime.now());
        }

        // Group by product and calculate sales
        Map<Product, Integer> productSales = salesData.stream()
                .filter(sale -> "SALE".equals(sale.getTransactionType()))
                .collect(Collectors.groupingBy(
                        SalesRecord::getProduct,
                        Collectors.summingInt(SalesRecord::getQuantitySold)
                ));

        return productSales.entrySet().stream()
                .sorted((e1, e2) -> Integer.compare(e2.getValue(), e1.getValue())) // Sort by sales descending
                .limit(5)
                .map(entry -> {
                    Product product = entry.getKey();
                    int sales = entry.getValue();
                    double revenue = sales * product.getPrice();

                    Map<String, Object> productMap = new HashMap<>();
                    productMap.put("name", product.getName());
                    productMap.put("sales", sales);
                    productMap.put("revenue", revenue);
                    productMap.put("currentStock", product.getQuantity());
                    productMap.put("warehouse", "Multiple");

                    return productMap;
                })
                .collect(Collectors.toList());
    }

    private List<Map<String, Object>> getWarehouseAnalysis(LocalDateTime startDate) {
        List<SalesRecord> salesData = salesRecordRepository.findBySaleDateBetween(startDate, LocalDateTime.now());

        // Group by warehouse
        Map<String, List<SalesRecord>> salesByWarehouse = salesData.stream()
                .filter(sale -> "SALE".equals(sale.getTransactionType()))
                .collect(Collectors.groupingBy(SalesRecord::getWarehouseLocation));

        List<Map<String, Object>> warehouseAnalysis = new ArrayList<>();

        for (Map.Entry<String, List<SalesRecord>> entry : salesByWarehouse.entrySet()) {
            String warehouse = entry.getKey();
            List<SalesRecord> warehouseSales = entry.getValue();

            double totalRevenue = warehouseSales.stream()
                    .mapToDouble(SalesRecord::getTotalAmount)
                    .sum();

            long totalTransactions = warehouseSales.size();

            // Count products in this warehouse
            long productCount = productRepository.findAll().size(); // Simplified

            Map<String, Object> warehouseData = new HashMap<>();
            warehouseData.put("warehouse", warehouse);
            warehouseData.put("totalRevenue", totalRevenue);
            warehouseData.put("totalTransactions", totalTransactions);
            warehouseData.put("productCount", productCount);

            warehouseAnalysis.add(warehouseData);
        }

        // If no warehouse data, return default warehouses
        if (warehouseAnalysis.isEmpty()) {
            Map<String, Object> mainWarehouse = new HashMap<>();
            mainWarehouse.put("warehouse", "Main Warehouse");
            mainWarehouse.put("totalRevenue", 0.0);
            mainWarehouse.put("totalTransactions", 0L);
            mainWarehouse.put("productCount", 0L);

            Map<String, Object> eastWarehouse = new HashMap<>();
            eastWarehouse.put("warehouse", "East Warehouse");
            eastWarehouse.put("totalRevenue", 0.0);
            eastWarehouse.put("totalTransactions", 0L);
            eastWarehouse.put("productCount", 0L);

            Map<String, Object> westWarehouse = new HashMap<>();
            westWarehouse.put("warehouse", "West Warehouse");
            westWarehouse.put("totalRevenue", 0.0);
            westWarehouse.put("totalTransactions", 0L);
            westWarehouse.put("productCount", 0L);

            return Arrays.asList(mainWarehouse, eastWarehouse, westWarehouse);
        }

        return warehouseAnalysis;
    }

    private Map<String, Double> getCategoryPerformance(LocalDateTime startDate) {
        List<SalesRecord> salesData = salesRecordRepository.findBySaleDateBetween(startDate, LocalDateTime.now());

        Map<String, Double> categoryRevenue = salesData.stream()
                .filter(sale -> "SALE".equals(sale.getTransactionType()))
                .collect(Collectors.groupingBy(
                        sale -> getProductCategory(sale.getProduct().getName()),
                        Collectors.summingDouble(SalesRecord::getTotalAmount)
                ));

        // Ensure all categories are present
        String[] categories = {"Electronics", "Clothing", "Food", "Home", "Other"};
        for (String category : categories) {
            categoryRevenue.putIfAbsent(category, 0.0);
        }

        return categoryRevenue;
    }

    private String getProductCategory(String productName) {
        if (productName == null) return "Other";

        String lowerName = productName.toLowerCase();
        if (lowerName.contains("laptop") || lowerName.contains("computer") ||
                lowerName.contains("phone") || lowerName.contains("tablet")) {
            return "Electronics";
        } else if (lowerName.contains("shirt") || lowerName.contains("pant") ||
                lowerName.contains("dress") || lowerName.contains("shoe")) {
            return "Clothing";
        } else if (lowerName.contains("food") || lowerName.contains("fruit") ||
                lowerName.contains("vegetable") || lowerName.contains("snack")) {
            return "Food";
        } else if (lowerName.contains("furniture") || lowerName.contains("home") ||
                lowerName.contains("decor")) {
            return "Home";
        } else {
            return "Other";
        }
    }

    // Helper method to get sales trends
    public Map<String, Object> getSalesTrends(String period, String warehouse) {
        Map<String, Object> trends = new HashMap<>();
        LocalDateTime startDate = getStartDateForPeriod(period);

        List<SalesRecord> salesData = getSalesData(startDate, warehouse);

        // Daily revenue trend
        Map<LocalDate, Double> dailyRevenue = salesData.stream()
                .filter(sale -> "SALE".equals(sale.getTransactionType()))
                .collect(Collectors.groupingBy(
                        sale -> sale.getSaleDate().toLocalDate(),
                        Collectors.summingDouble(SalesRecord::getTotalAmount)
                ));

        trends.put("dailyRevenue", dailyRevenue);
        trends.put("totalSales", salesData.size());
        trends.put("totalRevenue", dailyRevenue.values().stream().mapToDouble(Double::doubleValue).sum());

        return trends;
    }

    private LocalDateTime getStartDateForPeriod(String period) {
        switch (period.toUpperCase()) {
            case "WEEK": return LocalDateTime.now().minusDays(7);
            case "MONTH": return LocalDateTime.now().minusDays(30);
            case "QUARTER": return LocalDateTime.now().minusDays(90);
            default: return LocalDateTime.now().minusDays(30);
        }
    }

    private List<SalesRecord> getSalesData(LocalDateTime startDate, String warehouse) {
        if ("ALL".equals(warehouse)) {
            return salesRecordRepository.findBySaleDateBetween(startDate, LocalDateTime.now());
        } else {
            return salesRecordRepository.findByWarehouseLocationAndSaleDateBetween(
                    warehouse, startDate, LocalDateTime.now());
        }
    }
    public Map<String, Object> getBuyerDashboardData(Long buyerId) {
        Map<String, Object> dashboard = new HashMap<>();

        List<PurchaseOrder> buyerOrders = purchaseOrderRepository.findByBuyerId(buyerId);

        long totalOrders = buyerOrders.size();
        long pendingOrders = buyerOrders.stream().filter(o -> "PENDING".equals(o.getStatus())).count();
        long completedOrders = buyerOrders.stream().filter(o -> "COMPLETED".equals(o.getStatus())).count();

        double totalSpent = buyerOrders.stream()
                .filter(o -> "COMPLETED".equals(o.getStatus()))
                .mapToDouble(PurchaseOrder::getTotalAmount)
                .sum();

        dashboard.put("totalOrders", totalOrders);
        dashboard.put("pendingOrders", pendingOrders);
        dashboard.put("completedOrders", completedOrders);
        dashboard.put("totalSpent", totalSpent);
        dashboard.put("recentOrders", buyerOrders.stream()
                .sorted((o1, o2) -> o2.getOrderDate().compareTo(o1.getOrderDate()))
                .limit(5)
                .collect(Collectors.toList()));

        return dashboard;
    }
}