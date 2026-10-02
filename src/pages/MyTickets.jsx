import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiGet } from "../api/api";
import "./MyTickets.css";

function MyTickets() {
  const navigate = useNavigate();

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  // ==================================================
  // FILTER STATES
  // ==================================================

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] =
    useState("All");

  const [priorityFilter, setPriorityFilter] =
    useState("All");

  const [statusFilter, setStatusFilter] =
    useState("All");

  const [sortBy, setSortBy] =
    useState("newest");

  const [refreshing, setRefreshing] =
    useState(false);

  // ==================================================
  // FETCH TICKETS
  // ==================================================

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const userData =
        localStorage.getItem("user");

      if (!userData) {
        alert("Please login first");
        navigate("/login");
        return;
      }

      let user;

      try {
        user = JSON.parse(userData);
      } catch (error) {
        console.error(
          "Invalid user data:",
          error
        );

        localStorage.removeItem("user");
        localStorage.removeItem("token");

        alert(
          "Session expired. Please login again."
        );

        navigate("/login");
        return;
      }

      const userId =
        user._id || user.id;

      if (!userId) {
        alert(
          "User ID not found. Please login again."
        );

        localStorage.removeItem("user");
        localStorage.removeItem("token");

        navigate("/login");
        return;
      }

      const token =
        localStorage.getItem("token");

      if (!token) {
        alert(
          "Authentication token not found. Please login again."
        );

        localStorage.removeItem("user");

        navigate("/login");
        return;
      }

      setLoading(true);

      const data = await apiGet(
        `/tickets/user/${userId}`
      );

      console.log(
        "My Tickets:",
        data
      );

      setTickets(
        Array.isArray(data?.tickets)
          ? data.tickets
          : []
      );

    } catch (error) {
      console.error(
        "My Tickets Error:",
        error
      );

      alert(
        error.message ||
          "Failed to load tickets"
      );

    } finally {
      setLoading(false);
    }
  };

  // ==================================================
  // REFRESH
  // ==================================================

  const handleRefresh = async () => {
    setRefreshing(true);

    await fetchTickets();

    setRefreshing(false);
  };

  // ==================================================
  // NORMALIZE STATUS
  // ==================================================

  const getStatus = (ticket) => {
    return ticket?.status || "Open";
  };

  // ==================================================
  // NORMALIZE CATEGORY
  // ==================================================

  const getCategory = (ticket) => {
    return ticket?.category || "General";
  };

  // ==================================================
  // NORMALIZE PRIORITY
  // ==================================================

  const getPriority = (ticket) => {
    return ticket?.priority || "Medium";
  };

  // ==================================================
  // FORMAT DATE
  // ==================================================

  const formatDate = (date) => {
    if (!date) {
      return "N/A";
    }

    return new Date(
      date
    ).toLocaleDateString(
      "en-US",
      {
        month: "numeric",
        day: "numeric",
        year: "numeric",
      }
    );
  };

  // ==================================================
  // FORMAT DATE + TIME
  // ==================================================

  const formatDateTime = (date) => {
    if (!date) {
      return "N/A";
    }

    return new Date(
      date
    ).toLocaleString(
      "en-US",
      {
        month: "numeric",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      }
    );
  };

  // ==================================================
  // GET TICKET ICON
  // ==================================================

  const getTicketIcon = (category) => {
    const value =
      String(category || "")
        .toLowerCase();

    if (value.includes("account")) {
      return "🔐";
    }

    if (value.includes("billing")) {
      return "💳";
    }

    if (value.includes("technical")) {
      return "💻";
    }

    if (value.includes("network")) {
      return "🌐";
    }

    return "🎫";
  };

  // ==================================================
  // STATUS CLASS
  // ==================================================

  const getStatusClass = (status) => {
    const value =
      String(status || "")
        .toLowerCase()
        .replace(/\s+/g, "-");

    return `ticket-status ${value}`;
  };

  // ==================================================
  // PRIORITY CLASS
  // ==================================================

  const getPriorityClass = (priority) => {
    const value =
      String(priority || "")
        .toLowerCase();

    return `ticket-priority ${value}`;
  };

  // ==================================================
  // CATEGORY CLASS
  // ==================================================

  const getCategoryClass = (category) => {
    const value =
      String(category || "")
        .toLowerCase();

    return `ticket-category ${value}`;
  };

  // ==================================================
  // STATISTICS
  // ==================================================

  const stats = useMemo(() => {
    const total =
      tickets.length;

    const open =
      tickets.filter(
        (ticket) =>
          getStatus(ticket)
            .toLowerCase() ===
          "open"
      ).length;

    const inProgress =
      tickets.filter(
        (ticket) =>
          getStatus(ticket)
            .toLowerCase()
            .replace(/\s+/g, " ") ===
          "in progress"
      ).length;

    const resolved =
      tickets.filter(
        (ticket) =>
          getStatus(ticket)
            .toLowerCase() ===
            "resolved"
      ).length;

    return {
      total,
      open,
      inProgress,
      resolved,
    };
  }, [tickets]);

  // ==================================================
  // FILTERED + SORTED TICKETS
  // ==================================================

  const filteredTickets = useMemo(() => {
    let result = [...tickets];

    // SEARCH

    const searchValue =
      search.trim().toLowerCase();

    if (searchValue) {
      result = result.filter(
        (ticket) => {
          const title =
            String(
              ticket.title || ""
            ).toLowerCase();

          const description =
            String(
              ticket.description || ""
            ).toLowerCase();

          const id =
            String(
              ticket._id || ""
            ).toLowerCase();

          return (
            title.includes(searchValue) ||
            description.includes(searchValue) ||
            id.includes(searchValue)
          );
        }
      );
    }

    // CATEGORY

    if (
      categoryFilter !== "All"
    ) {
      result = result.filter(
        (ticket) =>
          getCategory(ticket) ===
          categoryFilter
      );
    }

    // PRIORITY

    if (
      priorityFilter !== "All"
    ) {
      result = result.filter(
        (ticket) =>
          getPriority(ticket) ===
          priorityFilter
      );
    }

    // STATUS

    if (
      statusFilter !== "All"
    ) {
      result = result.filter(
        (ticket) =>
          getStatus(ticket) ===
          statusFilter
      );
    }

    // SORT

    result.sort((a, b) => {
      const dateA =
        new Date(
          a.createdAt || 0
        ).getTime();

      const dateB =
        new Date(
          b.createdAt || 0
        ).getTime();

      if (sortBy === "oldest") {
        return dateA - dateB;
      }

      if (sortBy === "title") {
        return String(
          a.title || ""
        ).localeCompare(
          String(b.title || "")
        );
      }

      if (sortBy === "priority") {
        const priorityOrder = {
          Urgent: 4,
          High: 3,
          Medium: 2,
          Low: 1,
        };

        return (
          (priorityOrder[
            getPriority(b)
          ] || 0) -
          (priorityOrder[
            getPriority(a)
          ] || 0)
        );
      }

      return dateB - dateA;
    });

    return result;
  }, [
    tickets,
    search,
    categoryFilter,
    priorityFilter,
    statusFilter,
    sortBy,
  ]);

  // ==================================================
  // RESET FILTERS
  // ==================================================

  const resetFilters = () => {
    setSearch("");
    setCategoryFilter("All");
    setPriorityFilter("All");
    setStatusFilter("All");
    setSortBy("newest");
  };

  // ==================================================
  // UNIQUE CATEGORIES
  // ==================================================

  const categories = useMemo(() => {
    return [
      ...new Set(
        tickets.map(
          (ticket) =>
            getCategory(ticket)
        )
      ),
    ];
  }, [tickets]);

  // ==================================================
  // UI
  // ==================================================

  return (
    <div className="my-tickets-page">

      {/* ==================================================
          HEADER
      ================================================== */}

      <section className="my-tickets-hero">

        <div className="my-tickets-title-area">

          <div className="tickets-page-icon">
            🎫
          </div>

          <div>

            <div className="tickets-eyebrow">
              SUPPORT CENTER
            </div>

            <h1>
              My Support{" "}
              <span>Tickets</span>
            </h1>

            <p>
              Track all your support requests
              and stay updated.
            </p>

          </div>

        </div>


        <div className="tickets-header-actions">

          <button
            className="refresh-tickets-btn"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            {refreshing
              ? "↻ Refreshing..."
              : "↻ Refresh"}
          </button>

          <button
            className="new-ticket-btn"
            onClick={() =>
              navigate(
                "/create-ticket"
              )
            }
          >
            <span>＋</span>
            New Ticket
          </button>

        </div>

      </section>


      {/* ==================================================
          STATISTICS
      ================================================== */}

      {!loading &&
        tickets.length > 0 && (

        <section className="ticket-stats-grid">

          {/* TOTAL */}

          <div className="ticket-stat-card total">

            <div className="stat-icon">
              📄
            </div>

            <div className="stat-content">

              <strong>
                {stats.total}
              </strong>

              <span>
                Total Tickets
              </span>

            </div>

            <div className="stat-glow">
              ↗
            </div>

          </div>


          {/* RESOLVED */}

          <div className="ticket-stat-card resolved">

            <div className="stat-icon">
              ✓
            </div>

            <div className="stat-content">

              <strong>
                {stats.resolved}
              </strong>

              <span>
                Resolved
              </span>

            </div>

            <div className="stat-glow">
              ✓
            </div>

          </div>


          {/* IN PROGRESS */}

          <div className="ticket-stat-card progress">

            <div className="stat-icon">
              ◷
            </div>

            <div className="stat-content">

              <strong>
                {stats.inProgress}
              </strong>

              <span>
                In Progress
              </span>

            </div>

            <div className="stat-glow">
              ↗
            </div>

          </div>


          {/* OPEN */}

          <div className="ticket-stat-card open">

            <div className="stat-icon">
              !
            </div>

            <div className="stat-content">

              <strong>
                {stats.open}
              </strong>

              <span>
                Open
              </span>

            </div>

            <div className="stat-glow">
              !
            </div>

          </div>

        </section>
      )}


      {/* ==================================================
          SEARCH + FILTERS
      ================================================== */}

      {!loading &&
        tickets.length > 0 && (

        <section className="ticket-filter-panel">

          <div className="ticket-search-wrapper">

            <span className="search-icon">
              ⌕
            </span>

            <input
              type="text"
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
              placeholder="Search tickets by title, description or ID..."
            />

            {search && (
              <button
                className="clear-search"
                onClick={() =>
                  setSearch("")
                }
              >
                ×
              </button>
            )}

          </div>


          <select
            value={categoryFilter}
            onChange={(e) =>
              setCategoryFilter(
                e.target.value
              )
            }
            className="ticket-filter-select"
          >
            <option value="All">
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


          <select
            value={priorityFilter}
            onChange={(e) =>
              setPriorityFilter(
                e.target.value
              )
            }
            className="ticket-filter-select"
          >
            <option value="All">
              All Priorities
            </option>

            <option value="Low">
              Low
            </option>

            <option value="Medium">
              Medium
            </option>

            <option value="High">
              High
            </option>

            <option value="Urgent">
              Urgent
            </option>

          </select>


          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(
                e.target.value
              )
            }
            className="ticket-filter-select"
          >

            <option value="All">
              All Status
            </option>

            <option value="Open">
              Open
            </option>

            <option value="In Progress">
              In Progress
            </option>

            <option value="Resolved">
              Resolved
            </option>

            <option value="Closed">
              Closed
            </option>

          </select>


          <select
            value={sortBy}
            onChange={(e) =>
              setSortBy(
                e.target.value
              )
            }
            className="ticket-filter-select"
          >

            <option value="newest">
              Sort by Newest
            </option>

            <option value="oldest">
              Sort by Oldest
            </option>

            <option value="priority">
              Sort by Priority
            </option>

            <option value="title">
              Sort by Title
            </option>

          </select>


          {(search ||
            categoryFilter !== "All" ||
            priorityFilter !== "All" ||
            statusFilter !== "All") && (

            <button
              className="reset-ticket-filters"
              onClick={resetFilters}
            >
              Reset
            </button>
          )}

        </section>
      )}


      {/* ==================================================
          RESULT INFO
      ================================================== */}

      {!loading &&
        tickets.length > 0 && (

        <div className="ticket-results-info">

          <div>

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
            categoryFilter !== "All" ||
            priorityFilter !== "All" ||
            statusFilter !== "All") && (

            <span>
              Filters applied
            </span>
          )}

        </div>
      )}


      {/* ==================================================
          LOADING
      ================================================== */}

      {loading && (

        <div className="tickets-loading">

          <div className="tickets-spinner"></div>

          <h3>
            Loading your tickets
          </h3>

          <p>
            Please wait while we fetch
            your support requests.
          </p>

        </div>
      )}


      {/* ==================================================
          NO TICKETS
      ================================================== */}

      {!loading &&
        tickets.length === 0 && (

        <div className="tickets-empty">

          <div className="empty-ticket-icon">
            🎫
          </div>

          <div className="empty-ticket-content">

            <span>
              YOUR SUPPORT CENTER
            </span>

            <h2>
              No Tickets Yet
            </h2>

            <p>
              You haven't created any support
              tickets yet. Create your first
              ticket and our support team will
              help you.
            </p>

            <button
              onClick={() =>
                navigate(
                  "/create-ticket"
                )
              }
              className="new-ticket-btn"
            >
              ＋ Create Your First Ticket
            </button>

          </div>

        </div>
      )}


      {/* ==================================================
          FILTERED EMPTY
      ================================================== */}

      {!loading &&
        tickets.length > 0 &&
        filteredTickets.length === 0 && (

        <div className="filtered-empty">

          <div>
            🔎
          </div>

          <h2>
            No matching tickets
          </h2>

          <p>
            Try changing your search or
            filter options.
          </p>

          <button
            onClick={resetFilters}
          >
            Clear Filters
          </button>

        </div>
      )}


      {/* ==================================================
          TICKETS
      ================================================== */}

      {!loading &&
        filteredTickets.length > 0 && (

        <section className="tickets-container">

          {filteredTickets.map(
            (ticket) => {

              const status =
                getStatus(ticket);

              const category =
                getCategory(ticket);

              const priority =
                getPriority(ticket);

              return (
                <article
                  className="ticket-card"
                  key={ticket._id}
                  onClick={() =>
                    navigate(
                      `/ticket/${ticket._id}`
                    )
                  }
                >

                  {/* LEFT ICON */}

                  <div
                    className={`ticket-card-icon ${category
                      .toLowerCase()
                      .replace(
                        /\s+/g,
                        "-"
                      )}`}
                  >
                    {getTicketIcon(
                      category
                    )}
                  </div>


                  {/* MAIN CONTENT */}

                  <div className="ticket-card-main">

                    <div className="ticket-card-top">

                      <div className="ticket-card-title">

                        <h2>
                          {ticket.title ||
                            "Untitled Ticket"}
                        </h2>

                        <p>
                          {ticket.description ||
                            "No description provided."}
                        </p>

                      </div>


                      {/* STATUS */}

                      <span
                        className={
                          getStatusClass(
                            status
                          )
                        }
                      >
                        <i></i>

                        {status}
                      </span>

                    </div>


                    {/* META */}

                    <div className="ticket-meta-row">

                      <span
                        className={
                          getCategoryClass(
                            category
                          )
                        }
                      >
                        {category}
                      </span>


                      <span
                        className={
                          getPriorityClass(
                            priority
                          )
                        }
                      >
                        ⚑ {priority}
                      </span>


                      <span className="ticket-date">

                        📅

                        {formatDate(
                          ticket.createdAt
                        )}

                      </span>

                    </div>


                    {/* BOTTOM */}

                    <div className="ticket-card-bottom">

                      <div className="ticket-id">

                        <span>
                          Ticket ID
                        </span>

                        <code>
                          {ticket._id}
                        </code>

                        <button
                          type="button"
                          className="copy-ticket-id"
                          onClick={(e) => {
                            e.stopPropagation();

                            navigator.clipboard
                              ?.writeText(
                                ticket._id
                              );
                          }}
                          title="Copy Ticket ID"
                        >
                          ⧉
                        </button>

                      </div>


                      <div className="ticket-updated">

                        <span>
                          ◷
                        </span>

                        Last Updated

                        <strong>
                          {formatDateTime(
                            ticket.updatedAt ||
                              ticket.createdAt
                          )}
                        </strong>

                      </div>


                      <button
                        type="button"
                        className="view-ticket-btn"
                        onClick={(e) => {
                          e.stopPropagation();

                          navigate(
                            `/ticket/${ticket._id}`
                          );
                        }}
                      >
                        <span>
                          View Details
                        </span>

                        →
                      </button>

                    </div>

                  </div>

                </article>
              );
            }
          )}

        </section>
      )}

    </div>
  );
}

export default MyTickets;