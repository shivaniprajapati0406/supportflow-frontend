import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { apiGet } from "../api/api";

import "./Analytics.css";

function Analytics() {
  const [analytics, setAnalytics] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  // ======================================================
  // LOAD ANALYTICS
  // ======================================================

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError("");

      const data =
        await apiGet(
          "/admin/analytics/summary"
        );

      console.log(
        "Analytics Response:",
        data
      );

      if (
        data &&
        data.success
      ) {
        setAnalytics(data);
      } else {
        setError(
          "Unable to load analytics"
        );
      }
    } catch (error) {
      console.error(
        "Analytics Error:",
        error
      );

      setError(
        error.message ||
          "Failed to load analytics"
      );
    } finally {
      setLoading(false);
    }
  };

  // ======================================================
  // INITIAL LOAD
  // ======================================================

  useEffect(() => {
    loadAnalytics();
  }, []);

  // ======================================================
  // LOADING
  // ======================================================

  if (loading) {
    return (
      <div className="analytics-page">
        <div className="analytics-container">

          <div className="analytics-loading">

            <div className="loading-spinner">
              ⟳
            </div>

            <h2>
              Loading Analytics...
            </h2>

            <p>
              Preparing your support
              analytics.
            </p>

          </div>

        </div>
      </div>
    );
  }

  // ======================================================
  // ERROR
  // ======================================================

  if (error) {
    return (
      <div className="analytics-page">

        <div className="analytics-container">

          <div className="analytics-error">

            <div className="error-icon">
              ⚠️
            </div>

            <h2>
              Analytics Unavailable
            </h2>

            <p>
              {error}
            </p>

            <button
              type="button"
              className="analytics-retry-button"
              onClick={
                loadAnalytics
              }
            >
              🔄 Try Again
            </button>

          </div>

        </div>

      </div>
    );
  }

  if (!analytics) {
    return null;
  }

  // ======================================================
  // DATA
  // ======================================================

  const summary =
    analytics.summary || {};

  const status =
    summary.status || {};

  const priority =
    summary.priority || {};

  const categoryStats =
    analytics.categoryStats || [];

  const recentTickets =
    analytics.recentTickets || [];

  // ======================================================
  // STATUS DATA
  // ======================================================

  const statusData = [
    {
      label: "Open",
      value: status.open || 0,
      className: "open",
    },
    {
      label: "In Progress",
      value:
        status.inProgress || 0,
      className: "in-progress",
    },
    {
      label: "Resolved",
      value:
        status.resolved || 0,
      className: "resolved",
    },
    {
      label: "Closed",
      value:
        status.closed || 0,
      className: "closed",
    },
  ];

  // ======================================================
  // PRIORITY DATA
  // ======================================================

  const priorityData = [
    {
      label: "Low",
      value: priority.low || 0,
      className: "low",
    },
    {
      label: "Medium",
      value:
        priority.medium || 0,
      className: "medium",
    },
    {
      label: "High",
      value: priority.high || 0,
      className: "high",
    },
    {
      label: "Urgent",
      value:
        priority.urgent || 0,
      className: "urgent",
    },
  ];

  // ======================================================
  // MAX CATEGORY
  // ======================================================

  const maxCategory =
    Math.max(
      ...categoryStats.map(
        (item) =>
          item.count
      ),
      1
    );

  // ======================================================
  // DATE FORMAT
  // ======================================================

  const formatDate = (
    date
  ) => {
    if (!date) {
      return "-";
    }

    return new Date(
      date
    ).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  // ======================================================
  // RENDER
  // ======================================================

  return (
    <div className="analytics-page">

      <div className="analytics-container">

        {/* ==================================================
            HEADER
        ================================================== */}

        <div className="analytics-header">

          <div>

            <div className="analytics-eyebrow">
              SUPPORTFLOW ANALYTICS
            </div>

            <h1>
              Analytics Dashboard 📊
            </h1>

            <p>
              Monitor support performance,
              ticket trends and customer
              activity.
            </p>

          </div>

          <div className="analytics-header-actions">

            <button
              type="button"
              className="analytics-refresh-button"
              onClick={
                loadAnalytics
              }
            >
              🔄 Refresh
            </button>

            <Link
              to="/dashboard"
              className="back-dashboard-button"
            >
              ← Dashboard
            </Link>

          </div>

        </div>

        {/* ==================================================
            SUMMARY CARDS
        ================================================== */}

        <div className="analytics-summary-grid">

          <div className="analytics-summary-card">

            <div className="summary-icon">
              🎫
            </div>

            <div>

              <span>
                Total Tickets
              </span>

              <strong>
                {summary.totalTickets ||
                  0}
              </strong>

            </div>

          </div>

          <div className="analytics-summary-card">

            <div className="summary-icon">
              👥
            </div>

            <div>

              <span>
                Customers
              </span>

              <strong>
                {summary.customers ||
                  0}
              </strong>

            </div>

          </div>

          <div className="analytics-summary-card">

            <div className="summary-icon">
              ✅
            </div>

            <div>

              <span>
                Resolved
              </span>

              <strong>
                {status.resolved ||
                  0}
              </strong>

            </div>

          </div>

          <div className="analytics-summary-card">

            <div className="summary-icon">
              🚨
            </div>

            <div>

              <span>
                Urgent
              </span>

              <strong>
                {priority.urgent ||
                  0}
              </strong>

            </div>

          </div>

        </div>

        {/* ==================================================
            STATUS + PRIORITY
        ================================================== */}

        <div className="analytics-two-column">

          {/* STATUS */}

          <section className="analytics-panel">

            <div className="panel-header">

              <div>

                <h2>
                  Ticket Status
                </h2>

                <p>
                  Current ticket distribution
                </p>

              </div>

              <span className="panel-icon">
                📌
              </span>

            </div>

            <div className="status-list">

              {statusData.map(
                (item) => (
                  <div
                    className="status-row"
                    key={
                      item.label
                    }
                  >

                    <div className="status-label">

                      <span
                        className={`status-dot ${item.className}`}
                      />

                      <span>
                        {item.label}
                      </span>

                    </div>

                    <strong>
                      {item.value}
                    </strong>

                  </div>
                )
              )}

            </div>

            <div className="status-total">

              <span>
                Total
              </span>

              <strong>
                {summary.totalTickets ||
                  0}
              </strong>

            </div>

          </section>

          {/* PRIORITY */}

          <section className="analytics-panel">

            <div className="panel-header">

              <div>

                <h2>
                  Ticket Priority
                </h2>

                <p>
                  Priority distribution
                </p>

              </div>

              <span className="panel-icon">
                🎯
              </span>

            </div>

            <div className="priority-list">

              {priorityData.map(
                (item) => {

                  const percentage =
                    summary.totalTickets
                      ? (
                          item.value /
                          summary.totalTickets
                        ) *
                        100
                      : 0;

                  return (
                    <div
                      className="priority-row"
                      key={
                        item.label
                      }
                    >

                      <div className="priority-top">

                        <span>
                          {item.label}
                        </span>

                        <strong>
                          {item.value}
                        </strong>

                      </div>

                      <div className="priority-bar">

                        <div
                          className={`priority-fill ${item.className}`}
                          style={{
                            width: `${percentage}%`,
                          }}
                        />

                      </div>

                    </div>
                  );
                }
              )}

            </div>

          </section>

        </div>

        {/* ==================================================
            CATEGORY
        ================================================== */}

        <section className="analytics-panel category-panel">

          <div className="panel-header">

            <div>

              <h2>
                Tickets by Category
              </h2>

              <p>
                Understand which areas
                generate the most support
                requests.
              </p>

            </div>

            <span className="panel-icon">
              📂
            </span>

          </div>

          {categoryStats.length ===
          0 ? (
            <div className="analytics-empty">
              No category data available.
            </div>
          ) : (
            <div className="category-list">

              {categoryStats.map(
                (item) => {

                  const percentage =
                    (
                      item.count /
                      maxCategory
                    ) *
                    100;

                  return (
                    <div
                      className="category-row"
                      key={
                        item._id
                      }
                    >

                      <div className="category-info">

                        <span>
                          {item._id ||
                            "Other"}
                        </span>

                        <strong>
                          {item.count}
                        </strong>

                      </div>

                      <div className="category-bar">

                        <div
                          className="category-fill"
                          style={{
                            width: `${percentage}%`,
                          }}
                        />

                      </div>

                    </div>
                  );
                }
              )}

            </div>
          )}

        </section>

        {/* ==================================================
            RECENT TICKETS
        ================================================== */}

        <section className="analytics-panel recent-panel">

          <div className="panel-header">

            <div>

              <h2>
                Recent Tickets
              </h2>

              <p>
                Latest customer support
                requests.
              </p>

            </div>

            <Link
              to="/dashboard"
              className="view-all-link"
            >
              View All →
            </Link>

          </div>

          {recentTickets.length ===
          0 ? (
            <div className="analytics-empty">
              No tickets available.
            </div>
          ) : (
            <div className="recent-tickets">

              {recentTickets.map(
                (ticket) => (
                  <Link
                    key={
                      ticket._id
                    }
                    to={`/ticket/${ticket._id}`}
                    className="recent-ticket"
                  >

                    <div className="recent-ticket-main">

                      <div className="ticket-mini-icon">
                        🎫
                      </div>

                      <div>

                        <h3>
                          {ticket.title}
                        </h3>

                        <p>
                          {ticket.userId?.name ||
                            "Customer"}
                        </p>

                      </div>

                    </div>

                    <div className="recent-ticket-meta">

                      <span
                        className={`ticket-status ${
                          ticket.status
                            ?.toLowerCase()
                            .replace(
                              /\s+/g,
                              "-"
                            )
                        }`}
                      >
                        {ticket.status}
                      </span>

                      <span
                        className={`ticket-priority ${
                          ticket.priority
                            ?.toLowerCase()
                        }`}
                      >
                        {ticket.priority}
                      </span>

                      <small>
                        {formatDate(
                          ticket.createdAt
                        )}
                      </small>

                    </div>

                  </Link>
                )
              )}

            </div>
          )}

        </section>

        {/* ==================================================
            FOOTER STATS
        ================================================== */}

        <div className="analytics-footer-stats">

          <div>

            <span>
              👨‍💼
            </span>

            <div>

              <small>
                Admins
              </small>

              <strong>
                {summary.admins ||
                  0}
              </strong>

            </div>

          </div>

          <div>

            <span>
              🟢
            </span>

            <div>

              <small>
                Open Tickets
              </small>

              <strong>
                {status.open ||
                  0}
              </strong>

            </div>

          </div>

          <div>

            <span>
              🔵
            </span>

            <div>

              <small>
                Resolved Tickets
              </small>

              <strong>
                {status.resolved ||
                  0}
              </strong>

            </div>

          </div>

          <div>

            <span>
              ⚡
            </span>

            <div>

              <small>
                High Priority
              </small>

              <strong>
                {priority.high ||
                  0}
              </strong>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Analytics;