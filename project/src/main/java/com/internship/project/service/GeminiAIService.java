package com.internship.project.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.HashMap;
import java.util.Map;

@Service
public class GeminiAIService {

    @Value("${gemini.api.key:}")
    private String geminiApiKey;

    @Value("${gemini.api.url:https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent}")
    private String geminiApiUrl;

    @Autowired
    private WebClient.Builder webClientBuilder;

    private final ObjectMapper objectMapper = new ObjectMapper();

    public String getAIRecommendation(String prompt) {
        if (geminiApiKey == null || geminiApiKey.isEmpty()) {
            return getFallbackRecommendation(prompt);
        }

        try {
            // Prepare request payload for Gemini API
            Map<String, Object> requestBody = new HashMap<>();

            // Create contents array
            Map<String, Object> contentItem = new HashMap<>();
            Map<String, Object> parts = new HashMap<>();
            parts.put("text", prompt);

            contentItem.put("parts", new Object[]{parts});
            requestBody.put("contents", new Object[]{contentItem});

            // Make API call to Gemini
            String response = webClientBuilder.build()
                    .post()
                    .uri(geminiApiUrl + "?key=" + geminiApiKey)
                    .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            return parseGeminiResponse(response);

        } catch (Exception e) {
            System.err.println("Error calling Gemini API: " + e.getMessage());
            return getFallbackRecommendation(prompt);
        }
    }

    private String parseGeminiResponse(String response) {
        try {
            // Parse the Gemini API response
            Map<String, Object> responseMap = objectMapper.readValue(response, Map.class);

            // Navigate through the response structure to extract text
            if (responseMap.containsKey("candidates")) {
                Object candidates = responseMap.get("candidates");
                if (candidates instanceof java.util.List) {
                    java.util.List<?> candidatesList = (java.util.List<?>) candidates;
                    if (!candidatesList.isEmpty()) {
                        Object firstCandidate = candidatesList.get(0);
                        if (firstCandidate instanceof Map) {
                            Map<?, ?> candidateMap = (Map<?, ?>) firstCandidate;
                            if (candidateMap.containsKey("content")) {
                                Object content = candidateMap.get("content");
                                if (content instanceof Map) {
                                    Map<?, ?> contentMap = (Map<?, ?>) content;
                                    if (contentMap.containsKey("parts")) {
                                        Object parts = contentMap.get("parts");
                                        if (parts instanceof java.util.List) {
                                            java.util.List<?> partsList = (java.util.List<?>) parts;
                                            if (!partsList.isEmpty()) {
                                                Object firstPart = partsList.get(0);
                                                if (firstPart instanceof Map) {
                                                    Map<?, ?> partMap = (Map<?, ?>) firstPart;
                                                    if (partMap.containsKey("text")) {
                                                        return partMap.get("text").toString();
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
            return "Unable to parse AI response. Using fallback recommendation.";
        } catch (Exception e) {
            return "Error parsing response: " + e.getMessage() + ". Using fallback recommendation.";
        }
    }

    private String getFallbackRecommendation(String prompt) {
        // Fixed the typo: promtains -> contains
        if (prompt.contains("low stock") || prompt.contains("urgent")) {
            return "FALLBACK: High urgency detected. Recommended quantity: 50 units. Reason: Critical stock level requires immediate replenishment.";
        } else if (prompt.contains("medium") || prompt.contains("moderate")) {
            return "FALLBACK: Medium urgency. Recommended quantity: 30 units. Reason: Standard replenishment based on sales patterns.";
        } else {
            return "FALLBACK: Low urgency. Recommended quantity: 20 units. Reason: Preventive replenishment to maintain optimal stock levels.";
        }
    }
}