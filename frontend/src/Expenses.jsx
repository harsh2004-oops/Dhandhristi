
import { useEffect, useState } from "react";
import axios from "axios";
import {
  Wallet,
  Plus,
  Pencil,
  Trash2,
  X,
  Search,
  IndianRupee,
  Receipt
} from "lucide-react";
import "./Expenses.css";

const EXPENSE_API = "http://localhost:8080/api/expenses";

const initialForm = {
  expenseName: "",
  category: "",
  description: "",
  amount: "",
  expenseDate: new Date().toISOString().slice(0, 10),
  paymentMethod: ""
};

function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);

  const categories = [
    "Rent",
    "Electricity",
    "Salary",
    "Transportation",
    "Packaging",
    "Marketing",
    "Maintenance",
    "Other"
  ];

  const paymentMethods = [
    "Cash",
    "UPI",
    "Bank Transfer",
    "Credit Card",
    "Debit Card",
    "Other"
  ];

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      const response = await axios.get(EXPENSE_API);
      setExpenses(response.data);
      setError("");
    } catch (err) {
      setError("Unable to load expenses. Check your backend.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!form.expenseName.trim() || !form.category || !form.paymentMethod) {
      setError("Please complete all required fields.");
      return;
    }

    if (!Number.isFinite(Number(form.amount)) || Number(form.amount) <= 0) {
      setError("Please enter a valid expense amount.");
      return;
    }

    const expenseData = {
      ...form,
      expenseName: form.expenseName.trim(),
      amount: Number(form.amount)
    };

    try {
      if (editingId) {
        await axios.put(`${EXPENSE_API}/${editingId}`, expenseData);
        setSuccess("Expense updated successfully.");
      } else {
        await axios.post(EXPENSE_API, expenseData);
        setSuccess("Expense added successfully.");
      }

      setForm(initialForm);
      setEditingId(null);
      await fetchExpenses();
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to save expense."
      );
    }
  };

  const editExpense = (expense) => {
    setEditingId(expense.id);

    setForm({
      expenseName: expense.expenseName || "",
      category: expense.category || "",
      description: expense.description || "",
      amount: expense.amount ?? "",
      expenseDate: expense.expenseDate || "",
      paymentMethod: expense.paymentMethod || ""
    });

    setError("");
    setSuccess("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(initialForm);
    setError("");
  };

  const deleteExpense = async (id) => {
    if (!window.confirm("Are you sure you want to delete this expense?")) {
      return;
    }

    try {
      await axios.delete(`${EXPENSE_API}/${id}`);
      setSuccess("Expense deleted successfully.");
      setError("");
      await fetchExpenses();
    } catch (err) {
      setError("Unable to delete expense.");
    }
  };

  const filteredExpenses = expenses.filter((expense) =>
    `${expense.expenseName} ${expense.category} ${expense.paymentMethod}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const totalExpenses = expenses.reduce(
    (sum, expense) => sum + Number(expense.amount || 0),
    0
  );

  const formatMoney = (amount) =>
    `₹${Number(amount || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;

  return (
    <div className="expenses-page">

      {/* HEADER */}
      <div className="expenses-header">
        <div>
          <h1>Expense Management</h1>
          <p>Track and manage your business expenses.</p>
        </div>

        <button
          className="expense-refresh-btn"
          onClick={fetchExpenses}
        >
          ↻ Refresh
        </button>
      </div>

      {/* ALERTS */}
      {error && <div className="expense-error">{error}</div>}
      {success && <div className="expense-success">{success}</div>}

      {/* SUMMARY CARDS */}
      <div className="expense-stats-grid">

        <div className="expense-stat-card">
          <div className="expense-stat-icon purple">
            <Wallet size={21} />
          </div>
          <div>
            <p>Total Expenses</p>
            <h2>{formatMoney(totalExpenses)}</h2>
          </div>
        </div>

        <div className="expense-stat-card">
          <div className="expense-stat-icon blue">
            <Receipt size={21} />
          </div>
          <div>
            <p>Total Expense Records</p>
            <h2>{expenses.length}</h2>
          </div>
        </div>

        <div className="expense-stat-card">
          <div className="expense-stat-icon orange">
            <IndianRupee size={21} />
          </div>
          <div>
            <p>Average Expense</p>
            <h2>
              {formatMoney(
                expenses.length ? totalExpenses / expenses.length : 0
              )}
            </h2>
          </div>
        </div>

      </div>

      {/* MAIN CONTENT */}
      <div className="expense-content-grid">

        {/* ADD EXPENSE FORM */}
        <div className="expense-panel expense-form-panel">
          <div className="expense-panel-heading">
            <h2>{editingId ? "Edit Expense" : "Add New Expense"}</h2>

            {editingId && (
              <button className="expense-cancel-icon" onClick={cancelEdit}>
                <X size={18} />
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit}>

            <label>Expense Name *</label>
            <input
              required
              type="text"
              placeholder="e.g. Shop Electricity Bill"
              value={form.expenseName}
              onChange={(e) =>
                setForm({ ...form, expenseName: e.target.value })
              }
            />

            <label>Expense Category *</label>
            <select
              required
              value={form.category}
              onChange={(e) =>
                setForm({ ...form, category: e.target.value })
              }
            >
              <option value="">Select category</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>

            <label>Description</label>
            <textarea
              placeholder="Enter expense details"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />

            <label>Amount (₹) *</label>
            <input
              required
              type="number"
              min="0.01"
              step="0.01"
              placeholder="Enter amount"
              value={form.amount}
              onChange={(e) =>
                setForm({ ...form, amount: e.target.value })
              }
            />

            <label>Expense Date *</label>
            <input
              required
              type="date"
              value={form.expenseDate}
              onChange={(e) =>
                setForm({ ...form, expenseDate: e.target.value })
              }
            />

            <label>Payment Method *</label>
            <select
              required
              value={form.paymentMethod}
              onChange={(e) =>
                setForm({ ...form, paymentMethod: e.target.value })
              }
            >
              <option value="">Select payment method</option>
              {paymentMethods.map((method) => (
                <option key={method} value={method}>
                  {method}
                </option>
              ))}
            </select>

            <button className="expense-submit-btn" type="submit">
              <Plus size={17} />
              {editingId ? "Update Expense" : "Add Expense"}
            </button>

            {editingId && (
              <button
                className="expense-cancel-btn"
                type="button"
                onClick={cancelEdit}
              >
                Cancel Editing
              </button>
            )}

          </form>
        </div>

        {/* EXPENSE HISTORY */}
        <div className="expense-panel expense-history-panel">

          <div className="expense-panel-heading">
            <div>
              <h2>Expense History</h2>
              <p>View all your recorded business expenses.</p>
            </div>
          </div>

          <div className="expense-search">
            <Search size={18} />
            <input
              placeholder="Search expense, category or payment..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {loading ? (
            <div className="expense-empty">Loading expenses...</div>
          ) : (
            <div className="expense-table-wrapper">
              <table className="expense-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Date</th>
                    <th>Expense</th>
                    <th>Category</th>
                    <th>Amount</th>
                    <th>Payment</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredExpenses.map((expense) => (
                    <tr key={expense.id}>
                      <td>#{expense.id}</td>
                      <td>{expense.expenseDate}</td>
                      <td>
                        <strong>{expense.expenseName}</strong>
                        {expense.description && (
                          <small className="expense-description">
                            {expense.description}
                          </small>
                        )}
                      </td>
                      <td>
                        <span className="expense-category-badge">
                          {expense.category}
                        </span>
                      </td>
                      <td>
                        <strong>{formatMoney(expense.amount)}</strong>
                      </td>
                      <td>{expense.paymentMethod}</td>
                      <td>
                        <div className="expense-actions">
                          <button
                            className="expense-edit-btn"
                            title="Edit"
                            onClick={() => editExpense(expense)}
                          >
                            <Pencil size={15} />
                          </button>

                          <button
                            className="expense-delete-btn"
                            title="Delete"
                            onClick={() => deleteExpense(expense.id)}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {filteredExpenses.length === 0 && (
                    <tr>
                      <td colSpan="7" className="expense-empty">
                        No expenses found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}

export default Expenses;
