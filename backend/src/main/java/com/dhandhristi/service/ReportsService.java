
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

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.*;

@Service
public class ReportsService {

    private final ProductRepository productRepository;
    private final PurchaseRepository purchaseRepository;
    private final SaleRepository saleRepository;
    private final ExpenseRepository expenseRepository;

    public ReportsService(
            ProductRepository productRepository,
            PurchaseRepository purchaseRepository,
            SaleRepository saleRepository,
            ExpenseRepository expenseRepository) {

        this.productRepository = productRepository;
        this.purchaseRepository = purchaseRepository;
        this.saleRepository = saleRepository;
        this.expenseRepository = expenseRepository;
    }

    public Map<String, Object> getSummary() {

        List<Sale> sales = saleRepository.findAll();
        List<Purchase> purchases = purchaseRepository.findAll();
        List<Product> products = productRepository.findAll();
        List<Expense> expenses = expenseRepository.findAll();

        double totalSales = sales.stream()
                .mapToDouble(s -> s.getTotalAmount() != null
                        ? s.getTotalAmount() : 0)
                .sum();

        double totalPurchases = purchases.stream()
                .mapToDouble(p -> p.getTotalAmount() != null
                        ? p.getTotalAmount() : 0)
                .sum();

        // Calculate average purchase cost for each product.
        Map<Long, double[]> productCosts = new HashMap<>();

        for (Purchase purchase : purchases) {

            Long productId = purchase.getProductId();

            double[] values = productCosts.computeIfAbsent(
                    productId, id -> new double[2]);

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

        // Calculate total expenses.
        double totalExpenses = expenses.stream()
                .mapToDouble(e -> e.getAmount() != null
                        ? e.getAmount() : 0)
                .sum();

        // Calculate estimated net profit.
        double netProfit = estimatedProfit - totalExpenses;

        long lowStockCount = products.stream()
                .filter(p -> p.getStock() != null && p.getStock() <= 10)
                .count();

        Map<String, Object> result = new LinkedHashMap<>();

        result.put("totalSales", totalSales);
        result.put("totalPurchases", totalPurchases);
        result.put("estimatedProfit", estimatedProfit);
        result.put("totalExpenses", totalExpenses);
        result.put("totalExpenseRecords", expenses.size());
        result.put("netProfit", netProfit);
        result.put("totalSalesOrders", sales.size());
        result.put("totalPurchaseOrders", purchases.size());
        result.put("totalProducts", products.size());
        result.put("lowStockCount", lowStockCount);

        return result;
    }

    public List<Map<String, Object>> getMonthlySales() {

        List<Sale> sales = saleRepository.findAll();

        Map<String, Double> monthlyData = new TreeMap<>();

        LocalDate today = LocalDate.now();

        // Last 12 months, including the current month.
        for (int i = 11; i >= 0; i--) {

            YearMonth month = YearMonth.from(today).minusMonths(i);

            monthlyData.put(month.toString(), 0.0);
        }

        for (Sale sale : sales) {

            if (sale.getSaleDate() == null) continue;

            String month = YearMonth.from(sale.getSaleDate()).toString();

            if (monthlyData.containsKey(month)) {

                double amount = sale.getTotalAmount() != null
                        ? sale.getTotalAmount() : 0;

                monthlyData.put(
                        month,
                        monthlyData.get(month) + amount
                );
            }
        }

        List<Map<String, Object>> result = new ArrayList<>();

        monthlyData.forEach((month, amount) -> {

            Map<String, Object> row = new LinkedHashMap<>();

            row.put("month", month);
            row.put("sales", amount);

            result.add(row);
        });

        return result;
    }

    public List<Map<String, Object>> getBestSellingProducts() {

        List<Sale> sales = saleRepository.findAll();
        List<Product> products = productRepository.findAll();

        Map<Long, int[]> quantities = new HashMap<>();
        Map<Long, Double> revenues = new HashMap<>();

        for (Sale sale : sales) {

            Long productId = sale.getProductId();

            int[] data = quantities.computeIfAbsent(
                    productId, id -> new int[1]);

            data[0] += sale.getQuantity();

            revenues.merge(
                    productId,
                    sale.getTotalAmount() != null
                            ? sale.getTotalAmount() : 0,
                    Double::sum
            );
        }

        Map<Long, String> productNames = new HashMap<>();

        for (Product product : products) {

            productNames.put(product.getId(), product.getName());
        }

        List<Map<String, Object>> result = new ArrayList<>();

        quantities.forEach((productId, data) -> {

            Map<String, Object> row = new LinkedHashMap<>();

            row.put("productId", productId);
            row.put("productName",
                    productNames.getOrDefault(productId, "Unknown Product"));
            row.put("quantitySold", data[0]);
            row.put("revenue", revenues.getOrDefault(productId, 0.0));

            result.add(row);
        });

        result.sort((a, b) ->
                Integer.compare(
                        (Integer) b.get("quantitySold"),
                        (Integer) a.get("quantitySold")
                )
        );

        return result.stream().limit(5).toList();
    }

    public List<Product> getLowStockProducts() {

        return productRepository.findAll()
                .stream()
                .filter(p -> p.getStock() != null && p.getStock() <= 10)
                .sorted(Comparator.comparing(Product::getStock))
                .toList();
    }
}
