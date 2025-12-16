package com.internship.project.controller;

import com.internship.project.entity.User;
import com.internship.project.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:3000")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody User user) {
        try {
            // Check if email already exists
            if (userRepository.findByEmail(user.getEmail()).isPresent()) {
                return ResponseEntity.badRequest().body("Email already registered");
            }

            // Validate email format
            if (!user.getEmail().matches("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$")) {
                return ResponseEntity.badRequest().body("Invalid email format");
            }

            // Validate password
            if (user.getPassword().length() < 6) {
                return ResponseEntity.badRequest().body("Password must be at least 6 characters");
            }

            // Set default role if not provided
            if (user.getRole() == null) {
                user.setRole(User.Role.USER);
            }

            // Save new user
            User savedUser = userRepository.save(user);

            // Return user info without password
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Signup successful");
            response.put("user", Map.of(
                    "id", savedUser.getId(),
                    "email", savedUser.getEmail(),
                    "role", savedUser.getRole(),
                    "fullName", savedUser.getFullName(),
                    "assignedWarehouse", savedUser.getAssignedWarehouse()
            ));

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error during signup: " + e.getMessage());
        }
    }

    // Updated login method in AuthController.java
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User loginRequest) {
        Optional<User> existing = userRepository.findByEmail(loginRequest.getEmail());

        if (existing.isPresent() && existing.get().getPassword().equals(loginRequest.getPassword())) {
            User user = existing.get();

            // Create response with user details
            Map<String, Object> response = new HashMap<>();
            response.put("token", "auth-token-" + user.getId());
            response.put("user", Map.of(
                    "id", user.getId(),
                    "email", user.getEmail(),
                    "role", user.getRole().name(), // Use .name() for enum to string
                    "fullName", user.getFullName(),
                    "assignedWarehouse", user.getAssignedWarehouse(),
                    "companyName", user.getCompanyName()
            ));

            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid credentials!");
        }
    }

    // Get current user info
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@RequestHeader("Authorization") String token) {
        try {
            // Extract user ID from token (simplified for demo)
            Long userId = extractUserIdFromToken(token);
            Optional<User> user = userRepository.findById(userId);

            if (user.isPresent()) {
                User userData = user.get();
                Map<String, Object> response = new HashMap<>();
                response.put("user", Map.of(
                        "id", userData.getId(),
                        "email", userData.getEmail(),
                        "role", userData.getRole(),
                        "fullName", userData.getFullName(),
                        "assignedWarehouse", userData.getAssignedWarehouse(),
                        "companyName", userData.getCompanyName()
                ));
                return ResponseEntity.ok(response);
            }
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not found");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid token");
        }
    }

    private Long extractUserIdFromToken(String token) {
        // Simplified token parsing - in real app, use JWT
        if (token.startsWith("auth-token-")) {
            return Long.parseLong(token.substring("auth-token-".length()));
        }
        throw new RuntimeException("Invalid token format");
    }
    // Add these methods to your existing AuthController.java
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestParam String email) {
        try {
            System.out.println("Forgot password request for: " + email);

            Optional<User> userOpt = userRepository.findByEmail(email);

            if (userOpt.isPresent()) {
                User user = userOpt.get();

                // In a real application, you would:
                // 1. Generate a reset token
                // 2. Send email with reset link
                // 3. Store token in database with expiry

                // For simplicity, we'll just return a success message
                // In production, you should implement proper email sending

                System.out.println("Password reset requested for: " + email);

                return ResponseEntity.ok("Password reset instructions have been sent to your email.");
            } else {
                return ResponseEntity.badRequest().body("Email not found in our system.");
            }

        } catch (Exception e) {
            System.err.println("Forgot password error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error processing forgot password request: " + e.getMessage());
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(
            @RequestParam String email,
            @RequestParam String newPassword,
            @RequestParam String confirmPassword) {
        try {
            System.out.println("Reset password request for: " + email);

            // Validate passwords match
            if (!newPassword.equals(confirmPassword)) {
                return ResponseEntity.badRequest().body("Passwords do not match.");
            }

            // Validate password length
            if (newPassword.length() < 6) {
                return ResponseEntity.badRequest().body("Password must be at least 6 characters long.");
            }

            Optional<User> userOpt = userRepository.findByEmail(email);

            if (userOpt.isPresent()) {
                User user = userOpt.get();

                // Update password
                user.setPassword(newPassword);
                userRepository.save(user);

                System.out.println("Password reset successful for: " + email);

                return ResponseEntity.ok("Password has been reset successfully. You can now login with your new password.");
            } else {
                return ResponseEntity.badRequest().body("Email not found in our system.");
            }

        } catch (Exception e) {
            System.err.println("Reset password error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error resetting password: " + e.getMessage());
        }
    }
}