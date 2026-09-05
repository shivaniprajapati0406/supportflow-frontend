import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  apiGet,
  apiPut,
  apiDelete,
} from "../api/api";

import "./Dashboard.css";

function Dashboard() {
  const navigate = useNavigate();

  const [tickets, setTickets] = useState([]);
  const [admins, setAdmins] = useState([]);

  const [loading, setLoading] = useState(true);
  const [adminsLoading, setAdminsLoading] = useState(true);

  const [updatingId, setUpdatingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [assigningId, setAssigningId] = useState(null);

  // ==========================================================
  // SEARCH + FILTER STATE
  // ==========================================================

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] =
    useState("All Status");

  const [priorityFilter, setPriorityFilter] =
    useState("All Priority");

  const [categoryFilter, setCategoryFilter] =
    useState("All Categories");

  const [sortOrder, setSortOrder] =
    useState("Newest First");

  // ==========================================================
  // FETCH ALL TICKETS
  // ==========================================================

  const fetchTickets = async () => {
    try {
      setLoading(true);

      const data = await apiGet(
        "/admin/tickets"
      );

      setTickets(
        data?.tickets || []
      );
    } catch (error) {
      console.error(
        "Fetch Tickets Error:",
        error
      );

      alert(
        error.message ||
          "Unable to load support tickets"
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================================
  // FETCH ALL ADMINS
  // ==========================================================

  const fetchAdmins = async () => {
    try {
      setAdminsLoading(true);

      const data = await apiGet(
        "/admin/admins"
      );

      setAdmins(
        data?.admins || []
      );
    } catch (error) {
      console.error(
        "Fetch Admins Error:",
        error
      );

      alert(
        error.message ||
          "Unable to load admin users"
      );
    } finally {
      setAdminsLoading(false);
    }
  };

  // ==========================================================
  // INITIAL LOAD
  // ==========================================================

  useEffect(() => {
    fetchTickets();
    fetchAdmins();
  }, []);

  // ==========================================================
  // UPDATE STATUS
  // ==========================================================

  const updateStatus = async (
    ticketId,
    newStatus
  ) => {
    try {
      setUpdatingId(ticketId);

      const data = await apiPut(
        `/admin/tickets/${ticketId}/status`,
        {
          status: newStatus,
        }
      );

      setTickets(
        (previousTickets) =>
          previousTickets.map(
            (ticket) =>
              ticket._id === ticketId
                ? {
                    ...ticket,
                    status:
                      data?.ticket?.status ||
                      newStatus,
                  }
                : ticket
          )
      );
    } catch (error) {
      console.error(
        "Update Status Error:",
        error
      );

      alert(
        error.message ||
          "Failed to update status"
      );
    } finally {
      setUpdatingId(null);
    }
  };

  // ==========================================================
  // UPDATE PRIORITY
  // ==========================================================

  const updatePriority = async (
    ticketId,
    newPriority
  ) => {
    try {
      setUpdatingId(ticketId);

      const data = await apiPut(
        `/admin/tickets/${ticketId}/priority`,
        {
          priority: newPriority,
        }
      );

      setTickets(
        (previousTickets) =>
          previousTickets.map(
            (ticket) =>
              ticket._id === ticketId
                ? {
                    ...ticket,
                    priority:
                      data?.ticket?.priority ||
                      newPriority,
                  }
                : ticket
          )
      );
    } catch (error) {
      console.error(
        "Update Priority Error:",
        error
      );

      alert(
        error.message ||
          "Failed to update priority"
      );
    } finally {
      setUpdatingId(null);
    }
  };

  // ==========================================================
  // ASSIGN TICKET
  // ==========================================================

  const assignTicket = async (
    ticketId,
    assignedTo
  ) => {
    try {
      setAssigningId(ticketId);

      const selectedAdminId =
        assignedTo === ""
          ? null
          : assignedTo;

      const data = await apiPut(
        `/admin/tickets/${ticketId}/assign`,
        {
          assignedTo: selectedAdminId,
        }
      );

      setTickets(
        (previousTickets) =>
          previousTickets.map(
            (ticket) =>
              ticket._id === ticketId
                ? {
                    ...ticket,
                    assignedTo:
                      data?.ticket?.assignedTo ||
                      null,
                  }
                : ticket
          )
      );

      if (data?.message) {
        console.log(data.message);
      }
    } catch (error) {
      console.error(
        "Assign Ticket Error:",
        error
      );

      alert(
        error.message ||
          "Failed to assign ticket"
      );
    } finally {
      setAssigningId(null);
    }
  };

  // ==========================================================
  // DELETE TICKET
  // ==========================================================

  const deleteTicket = async (
    ticketId
  ) => {
    const confirmDelete =
      window.confirm(
        "Are you sure you want to delete this ticket?"
      );

    if (!confirmDelete) {
      return;
    }

    try {
      setDeletingId(ticketId);

      await apiDelete(
        `/admin/tickets/${ticketId}`
      );

      setTickets(
        (previousTickets) =>
          previousTickets.filter(
            (ticket) =>
              ticket._id !== ticketId
          )
      );

      alert(
        "Ticket deleted successfully! 🗑️"
      );
    } catch (error) {
      console.error(
        "Delete Ticket Error:",
        error
      );

      alert(
        error.message ||
          "Failed to delete ticket"
      );
    } finally {
      setDeletingId(null);
    }
  };

  // ==========================================================
  // STATISTICS
  // ==========================================================

  const totalTickets =
    tickets.length;

  const openTickets =
    tickets.filter(
      (ticket) =>
        ticket.status === "Open"
    ).length;

  const inProgressTickets =
    tickets.filter(
      (ticket) =>
        ticket.status === "In Progress"
    ).length;

  const resolvedTickets =
    tickets.filter(
      (ticket) =>
        ticket.status === "Resolved"
    ).length;

  const closedTickets =
    tickets.filter(
      (ticket) =>
        ticket.status === "Closed"
    ).length;

  const urgentTickets =
    tickets.filter(
      (ticket) =>
        ticket.priority === "Urgent"
    ).length;

  // ==========================================================
  // GET CATEGORIES
  // ==========================================================

  const categories = useMemo(() => {
    const categorySet =
      new Set();

    tickets.forEach((ticket) => {
      if (ticket.category) {
        categorySet.add(
          ticket.category
        );
      }
    });

    return Array.from(
      categorySet
    ).sort((a, b) =>
      a.localeCompare(b)
    );
  }, [tickets]);

  // ==========================================================
  // SEARCH + FILTER + SORT
  // ==========================================================

  const filteredTickets = useMemo(() => {
    const searchText =
      search.trim().toLowerCase();

    const result =
      tickets.filter((ticket) => {
        const title =
          ticket.title
            ?.toLowerCase() || "";

        const description =
          ticket.description
            ?.toLowerCase() || "";

        const customerName =
          ticket.userId?.name
            ?.toLowerCase() || "";

        const customerEmail =
          ticket.userId?.email
            ?.toLowerCase() || "";

        const category =
          ticket.category
            ?.toLowerCase() || "";

        const assignedAdminName =
          ticket.assignedTo?.name
            ?.toLowerCase() || "";

        const assignedAdminEmail =
          ticket.assignedTo?.email
            ?.toLowerCase() || "";

        const matchesSearch =
          searchText === "" ||
          title.includes(
            searchText
          ) ||
          description.includes(
            searchText
          ) ||
          customerName.includes(
            searchText
          ) ||
          customerEmail.includes(
            searchText
          ) ||
          category.includes(
            searchText
          ) ||
          assignedAdminName.includes(
            searchText
          ) ||
          assignedAdminEmail.includes(
            searchText
          );

        const matchesStatus =
          statusFilter ===
            "All Status" ||
          ticket.status ===
            statusFilter;

        const matchesPriority =
          priorityFilter ===
            "All Priority" ||
          ticket.priority ===
            priorityFilter;

        const matchesCategory =
          categoryFilter ===
            "All Categories" ||
          ticket.category ===
            categoryFilter;

        return (
          matchesSearch &&
          matchesStatus &&
          matchesPriority &&
          matchesCategory
        );
      });

    // ========================================================
    // SORT
    // ========================================================

    result.sort((a, b) => {
      const dateA = new Date(
        a.createdAt || 0
      ).getTime();

      const dateB = new Date(
        b.createdAt || 0
      ).getTime();

      if (
        sortOrder ===
        "Newest First"
      ) {
        return dateB - dateA;
      }

      if (
        sortOrder ===
        "Oldest First"
      ) {
        return dateA - dateB;
      }

      if (
        sortOrder ===
        "Priority: High to Low"
      ) {
        const priorityRank = {
          Urgent: 4,
          High: 3,
          Medium: 2,
          Low: 1,
        };

        return (
          (priorityRank[
            b.priority
          ] || 0) -
          (priorityRank[
            a.priority
          ] || 0)
        );
      }

      if (
        sortOrder ===
        "Priority: Low to High"
      ) {
        const priorityRank = {
          Urgent: 4,
          High: 3,
          Medium: 2,
          Low: 1,
        };

        return (
          (priorityRank[
            a.priority
          ] || 0) -
          (priorityRank[
            b.priority
          ] || 0)
        );
      }

      return 0;
    });

    return result;
  }, [
    tickets,
    search,
    statusFilter,
    priorityFilter,
    categoryFilter,
    sortOrder,
  ]);

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

      case "Resolved":
        return "status-resolved";

      case "Closed":
        return "status-closed";

      default:
        return "status-open";
    }
  };

  // ==========================================================
  // PRIORITY CLASS
  // ==========================================================

  const getPriorityClass = (
    priority
  ) => {
    switch (priority) {
      case "Low":
        return "priority-low";

      case "Medium":
        return "priority-medium";

      case "High":
        return "priority-high";

      case "Urgent":
        return "priority-urgent";

      default:
        return "priority-medium";
    }
  };

  // ==========================================================
  // RESET FILTERS
  // ==========================================================

  const resetFilters = () => {
    setSearch("");

    setStatusFilter(
      "All Status"
    );

    setPriorityFilter(
      "All Priority"
    );

    setCategoryFilter(
      "All Categories"
    );

    setSortOrder(
      "Newest First"
    );
  };

  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {
    return (
      <div className="admin-dashboard">
        <div className="dashboard-message">
          <div className="loading-icon">
            ⏳
          </div>

          <h2>
            Loading Tickets...
          </h2>

          <p>
            Please wait while tickets
            are loading.
          </p>
        </div>
      </div>
    );
  }

  // ==========================================================
  // MAIN DASHBOARD
  // ==========================================================

  return (
    <div className="admin-dashboard">

      {/* ====================================================
          HEADER
      ==================================================== */}

      <div className="admin-dashboard-header">

        <div>
          <div className="dashboard-eyebrow">
            SUPPORTFLOW ADMIN
          </div>

          <h1>
            Admin Support Dashboard 🛠️
          </h1>

          <p>
            Manage and monitor all
            customer support tickets
            from one place.
          </p>
        </div>

        <button
          type="button"
          className="refresh-btn"
          onClick={() => {
            fetchTickets();
            fetchAdmins();
          }}
        >
          🔄 Refresh
        </button>

      </div>

      {/* ====================================================
          STATISTICS
      ==================================================== */}

      <div className="stats-grid">

        <div className="stat-card">
          <div className="stat-icon">
            🎫
          </div>

          <div>
            <span>
              Total Tickets
            </span>

            <strong>
              {totalTickets}
            </strong>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            🟢
          </div>

          <div>
            <span>
              Open
            </span>

            <strong>
              {openTickets}
            </strong>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            🟡
          </div>

          <div>
            <span>
              In Progress
            </span>

            <strong>
              {inProgressTickets}
            </strong>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            🔵
          </div>

          <div>
            <span>
              Resolved
            </span>

            <strong>
              {resolvedTickets}
            </strong>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            🚨
          </div>

          <div>
            <span>
              Urgent
            </span>

            <strong>
              {urgentTickets}
            </strong>
          </div>
        </div>

      </div>

      {/* ====================================================
          SEARCH + FILTER PANEL
      ==================================================== */}

      <div className="advanced-filter-card">

        <div className="filter-heading">

          <div>
            <h2>
              Find Tickets
            </h2>

            <p>
              Search and filter support
              tickets quickly.
            </p>
          </div>

          <button
            type="button"
            className="reset-filter-btn"
            onClick={resetFilters}
          >
            ↻ Reset Filters
          </button>

        </div>

        <div className="filter-section">

          {/* SEARCH */}

          <div className="filter-control search-control">

            <label>
              Search
            </label>

            <input
              type="text"
              className="search-input"
              placeholder="🔍 Search title, customer, email, admin..."
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
            />

          </div>

          {/* STATUS */}

          <div className="filter-control">

            <label>
              Status
            </label>

            <select
              className="filter-select"
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(
                  e.target.value
                )
              }
            >
              <option>
                All Status
              </option>

              <option>
                Open
              </option>

              <option>
                In Progress
              </option>

              <option>
                Resolved
              </option>

              <option>
                Closed
              </option>

            </select>

          </div>

          {/* PRIORITY */}

          <div className="filter-control">

            <label>
              Priority
            </label>

            <select
              className="filter-select"
              value={priorityFilter}
              onChange={(e) =>
                setPriorityFilter(
                  e.target.value
                )
              }
            >
              <option>
                All Priority
              </option>

              <option>
                Low
              </option>

              <option>
                Medium
              </option>

              <option>
                High
              </option>

              <option>
                Urgent
              </option>

            </select>

          </div>

          {/* CATEGORY */}

          <div className="filter-control">

            <label>
              Category
            </label>

            <select
              className="filter-select"
              value={categoryFilter}
              onChange={(e) =>
                setCategoryFilter(
                  e.target.value
                )
              }
            >
              <option>
                All Categories
              </option>

              {categories.map(
                (category) => (
                  <option
                    key={category}
                    value={category}
                  >
                    {category}
                  </option>
                )
              )}

            </select>

          </div>

          {/* SORT */}

          <div className="filter-control">

            <label>
              Sort By
            </label>

            <select
              className="filter-select"
              value={sortOrder}
              onChange={(e) =>
                setSortOrder(
                  e.target.value
                )
              }
            >
              <option>
                Newest First
              </option>

              <option>
                Oldest First
              </option>

              <option>
                Priority: High to Low
              </option>

              <option>
                Priority: Low to High
              </option>

            </select>

          </div>

        </div>

      </div>

      {/* ====================================================
          RESULTS
      ==================================================== */}

      <div className="results-bar">

        <div className="results-info">
          Showing{" "}
          <strong>
            {filteredTickets.length}
          </strong>{" "}
          of{" "}
          <strong>
            {tickets.length}
          </strong>{" "}
          tickets
        </div>

        {(search ||
          statusFilter !==
            "All Status" ||
          priorityFilter !==
            "All Priority" ||
          categoryFilter !==
            "All Categories") && (
          <div className="filter-active-label">
            Filters active
          </div>
        )}

      </div>

      {/* ====================================================
          NO TICKETS
      ==================================================== */}

      {tickets.length === 0 && (
        <div className="dashboard-message">

          <div className="empty-icon">
            🎫
          </div>

          <h2>
            No Tickets Found
          </h2>

          <p>
            There are currently no
            support tickets.
          </p>

        </div>
      )}

      {/* ====================================================
          NO SEARCH RESULT
      ==================================================== */}

      {tickets.length > 0 &&
        filteredTickets.length ===
          0 && (
          <div className="dashboard-message">

            <div className="empty-icon">
              🔍
            </div>

            <h2>
              No Matching Tickets
            </h2>

            <p>
              Try changing your search
              or filters.
            </p>

            <button
              type="button"
              className="reset-empty-btn"
              onClick={resetFilters}
            >
              Clear Filters
            </button>

          </div>
        )}

      {/* ====================================================
          TICKET LIST
      ==================================================== */}

      {filteredTickets.length > 0 && (
        <div className="admin-ticket-list">

          {filteredTickets.map(
            (ticket) => (

            <div
              className="admin-ticket-card"
              key={ticket._id}
            >

              {/* ==========================================
                  HEADER
              ========================================== */}

              <div className="admin-card-header">

                <div className="ticket-title-area">

                  <h2>
                    {ticket.title}
                  </h2>

                  <small>
                    Ticket ID:{" "}
                    {ticket._id}
                  </small>

                </div>

                <span
                  className={`status-badge ${getStatusClass(
                    ticket.status
                  )}`}
                >
                  {ticket.status ||
                    "Open"}
                </span>

              </div>

              {/* ==========================================
                  CUSTOMER
              ========================================== */}

              <div className="customer-section">

                <h3>
                  👤 Customer
                </h3>

                <div className="customer-details">

                  <p>
                    <strong>
                      Name:
                    </strong>{" "}
                    {ticket.userId?.name ||
                      "Unknown"}
                  </p>

                  <p>
                    <strong>
                      Email:
                    </strong>{" "}
                    {ticket.userId?.email ||
                      "Unknown"}
                  </p>

                </div>

              </div>

              {/* ==========================================
                  DESCRIPTION
              ========================================== */}

              <div className="description-section">

                <h3>
                  Description
                </h3>

                <p>
                  {ticket.description}
                </p>

              </div>

              {/* ==========================================
                  DETAILS
              ========================================== */}

              <div className="ticket-details-grid">

                <div>
                  <span>
                    Category
                  </span>

                  <strong>
                    {ticket.category ||
                      "General"}
                  </strong>
                </div>

                <div>
                  <span>
                    Priority
                  </span>

                  <strong
                    className={`priority-text ${getPriorityClass(
                      ticket.priority
                    )}`}
                  >
                    {ticket.priority ||
                      "Medium"}
                  </strong>
                </div>

                <div>
                  <span>
                    Created
                  </span>

                  <strong>
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
                      : "N/A"}
                  </strong>
                </div>

              </div>

              {/* ==========================================
                  ASSIGNMENT
              ========================================== */}

              <div className="ticket-assignment-section">

                <div className="assignment-header">

                  <div>
                    <span className="assignment-label">
                      👨‍💼 Assigned Support Agent
                    </span>

                    <p className="assignment-description">
                      Assign this ticket to an
                      admin/support agent.
                    </p>
                  </div>

                  {ticket.assignedTo && (
                    <span className="assigned-status">
                      ✓ Assigned
                    </span>
                  )}

                </div>

                <div className="assignment-control">

                  <select
                    className="assignment-select"
                    value={
                      ticket.assignedTo?._id ||
                      ticket.assignedTo ||
                      ""
                    }
                    disabled={
                      assigningId ===
                        ticket._id ||
                      deletingId ===
                        ticket._id ||
                      adminsLoading
                    }
                    onChange={(e) =>
                      assignTicket(
                        ticket._id,
                        e.target.value
                      )
                    }
                  >

                    <option value="">
                      {adminsLoading
                        ? "Loading Admins..."
                        : "Unassigned"}
                    </option>

                    {admins.map(
                      (admin) => (
                        <option
                          key={admin._id}
                          value={admin._id}
                        >
                          {admin.name} —{" "}
                          {admin.email}
                        </option>
                      )
                    )}

                  </select>

                  {assigningId ===
                    ticket._id && (
                    <span className="assigning-text">
                      Assigning...
                    </span>
                  )}

                </div>

                {ticket.assignedTo && (
                  <div className="assigned-agent-card">

                    <div className="assigned-agent-icon">
                      👨‍💼
                    </div>

                    <div className="assigned-agent-info">

                      <strong>
                        {ticket.assignedTo?.name ||
                          "Admin"}
                      </strong>

                      <span>
                        {ticket.assignedTo?.email ||
                          "Support Agent"}
                      </span>

                    </div>

                    <button
                      type="button"
                      className="unassign-btn"
                      disabled={
                        assigningId ===
                        ticket._id
                      }
                      onClick={() =>
                        assignTicket(
                          ticket._id,
                          ""
                        )
                      }
                    >
                      Unassign
                    </button>

                  </div>
                )}

                {!ticket.assignedTo &&
                  !adminsLoading &&
                  admins.length === 0 && (
                    <p className="no-admins-message">
                      ⚠️ No admin users found.
                    </p>
                  )}

              </div>

              {/* ==========================================
                  STATUS + PRIORITY
              ========================================== */}

              <div className="status-update">

                <div className="update-control">

                  <label>
                    Status
                  </label>

                  <select
                    value={
                      ticket.status ||
                      "Open"
                    }
                    disabled={
                      updatingId ===
                        ticket._id ||
                      deletingId ===
                        ticket._id ||
                      assigningId ===
                        ticket._id
                    }
                    onChange={(e) =>
                      updateStatus(
                        ticket._id,
                        e.target.value
                      )
                    }
                  >
                    <option>
                      Open
                    </option>

                    <option>
                      In Progress
                    </option>

                    <option>
                      Resolved
                    </option>

                    <option>
                      Closed
                    </option>
                  </select>

                </div>

                <div className="update-control">

                  <label>
                    Priority
                  </label>

                  <select
                    value={
                      ticket.priority ||
                      "Medium"
                    }
                    disabled={
                      updatingId ===
                        ticket._id ||
                      deletingId ===
                        ticket._id ||
                      assigningId ===
                        ticket._id
                    }
                    onChange={(e) =>
                      updatePriority(
                        ticket._id,
                        e.target.value
                      )
                    }
                  >
                    <option>
                      Low
                    </option>

                    <option>
                      Medium
                    </option>

                    <option>
                      High
                    </option>

                    <option>
                      Urgent
                    </option>
                  </select>

                </div>

                {updatingId ===
                  ticket._id && (
                  <span className="updating-text">
                    Updating...
                  </span>
                )}

              </div>

              {/* ==========================================
                  ACTION BUTTONS
              ========================================== */}

              <div className="ticket-action-buttons">

                <button
                  type="button"
                  className="view-ticket-btn"
                  onClick={() =>
                    navigate(
                      `/ticket/${ticket._id}`
                    )
                  }
                >
                  💬 View & Reply
                </button>

                <button
                  type="button"
                  className="delete-ticket-btn"
                  disabled={
                    deletingId ===
                      ticket._id ||
                    updatingId ===
                      ticket._id ||
                    assigningId ===
                      ticket._id
                  }
                  onClick={() =>
                    deleteTicket(
                      ticket._id
                    )
                  }
                >
                  {deletingId ===
                  ticket._id
                    ? "Deleting..."
                    : "🗑️ Delete"}
                </button>

              </div>

            </div>

          ))}

        </div>
      )}

    </div>
  );
}

export default Dashboard;