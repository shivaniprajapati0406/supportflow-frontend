import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AgentDashboard.css";

const API_BASE_URL =
  "http://localhost:5000/api";

function AgentDashboard() {
  const navigate = useNavigate();

  const [dashboard, setDashboard] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  // ==========================================================
  // GET TOKEN
  // ==========================================================

  const getToken = () => {
    return localStorage.getItem("token");
  };

  // ==========================================================
  // FETCH AGENT DASHBOARD
  // ==========================================================

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const token =
        getToken();

      if (!token) {
        setError(
          "Authentication token not found."
        );

        setLoading(false);
        return;
      }

      const response =
        await fetch(
          `${API_BASE_URL}/admin/agent-dashboard`,
          {
            method: "GET",

            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to load agent dashboard"
        );
      }

      setDashboard(data);

    } catch (error) {

      console.error(
        "Agent Dashboard Error:",
        error
      );

      setError(
        error.message ||
          "Something went wrong."
      );

    } finally {
      setLoading(false);
    }
  };

  // ==========================================================
  // INITIAL LOAD
  // ==========================================================

  useEffect(() => {
    fetchDashboard();
  }, []);

  // ==========================================================
  // STATUS CLASS
  // ==========================================================

  const getStatusClass = (
    status
  ) => {
    switch (status) {

      case "Open":
        return "status-open";

      case "In Progress":
        return "status-progress";

      case "Waiting for Customer":
        return "status-waiting";

      case "Resolved":
        return "status-resolved";

      case "Closed":
        return "status-closed";

      default:
        return "";
    }
  };

  // ==========================================================
  // PRIORITY CLASS
  // ==========================================================

  const getPriorityClass = (
    priority
  ) => {
    switch (priority) {

      case "Urgent":
      case "Critical":
        return "priority-urgent";

      case "High":
        return "priority-high";

      case "Medium":
        return "priority-medium";

      case "Low":
        return "priority-low";

      default:
        return "";
    }
  };

  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {
    return (
      <div className="agent-page">

        <div className="agent-loading">

          <div className="agent-spinner">
          </div>

          <h3>
            Loading Agent Dashboard...
          </h3>

          <p>
            Please wait.
          </p>

        </div>

      </div>
    );
  }

  // ==========================================================
  // ERROR
  // ==========================================================

  if (error) {
    return (
      <div className="agent-page">

        <div className="agent-error">

          <h2>
            Unable to Load Dashboard
          </h2>

          <p>
            {error}
          </p>

          <button
            type="button"
            onClick={fetchDashboard}
            className="agent-button"
          >
            Try Again
          </button>

        </div>

      </div>
    );
  }

  // ==========================================================
  // DATA
  // ==========================================================

  const summary =
    dashboard?.summary || {};

  const tickets =
    dashboard?.assignedTickets || [];

  // ==========================================================
  // DISPLAY VALUES
  // ==========================================================

  const totalAssigned =
    summary.totalAssigned || 0;

  const pendingTickets =
    summary.pendingTickets || 0;

  const resolvedTickets =
    summary.resolvedTickets || 0;

  const closedTickets =
    summary.closedTickets || 0;

  const averageResponseTime =
    summary.averageResponseTime ||
    "N/A";

  const averageResolutionTime =
    summary.averageResolutionTime ||
    "N/A";

  // ==========================================================
  // MAIN UI
  // ==========================================================

  return (
    <div className="agent-page">

      {/* ====================================================
          HEADER
      ==================================================== */}

      <div className="agent-header">

        <div>

          <div className="dashboard-eyebrow">
            SUPPORTFLOW
          </div>

          <h1>
            Support Agent Dashboard
          </h1>

          <p>
            Manage your assigned customer
            support tickets and track your
            performance.
          </p>

        </div>

        <button
          type="button"
          className="agent-refresh-button"
          onClick={fetchDashboard}
        >
          ↻ Refresh
        </button>

      </div>


      {/* ====================================================
          SUMMARY CARDS
      ==================================================== */}

      <div className="agent-summary-grid">

        {/* TOTAL ASSIGNED */}

        <div className="agent-card">

          <div className="agent-card-icon">
            🎫
          </div>

          <div>

            <p>
              Total Assigned
            </p>

            <h2>
              {totalAssigned}
            </h2>

          </div>

        </div>


        {/* PENDING */}

        <div className="agent-card">

          <div className="agent-card-icon">
            ⏳
          </div>

          <div>

            <p>
              Pending Tickets
            </p>

            <h2>
              {pendingTickets}
            </h2>

          </div>

        </div>


        {/* RESOLVED */}

        <div className="agent-card">

          <div className="agent-card-icon">
            ✅
          </div>

          <div>

            <p>
              Resolved
            </p>

            <h2>
              {resolvedTickets}
            </h2>

          </div>

        </div>


        {/* CLOSED */}

        <div className="agent-card">

          <div className="agent-card-icon">
            🔒
          </div>

          <div>

            <p>
              Closed
            </p>

            <h2>
              {closedTickets}
            </h2>

          </div>

        </div>


        {/* ==================================================
            AVERAGE RESPONSE TIME
        ================================================== */}

        <div className="agent-card">

          <div className="agent-card-icon">
            ⚡
          </div>

          <div>

            <p>
              Avg. Response Time
            </p>

            <h2 className="agent-metric-value">
              {averageResponseTime}
            </h2>

            <small>
              First agent response
            </small>

          </div>

        </div>


        {/* ==================================================
            AVERAGE RESOLUTION TIME
        ================================================== */}

        <div className="agent-card">

          <div className="agent-card-icon">
            🕐
          </div>

          <div>

            <p>
              Avg. Resolution Time
            </p>

            <h2 className="agent-metric-value">
              {averageResolutionTime}
            </h2>

            <small>
              Ticket creation to resolution
            </small>

          </div>

        </div>

      </div>


      {/* ====================================================
          PERFORMANCE INFORMATION
      ==================================================== */}

      <div className="agent-performance-info">

        <div>

          <strong>
            Response Time Tickets
          </strong>

          <span>
            {summary.responseTimeTicketCount ||
              0}
          </span>

        </div>

        <div>

          <strong>
            Resolution Time Tickets
          </strong>

          <span>
            {summary.resolutionTimeTicketCount ||
              0}
          </span>

        </div>

      </div>


      {/* ====================================================
          ASSIGNED TICKETS
      ==================================================== */}

      <div className="agent-tickets-section">

        {/* SECTION HEADER */}

        <div className="agent-section-header">

          <div>

            <h2>
              My Assigned Tickets
            </h2>

            <p>
              Tickets currently assigned
              to you
            </p>

          </div>

          <span className="ticket-count">
            {tickets.length} Tickets
          </span>

        </div>


        {/* ==================================================
            EMPTY STATE
        ================================================== */}

        {tickets.length === 0 ? (

          <div className="agent-empty">

            <div className="empty-icon">
              🎉
            </div>

            <h3>
              No Tickets Assigned
            </h3>

            <p>
              You currently don't have
              any tickets assigned to you.
            </p>

          </div>

        ) : (

          /* ==================================================
             TABLE
          ================================================== */

          <div className="agent-table-wrapper">

            <table className="agent-table">

              <thead>

                <tr>

                  <th>
                    Subject
                  </th>

                  <th>
                    Customer
                  </th>

                  <th>
                    Category
                  </th>

                  <th>
                    Priority
                  </th>

                  <th>
                    Status
                  </th>

                  <th>
                    Created
                  </th>

                  <th>
                    Updated
                  </th>

                  <th>
                    Action
                  </th>

                </tr>

              </thead>


              <tbody>

                {tickets.map(
                  (ticket) => (

                    <tr
                      key={
                        ticket._id
                      }
                    >

                      {/* ==================================
                          SUBJECT
                      ================================== */}

                      <td>

                        <div className="ticket-subject">

                          <strong>

                            {ticket.title ||
                              ticket.subject ||
                              "Untitled Ticket"}

                          </strong>

                          <small>
                            #
                            {ticket._id}
                          </small>

                        </div>

                      </td>


                      {/* ==================================
                          CUSTOMER
                      ================================== */}

                      <td>

                        <div className="customer-info">

                          <strong>

                            {ticket.userId?.name ||
                              "Unknown Customer"}

                          </strong>

                          <small>

                            {ticket.userId?.email ||
                              "No email"}

                          </small>

                        </div>

                      </td>


                      {/* ==================================
                          CATEGORY
                      ================================== */}

                      <td>

                        <span className="category-badge">

                          {ticket.category ||
                            "General Inquiry"}

                        </span>

                      </td>


                      {/* ==================================
                          PRIORITY
                      ================================== */}

                      <td>

                        <span
                          className={
                            `priority-badge ${
                              getPriorityClass(
                                ticket.priority
                              )
                            }`
                          }
                        >

                          {ticket.priority ||
                            "Medium"}

                        </span>

                      </td>


                      {/* ==================================
                          STATUS
                      ================================== */}

                      <td>

                        <span
                          className={
                            `status-badge ${
                              getStatusClass(
                                ticket.status
                              )
                            }`
                          }
                        >

                          {ticket.status ||
                            "Open"}

                        </span>

                      </td>


                      {/* ==================================
                          CREATED
                      ================================== */}

                      <td>

                        <span className="updated-date">

                          {ticket.createdAt
                            ? new Date(
                                ticket.createdAt
                              ).toLocaleDateString(
                                "en-IN",
                                {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                }
                              )
                            : "-"}

                        </span>

                      </td>


                      {/* ==================================
                          UPDATED
                      ================================== */}

                      <td>

                        <span className="updated-date">

                          {ticket.updatedAt
                            ? new Date(
                                ticket.updatedAt
                              ).toLocaleDateString(
                                "en-IN",
                                {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                }
                              )
                            : "-"}

                        </span>

                      </td>


                      {/* ==================================
                          ACTION
                      ================================== */}

                      <td>

                        <button
                          type="button"
                          className="view-ticket-button"
                          onClick={() =>
                            navigate(
                              `/ticket/${ticket._id}`
                            )
                          }
                        >
                          View Ticket →
                        </button>

                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        )}

      </div>

    </div>
  );
}

export default AgentDashboard;