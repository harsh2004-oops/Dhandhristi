
package com.dhandhristi.service;

import com.dhandhristi.entity.Purchase;
import com.dhandhristi.entity.Product;
import com.dhandhristi.entity.Supplier;

import com.dhandhristi.repository.PurchaseRepository;
import com.dhandhristi.repository.ProductRepository;
import com.dhandhristi.repository.SupplierRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class PurchaseService {

    private final PurchaseRepository purchaseRepository;
    private final ProductRepository productRepository;
    private final SupplierRepository supplierRepository;

    public PurchaseService(
            PurchaseRepository purchaseRepository,
            ProductRepository productRepository,
            SupplierRepository supplierRepository) {

        this.purchaseRepository = purchaseRepository;
        this.productRepository = productRepository;
        this.supplierRepository = supplierRepository;
    }

    // ADD PURCHASE
    @Transactional
    public Purchase addPurchase(Purchase purchase) {

        if (purchase.getProductId() == null ||
                purchase.getSupplierId() == null) {
            throw new IllegalArgumentException(
                    "Product and supplier are required");
        }

        if (purchase.getQuantity() == null ||
                purchase.getQuantity() <= 0) {
            throw new IllegalArgumentException(
                    "Quantity must be greater than zero");
        }

        if (purchase.getPurchasePrice() == null ||
                !Double.isFinite(purchase.getPurchasePrice()) ||
                purchase.getPurchasePrice() <= 0) {
            throw new IllegalArgumentException(
                    "Purchase price must be greater than zero");
        }

        Product product = productRepository
                .findById(purchase.getProductId())
                .orElseThrow(() ->
                        new RuntimeException("Product not found"));

        supplierRepository
                .findById(purchase.getSupplierId())
                .orElseThrow(() ->
                        new RuntimeException("Supplier not found"));

        // Calculate total purchase amount
        double total = purchase.getQuantity()
                * purchase.getPurchasePrice();

        purchase.setTotalAmount(total);

        // Set purchase date
        if (purchase.getPurchaseDate() == null) {
            purchase.setPurchaseDate(LocalDate.now());
        }

        // Increase product stock
        int currentStock = product.getStock() == null
                ? 0 : product.getStock();

        product.setStock(currentStock + purchase.getQuantity());

        productRepository.save(product);

        // Save purchase record
        return purchaseRepository.save(purchase);
    }

    // GET ALL PURCHASES
    public List<Purchase> getAllPurchases() {
        return purchaseRepository.findAll();
    }

    // GET PURCHASE BY ID
    public Purchase getPurchaseById(Long id) {
        return purchaseRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Purchase not found"));
    }
}
