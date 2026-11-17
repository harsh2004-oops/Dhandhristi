
import { useEffect, useState } from "react";
import {
  Lightbulb,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Package,
  ShoppingBag,
  Wallet,
  RefreshCw,
  CheckCircle,
  Info
} from "lucide-react";

import "./BusinessInsights.css";

const API = "http://localhost:8080/api/insights";

function BusinessInsights() {
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadInsights();
  }, []);

  const loadInsights = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(API);

      if (!response.ok) {
        throw new Error("Unable to load business insights.");
      }

      const data = await response.json();
      setInsights(data);

    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case "LOW_STOCK":
        return <Package />;

      case "UNSOLD_PRODUCTS":
        return <ShoppingBag />;

      case "BEST_SELLER":
        return <TrendingUp />;

      case "HIGH_EXPENSE_CATEGORY":
        return <Wallet />;

      case "BUSINESS_LOSS":
        return <TrendingDown />;

      case "BUSINESS_PROFIT":
        return <CheckCircle />;

      case "STOCK_OK":
        return <CheckCircle />;

      case "NO_SALES":
        return <Info />;

      case "NO_PRODUCTS":
        return <Package />;

      default:
        return <Lightbulb />;
    }
  };

  const getPriorityClass = (priority) => {
    switch (priority) {
      case "HIGH":
        return "insight-high";

      case "MEDIUM":
        return "insight-medium";

      default:
        return "insight-low";
    }
  };

  const highCount = insights.filter(
    (item) => item.priority === "HIGH"
  ).length;

  const mediumCount = insights.filter(
    (item) => item.priority === "MEDIUM"
  ).length;

  const lowCount = insights.filter(
    (item) => item.priority === "LOW"
  ).length;

  if (loading) {
    return (
      <div className="insights-loading">
        <RefreshCw className="loading-icon" />
        <p>Analyzing your business data...</p>
      </div>
    );
  }

  return (
    <div className="insights-page">

      {/* Header */}
      <div className="insights-header">
        <div>
          <h1>Business Insights</h1>
          <p>
            Smart recommendations to help you understand and
            improve your business.
          </p>
        </div>

        <button
          className="insights-refresh"
          onClick={loadInsights}
        >
          <RefreshCw size={16} />
          Refresh Insights
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="insights-error">
          <AlertTriangle size={18} />
          {error}
        </div>
      )}

      {/* Priority Summary */}
      <div className="insights-summary">

        <div className="insight-summary-card">
          <span className="summary-icon high-icon">
            <AlertTriangle />
          </span>
          <div>
            <h2>{highCount}</h2>
            <p>High Priority</p>
          </div>
        </div>

        <div className="insight-summary-card">
          <span className="summary-icon medium-icon">
            <Info />
          </span>
          <div>
            <h2>{mediumCount}</h2>
            <p>Medium Priority</p>
          </div>
        </div>

        <div className="insight-summary-card">
          <span className="summary-icon low-icon">
            <CheckCircle />
          </span>
          <div>
            <h2>{lowCount}</h2>
            <p>Low Priority</p>
          </div>
        </div>

      </div>

      {/* Recommendations */}
      <div className="insights-section-heading">
        <div>
          <h2>Business Recommendations</h2>
          <p>
            Based on your current products, sales, purchases and expenses.
          </p>
        </div>

        <span className="insights-total">
          {insights.length} Insights
        </span>
      </div>

      {insights.length === 0 ? (
        <div className="insights-empty">
          <Lightbulb size={35} />
          <h3>No insights available</h3>
          <p>
            Add products, sales and expenses to generate
            business recommendations.
          </p>
        </div>
      ) : (
        <div className="insights-grid">

          {insights.map((item, index) => (
            <div
              className={`insight-card ${getPriorityClass(item.priority)}`}
              key={`${item.type}-${index}`}
            >
              <div className="insight-card-top">

                <div className="insight-card-icon">
                  {getIcon(item.type)}
                </div>

                <span
                  className={`priority-badge ${getPriorityClass(
                    item.priority
                  )}`}
                >
                  {item.priority} PRIORITY
                </span>

              </div>

              <h3>{item.title}</h3>

              <p>{item.message}</p>

              <div className="insight-card-footer">
                <span>
                  <Lightbulb size={14} />
                  Business Recommendation
                </span>
              </div>

            </div>
          ))}

        </div>
      )}

      {/* Footer */}
      <div className="insights-note">
        <Info size={16} />
        <p>
          These recommendations are generated using rule-based
          analysis of your recorded business data. They are not
          predictions from a machine learning model.
        </p>
      </div>

    </div>
  );
}

export default BusinessInsights;
