
package com.dhandhristi.controller;

import com.dhandhristi.entity.Product;
import com.dhandhristi.service.ReportsService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reports")
@CrossOrigin(origins = "http://localhost:5173")
public class ReportsController {

    private final ReportsService reportsService;

    public ReportsController(ReportsService reportsService) {
        this.reportsService = reportsService;
    }

    @GetMapping("/summary")
    public Map<String, Object> getSummary() {
        return reportsService.getSummary();
    }

    @GetMapping("/monthly-sales")
    public List<Map<String, Object>> getMonthlySales() {
        return reportsService.getMonthlySales();
    }

    @GetMapping("/best-selling-products")
    public List<Map<String, Object>> getBestSellingProducts() {
        return reportsService.getBestSellingProducts();
    }

    @GetMapping("/low-stock")
    public List<Product> getLowStockProducts() {
        return reportsService.getLowStockProducts();
    }
}
