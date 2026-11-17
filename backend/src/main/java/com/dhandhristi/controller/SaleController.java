
package com.dhandhristi.controller;

import com.dhandhristi.entity.Sale;
import com.dhandhristi.service.SaleService;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sales")
@CrossOrigin(origins = "http://localhost:5173")
public class SaleController {

    private final SaleService saleService;

    public SaleController(SaleService saleService) {
        this.saleService = saleService;
    }

    // ADD SALE
    @PostMapping
    public Sale addSale(@RequestBody Sale sale) {
        return saleService.addSale(sale);
    }

    // GET ALL SALES
    @GetMapping
    public List<Sale> getAllSales() {
        return saleService.getAllSales();
    }

    // GET SALE BY ID
    @GetMapping("/{id}")
    public Sale getSaleById(@PathVariable Long id) {
        return saleService.getSaleById(id);
    }
}

