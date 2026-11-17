
package com.dhandhristi.service;

import com.dhandhristi.entity.Sale;
import com.dhandhristi.entity.Product;

import com.dhandhristi.repository.SaleRepository;
import com.dhandhristi.repository.ProductRepository;
import com.dhandhristi.repository.CustomerRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class SaleService {

    private final SaleRepository saleRepository;
    private final ProductRepository productRepository;
    private final CustomerRepository customerRepository;

    public SaleService(
            SaleRepository saleRepository,
            ProductRepository productRepository,
            CustomerRepository customerRepository) {

        this.saleRepository = saleRepository;
        this.productRepository = productRepository;
        this.customerRepository = customerRepository;
    }

    // ADD SALE
    @Transactional
    public Sale addSale(Sale sale) {

        if (sale.getProductId() == null ||
                sale.getCustomerId() == null) {
            throw new IllegalArgumentException(
                    "Product and customer are required");
        }

        if (sale.getQuantity() == null ||
                sale.getQuantity() <= 0) {
            throw new IllegalArgumentException(
                    "Quantity must be greater than zero");
        }

        if (sale.getSellingPrice() == null ||
                !Double.isFinite(sale.getSellingPrice()) ||
                sale.getSellingPrice() <= 0) {
            throw new IllegalArgumentException(
                    "Selling price must be greater than zero");
        }

        // Find product
        Product product = productRepository
                .findById(sale.getProductId())
                .orElseThrow(() ->
                        new RuntimeException("Product not found"));

        // Check customer exists
        customerRepository
                .findById(sale.getCustomerId())
                .orElseThrow(() ->
                        new RuntimeException("Customer not found"));

        // Check available stock
        int availableStock = product.getStock() == null
                ? 0 : product.getStock();

        if (sale.getQuantity() > availableStock) {
            throw new IllegalArgumentException(
                    "Insufficient stock. Available stock: "
                            + availableStock);
        }

        // Calculate total sale amount
        double total = sale.getQuantity()
                * sale.getSellingPrice();

        if (!Double.isFinite(total)) {
            throw new IllegalArgumentException(
                    "Invalid sale amount");
        }

        sale.setTotalAmount(total);

        // Set sale date
        if (sale.getSaleDate() == null) {
            sale.setSaleDate(LocalDate.now());
        }

        // Decrease product stock
        product.setStock(
                availableStock - sale.getQuantity()
        );

        productRepository.save(product);

        // Save sale record
        return saleRepository.save(sale);
    }

    // GET ALL SALES
    public List<Sale> getAllSales() {
        return saleRepository.findAll();
    }

    // GET SALE BY ID
    public Sale getSaleById(Long id) {
        return saleRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Sale not found"));
    }
}
