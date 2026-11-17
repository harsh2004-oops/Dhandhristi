
package com.dhandhristi.controller;

import com.dhandhristi.service.BusinessInsightsService;

import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/insights")
@CrossOrigin(origins = "http://localhost:5173")
public class BusinessInsightsController {

    private final BusinessInsightsService businessInsightsService;

    public BusinessInsightsController(
            BusinessInsightsService businessInsightsService) {

        this.businessInsightsService = businessInsightsService;
    }

    @GetMapping
    public List<Map<String, Object>> getInsights() {

        return businessInsightsService.getInsights();
    }
}

