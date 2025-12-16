package com.internship.project.controller;

import com.internship.project.service.DemandForecastingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/forecast")
@CrossOrigin(origins = "http://localhost:3000")
public class DemandForecastController {

    @Autowired
    private DemandForecastingService demandForecastingService;

    @GetMapping("/demand")
    public ResponseEntity<?> getDemandForecast(
            @RequestParam(defaultValue = "30") int days) {
        try {
            Map<String, Object> forecastData = demandForecastingService.getDemandForecast(days);
            return ResponseEntity.ok(forecastData);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error generating forecast: " + e.getMessage());
        }
    }

    @GetMapping("/fast-moving")
    public ResponseEntity<?> getFastMovingProducts(
            @RequestParam(defaultValue = "30") int days) {
        try {
            return ResponseEntity.ok(demandForecastingService.getFastMovingProducts(days));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error getting fast-moving products: " + e.getMessage());
        }
    }

    @GetMapping("/stockout-risk")
    public ResponseEntity<?> getStockoutRisk() {
        try {
            Map<String, Object> forecastData = demandForecastingService.getDemandForecast(14);
            // Filter only high and critical risk products
            forecastData.put("highRiskProducts",
                    ((java.util.List<?>) forecastData.get("productForecasts")).stream()
                            .filter(p -> {
                                Map<?, ?> product = (Map<?, ?>) p;
                                String risk = (String) product.get("riskLevel");
                                return "HIGH".equals(risk) || "CRITICAL".equals(risk);
                            })
                            .collect(java.util.stream.Collectors.toList())
            );
            return ResponseEntity.ok(forecastData);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error analyzing stockout risk: " + e.getMessage());
        }
    }
}