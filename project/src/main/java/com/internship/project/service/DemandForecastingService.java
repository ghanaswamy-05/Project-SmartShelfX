package com.internship.project.service;

import com.internship.project.entity.Product;
import com.internship.project.entity.SalesRecord;
import com.internship.project.repository.ProductRepository;
import com.internship.project.repository.SalesRecordRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class DemandForecastingService {

    @Autowired
    private SalesRecordRepository salesRecordRepository;

    @Autowired
    private ProductRepository productRepository;

    /**
     * Get demand forecast for all products
     */
    public Map<String, Object> getDemandForecast(int daysToForecast) {
        Map<String, Object> forecastData = new HashMap<>();

        List<Product> products = productRepository.findAll();
        List<Map<String, Object>> productForecasts = new ArrayList<>();

        for (Product product : products) {
            Map<String, Object> productForecast = forecastProductDemand(product, daysToForecast);
            productForecasts.add(productForecast);
        }

        // Sort by risk level (HIGH -> MEDIUM -> LOW)
        productForecasts.sort((a, b) -> {
            String riskA = (String) a.get("riskLevel");
            String riskB = (String) b.get("riskLevel");
            return getRiskPriority(riskB) - getRiskPriority(riskA);
        });

        forecastData.put("productForecasts", productForecasts);
        forecastData.put("forecastPeriod", daysToForecast + " days");
        forecastData.put("generatedAt", LocalDateTime.now());
        forecastData.put("totalProducts", products.size());
        forecastData.put("highRiskCount", productForecasts.stream()
                .filter(p -> "HIGH".equals(p.get("riskLevel")))
                .count());
        forecastData.put("mediumRiskCount", productForecasts.stream()
                .filter(p -> "MEDIUM".equals(p.get("riskLevel")))
                .count());

        return forecastData;
    }

    /**
     * Forecast demand for a single product
     */
    private Map<String, Object> forecastProductDemand(Product product, int daysToForecast) {
        Map<String, Object> forecast = new HashMap<>();

        // Get sales data for the last 90 days
        LocalDateTime startDate = LocalDateTime.now().minusDays(90);
        List<SalesRecord> salesHistory = salesRecordRepository.findByProductIdAndSaleDateAfter(
                product.getId(), startDate);

        // Calculate metrics
        double avgDailySales = calculateAverageDailySales(salesHistory);
        double salesTrend = calculateSalesTrend(salesHistory);
        int daysOfStockLeft = calculateDaysOfStockLeft(product, avgDailySales);
        int forecastedDemand = calculateForecastedDemand(avgDailySales, salesTrend, daysToForecast);
        String riskLevel = assessStockoutRisk(product, daysOfStockLeft, forecastedDemand);
        String recommendedAction = getRecommendedAction(riskLevel, forecastedDemand, product);

        forecast.put("productId", product.getId());
        forecast.put("productName", product.getName());
        forecast.put("currentStock", product.getQuantity());
        forecast.put("reorderThreshold", product.getReorderThreshold());
        forecast.put("avgDailySales", Math.round(avgDailySales * 100.0) / 100.0);
        forecast.put("salesTrend", Math.round(salesTrend * 100.0) / 100.0);
        forecast.put("daysOfStockLeft", daysOfStockLeft);
        forecast.put("forecastedDemand", forecastedDemand);
        forecast.put("riskLevel", riskLevel);
        forecast.put("recommendedAction", recommendedAction);
        forecast.put("forecastChart", generateForecastChartData(avgDailySales, salesTrend, daysToForecast));

        return forecast;
    }

    /**
     * Calculate average daily sales
     */
    private double calculateAverageDailySales(List<SalesRecord> salesHistory) {
        if (salesHistory.isEmpty()) return 0.0;

        // Filter only sales (not returns or shipments)
        List<SalesRecord> salesOnly = salesHistory.stream()
                .filter(s -> "SALE".equals(s.getTransactionType()))
                .collect(Collectors.toList());

        if (salesOnly.isEmpty()) return 0.0;

        int totalSold = salesOnly.stream()
                .mapToInt(SalesRecord::getQuantitySold)
                .sum();

        // Calculate days between first and last sale
        long daysBetween = ChronoUnit.DAYS.between(
                salesOnly.get(salesOnly.size() - 1).getSaleDate().toLocalDate(),
                salesOnly.get(0).getSaleDate().toLocalDate()
        );

        return daysBetween > 0 ? (double) totalSold / daysBetween : totalSold;
    }

    /**
     * Calculate sales trend (positive = increasing, negative = decreasing)
     */
    private double calculateSalesTrend(List<SalesRecord> salesHistory) {
        if (salesHistory.size() < 2) return 0.0;

        // Split data into two periods and compare
        int midPoint = salesHistory.size() / 2;
        double firstPeriodAvg = salesHistory.subList(0, midPoint).stream()
                .filter(s -> "SALE".equals(s.getTransactionType()))
                .mapToInt(SalesRecord::getQuantitySold)
                .average().orElse(0.0);

        double secondPeriodAvg = salesHistory.subList(midPoint, salesHistory.size()).stream()
                .filter(s -> "SALE".equals(s.getTransactionType()))
                .mapToInt(SalesRecord::getQuantitySold)
                .average().orElse(0.0);

        return firstPeriodAvg > 0 ? ((secondPeriodAvg - firstPeriodAvg) / firstPeriodAvg) * 100 : 0.0;
    }

    /**
     * Calculate how many days of stock are left
     */
    private int calculateDaysOfStockLeft(Product product, double avgDailySales) {
        if (avgDailySales <= 0) return Integer.MAX_VALUE;
        return (int) (product.getQuantity() / avgDailySales);
    }

    /**
     * Calculate forecasted demand
     */
    private int calculateForecastedDemand(double avgDailySales, double salesTrend, int daysToForecast) {
        // Apply trend to forecast
        double trendFactor = 1 + (salesTrend / 100.0);
        double forecastedDailySales = avgDailySales * trendFactor;

        return (int) Math.ceil(forecastedDailySales * daysToForecast);
    }

    /**
     * Assess stockout risk
     */
    private String assessStockoutRisk(Product product, int daysOfStockLeft, int forecastedDemand) {
        if (product.getQuantity() <= 0) return "CRITICAL";
        if (daysOfStockLeft <= 3) return "HIGH";
        if (daysOfStockLeft <= 7) return "MEDIUM";
        if (daysOfStockLeft <= product.getReorderThreshold()) return "LOW";
        return "SAFE";
    }

    /**
     * Get recommended action based on risk level
     */
    private String getRecommendedAction(String riskLevel, int forecastedDemand, Product product) {
        switch (riskLevel) {
            case "CRITICAL":
                return "URGENT: Order " + Math.max(forecastedDemand * 2, product.getReorderThreshold() + 20) + " units immediately";
            case "HIGH":
                return "Order " + Math.max(forecastedDemand, product.getReorderThreshold() + 15) + " units within 24 hours";
            case "MEDIUM":
                return "Order " + Math.max(forecastedDemand, product.getReorderThreshold() + 10) + " units this week";
            case "LOW":
                return "Monitor stock - consider ordering " + forecastedDemand + " units";
            default:
                return "Stock levels adequate";
        }
    }

    /**
     * Generate chart data for forecast visualization
     */
    private Map<String, Object> generateForecastChartData(double avgDailySales, double salesTrend, int daysToForecast) {
        Map<String, Object> chartData = new HashMap<>();
        List<Map<String, Object>> dataPoints = new ArrayList<>();

        double dailySales = avgDailySales;
        for (int day = 1; day <= daysToForecast; day++) {
            Map<String, Object> point = new HashMap<>();
            point.put("day", day);
            point.put("projectedSales", Math.round(dailySales * 100.0) / 100.0);
            dataPoints.add(point);

            // Apply trend for next day
            dailySales *= (1 + (salesTrend / 100.0 / daysToForecast));
        }

        chartData.put("dataPoints", dataPoints);
        chartData.put("trend", salesTrend);
        return chartData;
    }

    private int getRiskPriority(String riskLevel) {
        switch (riskLevel) {
            case "CRITICAL": return 4;
            case "HIGH": return 3;
            case "MEDIUM": return 2;
            case "LOW": return 1;
            default: return 0;
        }
    }

    /**
     * Get fast-moving products (best sellers)
     */
    public List<Map<String, Object>> getFastMovingProducts(int days) {
        LocalDateTime startDate = LocalDateTime.now().minusDays(days);
        List<SalesRecord> recentSales = salesRecordRepository.findBySaleDateAfterAndTransactionType(
                startDate, "SALE");

        // Group by product and sum quantities
        Map<Product, Integer> productSales = recentSales.stream()
                .collect(Collectors.groupingBy(
                        SalesRecord::getProduct,
                        Collectors.summingInt(SalesRecord::getQuantitySold)
                ));

        return productSales.entrySet().stream()
                .sorted((e1, e2) -> e2.getValue().compareTo(e1.getValue()))
                .limit(10)
                .map(entry -> {
                    Map<String, Object> productData = new HashMap<>();
                    Product product = entry.getKey();
                    productData.put("productId", product.getId());
                    productData.put("productName", product.getName());
                    productData.put("unitsSold", entry.getValue());
                    productData.put("currentStock", product.getQuantity());
                    productData.put("revenue", entry.getValue() * product.getPrice());
                    return productData;
                })
                .collect(Collectors.toList());
    }
}