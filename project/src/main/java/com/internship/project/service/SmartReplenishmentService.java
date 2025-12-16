package com.internship.project.service;

import com.internship.project.entity.Product;
import com.internship.project.entity.PurchaseOrder;
import com.internship.project.entity.SalesRecord;
import com.internship.project.entity.User;
import com.internship.project.repository.ProductRepository;
import com.internship.project.repository.PurchaseOrderRepository;
import com.internship.project.repository.SalesRecordRepository;
import com.internship.project.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
public class SmartReplenishmentService {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private SalesRecordRepository salesRecordRepository;

    @Autowired
    private PurchaseOrderRepository purchaseOrderRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SalesRecordService salesRecordService;

    @Autowired
    private GeminiAIService geminiAIService;

    public Map<String, Object> getAIReplenishmentRecommendation(Long productId) {
        Optional<Product> productOpt = productRepository.findById(productId);

        if (productOpt.isPresent()) {
            Product product = productOpt.get();

            // Get sales data for the product
            List<SalesRecord> recentSales = salesRecordRepository.findByProductId(productId);

            // Prepare context for AI
            String context = buildAIContext(product, recentSales);

            // Get AI recommendation from Gemini
            String aiResponse = geminiAIService.getAIRecommendation(context);

            return parseAIResponse(aiResponse, product);
        }

        throw new IllegalArgumentException("Product not found");
    }

    private String buildAIContext(Product product, List<SalesRecord> sales) {
        StringBuilder context = new StringBuilder();
        context.append("INVENTORY REPLENISHMENT ANALYSIS REQUEST\n\n");
        context.append("PRODUCT DATA:\n");
        context.append("- Product: ").append(product.getName()).append("\n");
        context.append("- Current Stock: ").append(product.getQuantity()).append(" units\n");
        context.append("- Reorder Threshold: ").append(product.getReorderThreshold()).append(" units\n");
        context.append("- Price: $").append(String.format("%.2f", product.getPrice())).append("\n");

        // Sales analysis
        if (!sales.isEmpty()) {
            double avgDailySales = sales.stream()
                    .mapToInt(SalesRecord::getQuantitySold)
                    .average()
                    .orElse(0.0);
            context.append("- Average Daily Sales: ").append(String.format("%.2f", avgDailySales)).append(" units/day\n");

            int stockCoverageDays = avgDailySales > 0 ? (int)(product.getQuantity() / avgDailySales) : Integer.MAX_VALUE;
            context.append("- Current Stock Coverage: ").append(stockCoverageDays).append(" days\n");
        }

        context.append("\nRESPONSE FORMAT (use exactly this format):\n");
        context.append("QUANTITY: [number between 10-300]\n");
        context.append("URGENCY: [CRITICAL/HIGH/MEDIUM/LOW]\n");
        context.append("REASON: [brief explanation]\n");

        return context.toString();
    }

    private Map<String, Object> parseAIResponse(String aiResponse, Product product) {
        Map<String, Object> recommendation = new HashMap<>();

        recommendation.put("productId", product.getId());
        recommendation.put("productName", product.getName());
        recommendation.put("currentStock", product.getQuantity());
        recommendation.put("threshold", product.getReorderThreshold());
        recommendation.put("aiRawResponse", aiResponse);
        recommendation.put("timestamp", LocalDateTime.now());

        // Parse the AI response
        int recommendedQuantity = parseRecommendedQuantity(aiResponse, product);
        String urgencyLevel = parseUrgencyLevel(aiResponse);
        String reasoning = parseReasoning(aiResponse);

        recommendation.put("recommendedQuantity", recommendedQuantity);
        recommendation.put("urgencyLevel", urgencyLevel);
        recommendation.put("reasoning", reasoning);

        // Auto-execute if confidence is high
        if ("HIGH".equals(urgencyLevel) || "CRITICAL".equals(urgencyLevel) ||
                product.getQuantity() <= (product.getReorderThreshold() - 2)) {

            boolean triggered = triggerSmartReplenishment(product, recommendedQuantity, urgencyLevel, reasoning);
            recommendation.put("autoTriggered", triggered);
            recommendation.put("autoTriggerMessage", triggered ?
                    "Auto-replenishment triggered successfully" :
                    "Auto-replenishment failed - no buyer available");
        } else {
            recommendation.put("autoTriggered", false);
            recommendation.put("autoTriggerMessage", "Manual review recommended");
        }

        return recommendation;
    }

    private int parseRecommendedQuantity(String aiResponse, Product product) {
        try {
            // Method 1: Look for "QUANTITY:" pattern (exact format we requested)
            if (aiResponse.contains("QUANTITY:")) {
                String[] parts = aiResponse.split("QUANTITY:");
                if (parts.length > 1) {
                    String quantityPart = parts[1].split("[\\n|]")[0].trim();
                    String numberOnly = quantityPart.replaceAll("[^0-9]", "").trim();
                    if (!numberOnly.isEmpty()) {
                        int quantity = Integer.parseInt(numberOnly);
                        if (quantity > 0 && quantity <= 1000) {
                            return quantity;
                        }
                    }
                }
            }

            // Method 2: Look for "Quantity:" pattern (case insensitive)
            Pattern quantityPattern = Pattern.compile("Quantity:\\s*(\\d+)", Pattern.CASE_INSENSITIVE);
            Matcher matcher = quantityPattern.matcher(aiResponse);
            if (matcher.find()) {
                int quantity = Integer.parseInt(matcher.group(1));
                if (quantity > 0 && quantity <= 1000) {
                    return quantity;
                }
            }

            // Method 3: Look for numbers in context of quantity/replenishment
            String[] lines = aiResponse.split("\\n");
            for (String line : lines) {
                if (line.toLowerCase().contains("quantity") || line.toLowerCase().contains("replenish") ||
                        line.toLowerCase().contains("recommend") || line.toLowerCase().contains("order")) {
                    Pattern numberPattern = Pattern.compile("\\b([1-9]\\d{1,2})\\b");
                    Matcher numberMatcher = numberPattern.matcher(line);
                    if (numberMatcher.find()) {
                        int quantity = Integer.parseInt(numberMatcher.group());
                        if (quantity >= 10 && quantity <= 500) {
                            return quantity;
                        }
                    }
                }
            }

            // Method 4: Find any reasonable number in the response
            Pattern generalPattern = Pattern.compile("\\b([1-9]\\d?\\d?)\\b");
            Matcher generalMatcher = generalPattern.matcher(aiResponse);
            while (generalMatcher.find()) {
                int quantity = Integer.parseInt(generalMatcher.group());
                // Check if it's a reasonable quantity (not a year, price, etc.)
                if (quantity >= 10 && quantity <= 300) {
                    return quantity;
                }
            }

            // Fallback: calculate based on product data
            return calculateFallbackQuantity(product);

        } catch (Exception e) {
            System.err.println("Error parsing recommended quantity: " + e.getMessage());
            return calculateFallbackQuantity(product);
        }
    }

    private int calculateFallbackQuantity(Product product) {
        // Smart fallback calculation
        int baseQuantity = Math.max(product.getReorderThreshold() + 25, 35);

        // Adjust based on price (expensive items get smaller quantities)
        if (product.getPrice() > 1000) {
            baseQuantity = Math.max(baseQuantity / 2, 10);
        } else if (product.getPrice() > 100) {
            baseQuantity = Math.max(baseQuantity, 20);
        }

        return baseQuantity;
    }

    private String parseUrgencyLevel(String aiResponse) {
        try {
            String response = aiResponse.toUpperCase();

            // Method 1: Look for "URGENCY:" pattern (exact format we requested)
            if (response.contains("URGENCY:")) {
                String[] parts = response.split("URGENCY:");
                if (parts.length > 1) {
                    String urgencyPart = parts[1].split("[\\n|]")[0].trim();
                    if (urgencyPart.contains("CRITICAL")) return "CRITICAL";
                    if (urgencyPart.contains("HIGH")) return "HIGH";
                    if (urgencyPart.contains("MEDIUM")) return "MEDIUM";
                    if (urgencyPart.contains("LOW")) return "LOW";
                }
            }

            // Method 2: Direct keyword matching in entire response
            if (response.contains("CRITICAL") || response.contains("EMERGENCY")) {
                return "CRITICAL";
            }
            if (response.contains("HIGH") || response.contains("URGENT") || response.contains("IMMEDIATE")) {
                return "HIGH";
            }
            if (response.contains("MEDIUM") || response.contains("MODERATE")) {
                return "MEDIUM";
            }
            if (response.contains("LOW") || response.contains("MINOR")) {
                return "LOW";
            }

            // Method 3: Context-based detection
            if (response.contains("OUT OF STOCK") || response.contains("ZERO STOCK") ||
                    response.contains("CRITICALLY LOW")) {
                return "CRITICAL";
            }
            if (response.contains("VERY LOW") || response.contains("RUNNING OUT") ||
                    response.contains("SHORTAGE")) {
                return "HIGH";
            }

            return "MEDIUM"; // Default fallback

        } catch (Exception e) {
            System.err.println("Error parsing urgency level: " + e.getMessage());
            return "MEDIUM";
        }
    }

    private String parseReasoning(String aiResponse) {
        try {
            // Method 1: Extract reasoning after "REASON:" (exact format we requested)
            if (aiResponse.contains("REASON:")) {
                String[] parts = aiResponse.split("REASON:");
                if (parts.length > 1) {
                    String reason = parts[1].split("[\\n|]")[0].trim();
                    if (!reason.isEmpty() && reason.length() > 10) {
                        return reason;
                    }
                }
            }

            // Method 2: Extract reasoning after "Reason:"
            if (aiResponse.contains("Reason:")) {
                String[] parts = aiResponse.split("Reason:");
                if (parts.length > 1) {
                    String reason = parts[1].split("[\\n|]")[0].trim();
                    if (!reason.isEmpty() && reason.length() > 10) {
                        return reason;
                    }
                }
            }

            // Method 3: Try to extract meaningful sentences
            String[] sentences = aiResponse.split("[.!?\\n]");
            for (int i = sentences.length - 1; i >= 0; i--) {
                String sentence = sentences[i].trim();
                if (sentence.length() > 20 &&
                        (sentence.toLowerCase().contains("because") ||
                                sentence.toLowerCase().contains("due to") ||
                                sentence.toLowerCase().contains("based on") ||
                                sentence.toLowerCase().contains("considering") ||
                                sentence.toLowerCase().contains("reason"))) {
                    return sentence;
                }
            }

            // Method 4: Return first meaningful sentence
            for (String sentence : sentences) {
                String trimmed = sentence.trim();
                if (trimmed.length() > 30 && !trimmed.contains("QUANTITY") && !trimmed.contains("URGENCY")) {
                    return trimmed;
                }
            }

            // Method 5: Fallback
            return "AI recommendation based on inventory analysis and sales patterns";

        } catch (Exception e) {
            System.err.println("Error parsing reasoning: " + e.getMessage());
            return "AI recommendation based on inventory analysis";
        }
    }

    private boolean triggerSmartReplenishment(Product product, int quantity, String urgencyLevel, String reasoning) {
        try {
            List<User> buyers = userRepository.findAll().stream()
                    .filter(user -> user.getRole() == User.Role.BUYER)
                    .collect(Collectors.toList());

            if (buyers.isEmpty()) {
                System.err.println("No buyer found for auto-replenishment");
                return false;
            }

            User buyer = buyers.get(0);
            PurchaseOrder smartOrder = new PurchaseOrder(product, buyer, quantity, true);
            smartOrder.setStatus("APPROVED");
            smartOrder.setSupplierInfo("AI-Replenishment System");

            // Truncate reasoning if too long
            String truncatedReasoning = reasoning.length() > 200 ?
                    reasoning.substring(0, 200) + "..." : reasoning;

            smartOrder.setNotes("AI-triggered replenishment. Urgency: " + urgencyLevel +
                    ". Reason: " + truncatedReasoning);

            PurchaseOrder savedOrder = purchaseOrderRepository.save(smartOrder);
            salesRecordService.completePurchaseOrder(savedOrder.getId());

            System.out.println("AI-triggered replenishment completed for product: " +
                    product.getName() + ", Quantity: " + quantity);
            return true;

        } catch (Exception e) {
            System.err.println("Error in AI-triggered replenishment: " + e.getMessage());
            return false;
        }
    }

    public Map<String, Object> checkAllProductsForReplenishment() {
        List<Product> products = productRepository.findAll();
        Map<String, Object> result = new HashMap<>();

        List<Map<String, Object>> recommendations = products.stream()
                .filter(product -> product.getQuantity() <= (product.getReorderThreshold() + 10))
                .map(product -> {
                    try {
                        return getAIReplenishmentRecommendation(product.getId());
                    } catch (Exception e) {
                        Map<String, Object> errorResult = new HashMap<>();
                        errorResult.put("productId", product.getId());
                        errorResult.put("productName", product.getName());
                        errorResult.put("error", e.getMessage());
                        return errorResult;
                    }
                })
                .collect(Collectors.toList());

        int autoTriggeredCount = (int) recommendations.stream()
                .filter(rec -> rec.get("autoTriggered") != null && (Boolean) rec.get("autoTriggered"))
                .count();

        result.put("checkedProducts", products.size());
        result.put("lowStockProducts", recommendations.size());
        result.put("autoTriggeredReplenishments", autoTriggeredCount);
        result.put("recommendations", recommendations);
        result.put("timestamp", LocalDateTime.now());

        return result;
    }
}