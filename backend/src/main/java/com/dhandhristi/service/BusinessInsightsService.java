
package com.dhandhristi.service;

import com.dhandhristi.entity.Expense;
import com.dhandhristi.entity.Product;
import com.dhandhristi.entity.Purchase;
import com.dhandhristi.entity.Sale;

import com.dhandhristi.repository.ExpenseRepository;
import com.dhandhristi.repository.ProductRepository;
import com.dhandhristi.repository.PurchaseRepository;
import com.dhandhristi.repository.SaleRepository;

import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class BusinessInsightsService {

    private final ProductRepository productRepository;
    private final PurchaseRepository purchaseRepository;
    private final SaleRepository saleRepository;
    private final ExpenseRepository expenseRepository;

    public BusinessInsightsService(
            ProductRepository productRepository,
            PurchaseRepository purchaseRepository,
            SaleRepository saleRepository,
            ExpenseRepository expenseRepository) {

        this.productRepository = productRepository;
        this.purchaseRepository = purchaseRepository;
        this.saleRepository = saleRepository;
        this.expenseRepository = expenseRepository;
    }

    public List<Map<String, Object>> getInsights() {

        List<Map<String, Object>> insights = new ArrayList<>();

        List<Product> products = productRepository.findAll();
        List<Sale> sales = saleRepository.findAll();
        List<Purchase> purchases = purchaseRepository.findAll();
        List<Expense> expenses = expenseRepository.findAll();

        // Track quantities sold and revenue for each product.
        Map<Long, Integer> quantitiesSold = new HashMap<>();
        Map<Long, Double> productRevenue = new HashMap<>();

        for (Sale sale : sales) {

            Long productId = sale.getProductId();

            quantitiesSold.merge(
                    productId,
                    sale.getQuantity(),
                    Integer::sum
            );

            productRevenue.merge(
                    productId,
                    sale.getTotalAmount() != null
                            ? sale.getTotalAmount() : 0.0,
                    Double::sum
            );
        }

        // 1. Low stock recommendations.
        List<Product> lowStockProducts = products.stream()
                .filter(p -> p.getStock() != null && p.getStock() <= 10)
                .toList();

        if (!lowStockProducts.isEmpty()) {

            String names = lowStockProducts.stream()
                    .limit(5)
                    .map(Product::getName)
                    .reduce((a, b) -> a + ", " + b)
                    .orElse("");

            addInsight(
                    insights,
                    "LOW_STOCK",
                    "Low Stock Alert",
                    names + " need restocking. Check your inventory.",
                    "HIGH",
                    lowStockProducts.size()
            );

        } else {

            addInsight(
                    insights,
                    "STOCK_OK",
                    "Inventory Status",
                    "All products currently have more than 10 units in stock.",
                    "LOW",
                    0
            );
        }

        // 2. Products with no recorded sales.
        List<Product> unsoldProducts = products.stream()
                .filter(p -> !quantitiesSold.containsKey(p.getId()))
                .toList();

        if (!unsoldProducts.isEmpty()) {

            String names = unsoldProducts.stream()
                    .limit(5)
                    .map(Product::getName)
                    .reduce((a, b) -> a + ", " + b)
                    .orElse("");

            addInsight(
                    insights,
                    "UNSOLD_PRODUCTS",
                    "Products With No Sales",
                    names + " have no recorded sales. Consider promoting these products.",
                    "MEDIUM",
                    unsoldProducts.size()
            );
        }

        // 3. Best-selling product.
        Optional<Product> bestProduct = products.stream()
                .filter(p -> quantitiesSold.containsKey(p.getId()))
                .max(Comparator.comparingInt(
                        p -> quantitiesSold.get(p.getId())
                ));

        if (bestProduct.isPresent()) {

            Product product = bestProduct.get();

            addInsight(
                    insights,
                    "BEST_SELLER",
                    "Best-Selling Product",
                    product.getName() + " is your top seller with "
                            + quantitiesSold.get(product.getId())
                            + " units sold.",
                    "LOW",
                    quantitiesSold.get(product.getId())
            );

        } else {

            addInsight(
                    insights,
                    "NO_SALES",
                    "Sales Activity",
                    "No sales have been recorded yet. Start adding sales to see product performance.",
                    "MEDIUM",
                    0
            );
        }

        // 4. Expense category analysis.
        Map<String, Double> categoryExpenses = new HashMap<>();

        double totalExpenses = 0;

        for (Expense expense : expenses) {

            double amount = expense.getAmount() != null
                    ? expense.getAmount() : 0;

            totalExpenses += amount;

            String category = expense.getCategory() != null
                    ? expense.getCategory() : "Other";

            categoryExpenses.merge(
                    category,
                    amount,
                    Double::sum
            );
        }

        Optional<Map.Entry<String, Double>> highestExpense =
                categoryExpenses.entrySet()
                        .stream()
                        .max(Map.Entry.comparingByValue());

        if (highestExpense.isPresent()) {

            Map.Entry<String, Double> entry = highestExpense.get();

            double percentage = totalExpenses > 0
                    ? (entry.getValue() / totalExpenses) * 100 : 0;

            addInsight(
                    insights,
                    "HIGH_EXPENSE_CATEGORY",
                    "Highest Expense Category",
                    entry.getKey() + " is your highest expense category at ₹"
                            + String.format(Locale.US, "%.2f", entry.getValue())
                            + " (" + String.format(Locale.US, "%.1f", percentage)
                            + "% of recorded expenses). Review this spending.",
                    "MEDIUM",
                    entry.getValue()
            );
        }

        // 5. Estimated profit and net profit.
        Map<Long, double[]> productCosts = new HashMap<>();

        for (Purchase purchase : purchases) {

            Long productId = purchase.getProductId();

            double[] values = productCosts.computeIfAbsent(
                    productId, id -> new double[2]
            );

            values[0] += purchase.getPurchasePrice()
                    * purchase.getQuantity();

            values[1] += purchase.getQuantity();
        }

        double estimatedProfit = 0;

        for (Sale sale : sales) {

            double[] cost = productCosts.get(sale.getProductId());

            if (cost != null && cost[1] > 0) {

                double averageCost = cost[0] / cost[1];

                double revenue = sale.getTotalAmount() != null
                        ? sale.getTotalAmount() : 0;

                estimatedProfit += revenue
                        - (averageCost * sale.getQuantity());
            }
        }

        double netProfit = estimatedProfit - totalExpenses;

        if (netProfit < 0) {

            addInsight(
                    insights,
                    "BUSINESS_LOSS",
                    "Business Profit Alert",
                    "Your estimated net profit is negative by ₹"
                            + String.format(Locale.US, "%.2f", Math.abs(netProfit))
                            + ". Review expenses and product margins.",
                    "HIGH",
                    netProfit
            );

        } else {

            addInsight(
                    insights,
                    "BUSINESS_PROFIT",
                    "Business Profit Status",
                    "Your estimated net profit is ₹"
                            + String.format(Locale.US, "%.2f", netProfit)
                            + ". Keep monitoring your expenses and sales.",
                    "LOW",
                    netProfit
            );
        }

        // 6. No product data.
        if (products.isEmpty()) {

            addInsight(
                    insights,
                    "NO_PRODUCTS",
                    "Product Catalog Empty",
                    "Add products to your catalog to start tracking inventory and sales.",
                    "MEDIUM",
                    0
            );
        }

        // Sort HIGH priority first, then MEDIUM, then LOW.
        Map<String, Integer> priorityOrder = Map.of(
                "HIGH", 1,
                "MEDIUM", 2,
                "LOW", 3
        );

        insights.sort(Comparator.comparingInt(
                insight -> priorityOrder.get(
                        (String) insight.get("priority")
                )
        ));

        return insights;
    }

    private void addInsight(
            List<Map<String, Object>> insights,
            String type,
            String title,
            String message,
            String priority,
            Number value) {

        Map<String, Object> insight = new LinkedHashMap<>();

        insight.put("type", type);
        insight.put("title", title);
        insight.put("message", message);
        insight.put("priority", priority);
        insight.put("value", value);

        insights.add(insight);
    }
}

