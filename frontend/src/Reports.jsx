
import { useEffect, useState } from "react";
import "./Reports.css";

const API = "http://localhost:8080/api/reports";
const EXPENSE_API = "http://localhost:8080/api/expenses";

function Reports() {
  const [summary, setSummary] = useState({});
  const [monthlySales, setMonthlySales] = useState([]);
  const [bestProducts, setBestProducts] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        summaryRes,
        monthlyRes,
        bestRes,
        stockRes,
        expensesRes
      ] = await Promise.all([
        fetch(`${API}/summary`),
        fetch(`${API}/monthly-sales`),
        fetch(`${API}/best-selling-products`),
        fetch(`${API}/low-stock`),
        fetch(EXPENSE_API)
      ]);

      if (
        !summaryRes.ok ||
        !monthlyRes.ok ||
        !bestRes.ok ||
        !stockRes.ok ||
        !expensesRes.ok
      ) {
        throw new Error(
          "Unable to load reports. Please check the backend."
        );
      }

      const [
        summaryData,
        monthlyData,
        bestData,
        stockData,
        expensesData
      ] = await Promise.all([
        summaryRes.json(),
        monthlyRes.json(),
        bestRes.json(),
        stockRes.json(),
        expensesRes.json()
      ]);

      setSummary(summaryData);
      setMonthlySales(monthlyData);
      setBestProducts(bestData);
      setLowStock(stockData);
      setExpenses(expensesData);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const money = (value) =>
    `₹${Number(value || 0).toLocaleString("en-IN", {
      maximumFractionDigits: 2
    })}`;

  const maxSales = Math.max(
    ...monthlySales.map((item) => Number(item.sales || 0)),
    1
  );

  // Group expenses by category.
  const expenseCategories = Object.values(
    expenses.reduce((groups, expense) => {
      const category = expense.category || "Other";

      if (!groups[category]) {
        groups[category] = {
          category,
          amount: 0,
          count: 0
        };
      }

      groups[category].amount += Number(expense.amount || 0);
      groups[category].count += 1;

      return groups;
    }, {})
  ).sort((a, b) => b.amount - a.amount);

  const maxExpense = Math.max(
    ...expenseCategories.map((item) => item.amount),
    1
  );

  if (loading) {
    return <div className="reports-loading">Loading reports...</div>;
  }

  return (
    <div className="reports-page">

      {/* Header */}
      <div className="reports-header">
        <div>
          <h1>Reports & Analytics</h1>
          <p>Understand your business performance at a glance.</p>
        </div>

        <button className="reports-refresh" onClick={loadReports}>
          ↻ Refresh Reports
        </button>
      </div>

      {error && (
        <div className="reports-error">
          {error}
        </div>
      )}

      {/* Summary Cards */}
      <div className="reports-stats-grid">

        <div className="report-stat-card sales-card">
          <div className="report-stat-top">
            <span>Total Sales</span>
            <span className="report-icon">₹</span>
          </div>
          <h2>{money(summary.totalSales)}</h2>
          <p>{summary.totalSalesOrders || 0} sales orders</p>
        </div>

        <div className="report-stat-card purchase-card">
          <div className="report-stat-top">
            <span>Total Purchases</span>
            <span className="report-icon">↓</span>
          </div>
          <h2>{money(summary.totalPurchases)}</h2>
          <p>{summary.totalPurchaseOrders || 0} purchase orders</p>
        </div>

        <div className="report-stat-card profit-card">
          <div className="report-stat-top">
            <span>Estimated Profit</span>
            <span className="report-icon">↗</span>
          </div>
          <h2>{money(summary.estimatedProfit)}</h2>
          <p>Based on recorded purchase costs</p>
        </div>

        <div className="report-stat-card expense-card">
          <div className="report-stat-top">
            <span>Total Expenses</span>
            <span className="report-icon">₹</span>
          </div>
          <h2>{money(summary.totalExpenses)}</h2>
          <p>{summary.totalExpenseRecords || 0} expense records</p>
        </div>

        <div className="report-stat-card net-profit-card">
          <div className="report-stat-top">
            <span>Net Profit</span>
            <span className="report-icon">✓</span>
          </div>
          <h2>{money(summary.netProfit)}</h2>
          <p>After deducting business expenses</p>
        </div>

        <div className="report-stat-card inventory-card">
          <div className="report-stat-top">
            <span>Low Stock Products</span>
            <span className="report-icon">!</span>
          </div>
          <h2>{summary.lowStockCount || 0}</h2>
          <p>Products with 10 or fewer units</p>
        </div>

      </div>

      {/* Monthly Sales Chart */}
      <div className="reports-panel">
        <div className="reports-panel-heading">
          <div>
            <h2>Monthly Sales</h2>
            <p>Sales performance over the last 12 months</p>
          </div>
        </div>

        {monthlySales.length === 0 ? (
          <div className="reports-empty">
            No sales data available.
          </div>
        ) : (
          <div className="sales-chart">
            {monthlySales.map((item) => {
              const value = Number(item.sales || 0);
              const height = (value / maxSales) * 100;

              return (
                <div className="sales-chart-column" key={item.month}>
                  <div className="sales-chart-value">
                    {value > 0 ? money(value) : ""}
                  </div>

                  <div className="sales-chart-bar-area">
                    <div
                      className="sales-chart-bar"
                      style={{
                        height: `${Math.max(
                          height,
                          value > 0 ? 3 : 0
                        )}%`
                      }}
                      title={money(value)}
                    />
                  </div>

                  <span className="sales-chart-month">
                    {new Date(
                      `${item.month}-01T00:00:00`
                    ).toLocaleDateString("en-IN", {
                      month: "short"
                    })}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Bottom Analytics */}
      <div className="reports-bottom-grid">

        {/* Top Selling Products */}
        <div className="reports-panel">
          <div className="reports-panel-heading">
            <div>
              <h2>Top Selling Products</h2>
              <p>Your five best-selling products</p>
            </div>
          </div>

          {bestProducts.length === 0 ? (
            <div className="reports-empty">
              No sales recorded yet.
            </div>
          ) : (
            <div className="reports-table-wrapper">
              <table className="reports-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Qty Sold</th>
                    <th>Revenue</th>
                  </tr>
                </thead>

                <tbody>
                  {bestProducts.map((product) => (
                    <tr key={product.productId}>
                      <td>{product.productName}</td>
                      <td>{product.quantitySold}</td>
                      <td>{money(product.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Low Stock */}
        <div className="reports-panel">
          <div className="reports-panel-heading">
            <div>
              <h2>Low Stock Alert</h2>
              <p>Products that may need restocking</p>
            </div>

            <span className="low-stock-count">
              {lowStock.length}
            </span>
          </div>

          {lowStock.length === 0 ? (
            <div className="reports-empty">
              All products have sufficient stock.
            </div>
          ) : (
            <div className="low-stock-list">
              {lowStock.map((product) => (
                <div className="low-stock-item" key={product.id}>
                  <div>
                    <strong>{product.name}</strong>
                    <span>{product.category || "Uncategorized"}</span>
                  </div>

                  <span
                    className={`stock-badge ${
                      product.stock === 0 ? "out-of-stock" : ""
                    }`}
                  >
                    {product.stock} left
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Expense Breakdown */}
        <div className="reports-panel">
          <div className="reports-panel-heading">
            <div>
              <h2>Expense Breakdown</h2>
              <p>Expenses by category</p>
            </div>
          </div>

          {expenseCategories.length === 0 ? (
            <div className="reports-empty">
              No expenses recorded yet.
            </div>
          ) : (
            <div className="expense-breakdown-list">
              {expenseCategories.map((item) => (
                <div
                  className="expense-category-item"
                  key={item.category}
                >
                  <div className="expense-category-info">
                    <strong>{item.category}</strong>
                    <span>
                      {item.count} {item.count === 1 ? "record" : "records"}
                    </span>
                    <strong>{money(item.amount)}</strong>
                  </div>

                  <div className="expense-progress-track">
                    <div
                      className="expense-progress-bar"
                      style={{
                        width: `${(item.amount / maxExpense) * 100}%`
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      <p className="reports-note">
        Note: Estimated profit is calculated using the average recorded
        purchase cost per product. Net profit is estimated profit minus
        recorded expenses. These figures are not final accounting profit.
      </p>

    </div>
  );
}

export default Reports;
