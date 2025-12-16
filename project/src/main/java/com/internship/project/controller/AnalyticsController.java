// AnalyticsController.java
package com.internship.project.controller;

import com.internship.project.entity.User;
import com.internship.project.service.AnalyticsService;
import com.internship.project.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/analytics")
@CrossOrigin(origins = "http://localhost:3000")
public class AnalyticsController {

    @Autowired
    private AnalyticsService analyticsService;

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/dashboard")
    public ResponseEntity<?> getDashboardData(@RequestHeader("Authorization") String token) {

        try {
            // Extract user from token
            Long userId = extractUserIdFromToken(token);
            Optional<User> userOpt = userRepository.findById(userId);

            if (userOpt.isEmpty()) {
                return ResponseEntity.badRequest().body("User not found");
            }

            User user = userOpt.get();
            Map<String, Object> dashboardData;

            // Role-based dashboard data
            switch (user.getRole()) {
                case ADMIN:
                    dashboardData = analyticsService.getAdminDashboardData();
                    break;
                case STORE_MANAGER:
                    dashboardData = analyticsService.getStoreManagerDashboardData(
                            user.getAssignedWarehouse() != null ? user.getAssignedWarehouse() : "Main Warehouse");
                    break;
                case BUYER:
                    dashboardData = analyticsService.getBuyerDashboardData(userId);
                    break;
                case USER:
                default:
                    dashboardData = analyticsService.getUserDashboardData(userId);
                    break;
            }

            // Add user info to response
            dashboardData.put("userRole", user.getRole().toString());
            dashboardData.put("userName", user.getFullName());
            dashboardData.put("assignedWarehouse", user.getAssignedWarehouse());

            return ResponseEntity.ok(dashboardData);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error fetching dashboard data: " + e.getMessage());
        }
    }

    @GetMapping("/sales-trends")
    public ResponseEntity<?> getSalesTrends(
            @RequestHeader("Authorization") String token,
            @RequestParam(defaultValue = "MONTH") String period,
            @RequestParam(defaultValue = "ALL") String warehouse) {
        try {
            Long userId = extractUserIdFromToken(token);
            Optional<User> userOpt = userRepository.findById(userId);

            if (userOpt.isEmpty()) {
                return ResponseEntity.badRequest().body("User not found");
            }

            User user = userOpt.get();

            // Role-based warehouse filtering
            if (user.getRole() == User.Role.STORE_MANAGER && user.getAssignedWarehouse() != null) {
                warehouse = user.getAssignedWarehouse();
            }

            Map<String, Object> trendsData = analyticsService.getSalesTrends(period, warehouse);
            return ResponseEntity.ok(trendsData);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error fetching sales trends: " + e.getMessage());
        }
    }

    private Long extractUserIdFromToken(String token) {
        // Simplified token parsing - in real app, use JWT
        if (token.startsWith("auth-token-")) {
            return Long.parseLong(token.substring("auth-token-".length()));
        }
        throw new RuntimeException("Invalid token format");
    }
}