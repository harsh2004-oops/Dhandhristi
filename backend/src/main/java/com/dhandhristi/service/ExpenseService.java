
package com.dhandhristi.service;

import com.dhandhristi.entity.Expense;
import com.dhandhristi.repository.ExpenseRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class ExpenseService {

    private final ExpenseRepository expenseRepository;

    public ExpenseService(ExpenseRepository expenseRepository) {
        this.expenseRepository = expenseRepository;
    }

    // ADD EXPENSE
    public Expense addExpense(Expense expense) {

        validateExpense(expense);

        if (expense.getExpenseDate() == null) {
            expense.setExpenseDate(LocalDate.now());
        }

        return expenseRepository.save(expense);
    }

    // GET ALL EXPENSES
    public List<Expense> getAllExpenses() {
        return expenseRepository.findAll();
    }

    // GET EXPENSE BY ID
    public Expense getExpenseById(Long id) {
        return expenseRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Expense not found with ID: " + id));
    }

    // UPDATE EXPENSE
    public Expense updateExpense(Long id, Expense updatedExpense) {

        validateExpense(updatedExpense);

        Expense existingExpense = getExpenseById(id);

        existingExpense.setExpenseName(updatedExpense.getExpenseName());
        existingExpense.setCategory(updatedExpense.getCategory());
        existingExpense.setDescription(updatedExpense.getDescription());
        existingExpense.setAmount(updatedExpense.getAmount());
        existingExpense.setExpenseDate(updatedExpense.getExpenseDate());
        existingExpense.setPaymentMethod(updatedExpense.getPaymentMethod());

        return expenseRepository.save(existingExpense);
    }

    // DELETE EXPENSE
    public void deleteExpense(Long id) {

        Expense expense = getExpenseById(id);

        expenseRepository.delete(expense);
    }

    // VALIDATION
    private void validateExpense(Expense expense) {

        if (expense.getExpenseName() == null ||
                expense.getExpenseName().isBlank()) {
            throw new IllegalArgumentException("Expense name is required.");
        }

        if (expense.getCategory() == null ||
                expense.getCategory().isBlank()) {
            throw new IllegalArgumentException("Expense category is required.");
        }

        if (expense.getAmount() == null ||
                !Double.isFinite(expense.getAmount()) ||
                expense.getAmount() <= 0) {
            throw new IllegalArgumentException("Enter a valid expense amount.");
        }

        if (expense.getPaymentMethod() == null ||
                expense.getPaymentMethod().isBlank()) {
            throw new IllegalArgumentException("Payment method is required.");
        }
    }
}
