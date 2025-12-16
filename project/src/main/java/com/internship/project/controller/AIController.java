package com.internship.project.controller;

import com.internship.project.service.SmartReplenishmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@CrossOrigin(origins = "http://localhost:3000")
public class AIController {

    @Autowired
    private SmartReplenishmentService smartReplenishmentService;

    @GetMapping("/replenishment-recommendation/{productId}")
    public ResponseEntity<?> getReplenishmentRecommendation(@PathVariable Long productId) {
        try {
            Map<String, Object> recommendation = smartReplenishmentService.getAIReplenishmentRecommendation(productId);
            return ResponseEntity.ok(recommendation);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error getting AI recommendation: " + e.getMessage());
        }
    }
}