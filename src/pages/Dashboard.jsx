           import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

import {
  apiGet,
  apiPut,
  apiDelete,
} from "../api/api";

import "./Dashboard.css";
import "./Dashboard-premium.css";
import "./DashboardGraphs.css";

function Dashboard() {
  const navigate = useNavigate();

  const [tickets, setTickets] = useState([]);
  const [agents, setAgents] = useState([]);

  const [loading, setLoading] = useState(true);
  const [agentsLoading, setAgentsLoading] = useState(true);

  const [updatingId, setUpdatingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [assigningId, setAssigningId] = useState(null);

  // ==========================================================
// CSAT / CUSTOMER FEEDBACK
// ==========================================================

const [feedbackSummary, setFeedbackSummary] = useState({
  totalFeedback: 0,
  averageRating: 0,
  ratingDistribution: {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
  },
});

const [feedbackLoading, setFeedbackLoading] = useState(true);
// ==========================================================
// LIVE SLA CLOCK
// ==========================================================

const [slaNow, setSlaNow] = useState(Date.now());

useEffect(() => {
  const interval = setInterval(() => {
    setSlaNow(Date.now());
  }, 1000);

  return () => clearInterval(interval);
}, []);

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

  const [agentFilter, setAgentFilter] =
    useState("All Agents");

  const [customerFilter, setCustomerFilter] =
    useState("All Customers");

  const [fromDate, setFromDate] =
    useState("");

  const [toDate, setToDate] =
    useState("");

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

  const fetchAgents = async () => {
    try {
      setAgentsLoading(true);

      const data = await apiGet(
        "/admin/agents"
      );

      setAgents(
        data?.agents || []
      );
    } catch (error) {
      console.error(
        "Fetch Agents Error:",
        error
      );

      alert(
        error.message ||
          "Unable to load admin users"
      );
    } finally {
      setAgentsLoading(false);
    }
  };

  // ==========================================================
  // INITIAL LOAD
  // ==========================================================

  useEffect(() => {
  fetchTickets();
  fetchAgents();
  fetchFeedbackSummary();
}, []);


// ==========================================================
// FETCH CSAT / CUSTOMER FEEDBACK SUMMARY
// ==========================================================

const fetchFeedbackSummary = async () => {
  try {
    setFeedbackLoading(true);

    const data = await apiGet("/feedback/admin/summary");

    if (data?.success && data?.summary) {
      setFeedbackSummary(data.summary);
    }
  } catch (error) {
    console.error("Fetch Feedback Summary Error:", error);
  } finally {
    setFeedbackLoading(false);
  }
};

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
  // ANALYTICS DATA
  // ==========================================================

  const analytics = useMemo(() => {
    const statusCounts = {
      Open: 0,
      "In Progress": 0,
      "Waiting for Customer": 0,
      Resolved: 0,
      Closed: 0,
    };

    const priorityCounts = {
      Urgent: 0,
      High: 0,
      Medium: 0,
      Low: 0,
    };

    const categoryCounts = {};

    tickets.forEach((ticket) => {
      // Status
      if (statusCounts[ticket.status] !== undefined) {
        statusCounts[ticket.status]++;
      }

      // Priority
      if (priorityCounts[ticket.priority] !== undefined) {
        priorityCounts[ticket.priority]++;
      }

      // Category
      const category = ticket.category || "General";

      categoryCounts[category] =
        (categoryCounts[category] || 0) + 1;
    });

    return {
      statusCounts,
      priorityCounts,
      categoryCounts,
    };
  }, [tickets]);


  // ==========================================================
  // REAL-TIME GRAPH DATA
  // ==========================================================

  const ticketTrend = useMemo(() => {
    const days = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setHours(0, 0, 0, 0);
      date.setDate(date.getDate() - i);

      days.push({
        date,
        key: date.toISOString().slice(0, 10),
        label: date.toLocaleDateString("en-IN", {
          weekday: "short",
        }),
        shortDate: date.toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
        }),
        count: 0,
      });
    }

    tickets.forEach((ticket) => {
      if (!ticket.createdAt) return;

      const created = new Date(ticket.createdAt);
      if (Number.isNaN(created.getTime())) return;

      created.setHours(0, 0, 0, 0);
      const key = created.toISOString().slice(0, 10);

      const day = days.find((item) => item.key === key);
      if (day) day.count += 1;
    });

    return days;
  }, [tickets]);

  const trendMax = Math.max(
    ...ticketTrend.map((item) => item.count),
    1
  );

  const trendPoints = ticketTrend
    .map((item, index) => {
      const x =
        ticketTrend.length === 1
          ? 50
          : (index / (ticketTrend.length - 1)) * 100;

      const y =
        90 - (item.count / trendMax) * 70;

      return `${x},${y}`;
    })
    .join(" ");

  const statusGraphData = useMemo(
    () => [
      {
        label: "Open",
        count: analytics.statusCounts.Open,
        className: "graph-open",
      },
      {
        label: "In Progress",
        count: analytics.statusCounts["In Progress"],
        className: "graph-progress",
      },
      {
        label: "Waiting for Customer",
        count: analytics.statusCounts["Waiting for Customer"],
        className: "graph-waiting",
      },
      {
        label: "Resolved",
        count: analytics.statusCounts.Resolved,
        className: "graph-resolved",
      },
      {
        label: "Closed",
        count: analytics.statusCounts.Closed,
        className: "graph-closed",
      },
    ],
    [analytics]
  );

  const statusTotal = statusGraphData.reduce(
    (sum, item) => sum + item.count,
    0
  );

  const statusBarsMax = Math.max(
    ...statusGraphData.map((item) => item.count),
    1
  );

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
  // GET CUSTOMERS
  // ==========================================================

  const customers = useMemo(() => {
    const customerMap = new Map();

    tickets.forEach((ticket) => {
      const customer = ticket.userId;

      if (!customer) return;

      const customerId =
        typeof customer === "object"
          ? customer._id || customer.id
          : customer;

      if (!customerId) return;

      const customerName =
        typeof customer === "object"
          ? customer.name || "Unknown Customer"
          : "Unknown Customer";

      const customerEmail =
        typeof customer === "object"
          ? customer.email || ""
          : "";

      customerMap.set(String(customerId), {
        id: String(customerId),
        name: customerName,
        email: customerEmail,
      });
    });

    return Array.from(customerMap.values()).sort((a, b) =>
      `${a.name} ${a.email}`.localeCompare(
        `${b.name} ${b.email}`
      )
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

        const assignedAgentId =
          typeof ticket.assignedTo === "object"
            ? ticket.assignedTo?._id ||
              ticket.assignedTo?.id
            : ticket.assignedTo;

        const matchesAgent =
          agentFilter === "All Agents" ||
          String(assignedAgentId || "") ===
            String(agentFilter);

        const ticketCustomerId =
          typeof ticket.userId === "object"
            ? ticket.userId?._id ||
              ticket.userId?.id
            : ticket.userId;

        const matchesCustomer =
          customerFilter === "All Customers" ||
          String(ticketCustomerId || "") ===
            String(customerFilter);

        const ticketDate = ticket.createdAt
          ? new Date(ticket.createdAt)
          : null;

        const startDate = fromDate
          ? new Date(`${fromDate}T00:00:00`)
          : null;

        const endDate = toDate
          ? new Date(`${toDate}T23:59:59.999`)
          : null;

        const matchesFromDate =
          !startDate ||
          (ticketDate &&
            !Number.isNaN(ticketDate.getTime()) &&
            ticketDate >= startDate);

        const matchesToDate =
          !endDate ||
          (ticketDate &&
            !Number.isNaN(ticketDate.getTime()) &&
            ticketDate <= endDate);

        return (
          matchesSearch &&
          matchesStatus &&
          matchesPriority &&
          matchesCategory &&
          matchesAgent &&
          matchesCustomer &&
          matchesFromDate &&
          matchesToDate
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
    agentFilter,
    customerFilter,
    fromDate,
    toDate,
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
// SLA COUNTDOWN HELPERS
// ==========================================================

const getRemainingSeconds = (deadline) => {
  if (!deadline) return null;

  const deadlineTime = new Date(deadline).getTime();

  if (Number.isNaN(deadlineTime)) return null;

  return Math.max(
    0,
    Math.ceil((deadlineTime - slaNow) / 1000)
  );
};

const formatSlaCountdown = (seconds) => {
  if (seconds === null || seconds === undefined) {
    return "N/A";
  }

  if (seconds <= 0) {
    return "Breached";
  }

  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m`;
  }

  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`;
  }

  return `${minutes}m ${secs}s`;
};
// ==========================================================
// SLA WARNING CLASS
// ==========================================================

const getSlaWarningClass = (seconds) => {
  if (seconds === null || seconds === undefined) {
    return "sla-normal";
  }

  if (seconds <= 0) {
    return "sla-breached";
  }

  // Less than 15 minutes
  if (seconds <= 15 * 60) {
    return "sla-critical";
  }

  // Less than 1 hour
  if (seconds <= 60 * 60) {
    return "sla-warning";
  }

  return "sla-normal";
};

// ==========================================================
// SLA STATISTICS
// ==========================================================

const getSlaStatistics = (ticketList = []) => {
  let withinSla = 0;
  let warning = 0;
  let breached = 0;

  ticketList.forEach((ticket) => {
    const responseStatus =
      ticket?.slaStatus?.responseStatus;

    const resolutionStatus =
      ticket?.slaStatus?.resolutionStatus;

    const responseDeadline =
      ticket?.slaStatus?.responseDeadline;

    const resolutionDeadline =
      ticket?.slaStatus?.resolutionDeadline;

    const responseSeconds =
      getRemainingSeconds(responseDeadline);

    const resolutionSeconds =
      getRemainingSeconds(resolutionDeadline);

    const responseBreached =
      responseStatus === "Breached";

    const resolutionBreached =
      resolutionStatus === "Breached";

    const isBreached =
      responseBreached || resolutionBreached;

    const responseWarning =
      responseStatus === "Near Breach" ||
      (
        responseStatus !== "Completed" &&
        responseStatus !== "Breached" &&
        responseSeconds !== null &&
        responseSeconds > 0 &&
        responseSeconds <= 60 * 60
      );

    const resolutionWarning =
      resolutionStatus === "Near Breach" ||
      (
        resolutionStatus !== "Completed" &&
        resolutionStatus !== "Breached" &&
        resolutionSeconds !== null &&
        resolutionSeconds > 0 &&
        resolutionSeconds <= 60 * 60
      );

    const isWarning =
      !isBreached &&
      (responseWarning || resolutionWarning);

    if (isBreached) {
      breached++;
    } else if (isWarning) {
      warning++;
    } else {
      withinSla++;
    }
  });

  const total = ticketList.length;

  return {
    total,
    withinSla,
    warning,
    breached,

    withinSlaPercentage:
      total > 0
        ? Math.round((withinSla / total) * 100)
        : 0,

    warningPercentage:
      total > 0
        ? Math.round((warning / total) * 100)
        : 0,

    breachedPercentage:
      total > 0
        ? Math.round((breached / total) * 100)
        : 0,
  };
};

const slaStatistics = getSlaStatistics(tickets);

// ==========================================================
// SLA ANALYTICS DATA
// ==========================================================
// ==========================================================
// SLA ANALYTICS DATA
// ==========================================================

const slaAnalytics = useMemo(() => {
  const priorityData = {
    Urgent: {
      total: 0,
      withinSla: 0,
      warning: 0,
      breached: 0,
    },
    High: {
      total: 0,
      withinSla: 0,
      warning: 0,
      breached: 0,
    },
    Medium: {
      total: 0,
      withinSla: 0,
      warning: 0,
      breached: 0,
    },
    Low: {
      total: 0,
      withinSla: 0,
      warning: 0,
      breached: 0,
    },
  };

  let responseBreached = 0;
  let responseCompleted = 0;
  let resolutionBreached = 0;
  let resolutionCompleted = 0;

  tickets.forEach((ticket) => {
    const priority = ticket.priority || "Medium";

    if (!priorityData[priority]) {
      priorityData[priority] = {
        total: 0,
        withinSla: 0,
        warning: 0,
        breached: 0,
      };
    }

    priorityData[priority].total++;

    const responseStatus =
      ticket?.slaStatus?.responseStatus;

    const resolutionStatus =
      ticket?.slaStatus?.resolutionStatus;

    // -----------------------------
    // RESPONSE SLA
    // -----------------------------

    if (responseStatus === "Breached") {
      responseBreached++;
    }

    if (responseStatus === "Completed") {
      responseCompleted++;
    }

    // -----------------------------
    // RESOLUTION SLA
    // -----------------------------

    if (resolutionStatus === "Breached") {
      resolutionBreached++;
    }

    if (resolutionStatus === "Completed") {
      resolutionCompleted++;
    }

    // -----------------------------
    // PRIORITY SLA
    // -----------------------------

    const isBreached =
      responseStatus === "Breached" ||
      resolutionStatus === "Breached";

    const isWarning =
      !isBreached &&
      (
        responseStatus === "Near Breach" ||
        resolutionStatus === "Near Breach"
      );

    if (isBreached) {
      priorityData[priority].breached++;
    } else if (isWarning) {
      priorityData[priority].warning++;
    } else {
      priorityData[priority].withinSla++;
    }
  });

  const totalTickets = tickets.length;

  return {
    priorityData,

    responseBreached,
    responseCompleted,

    resolutionBreached,
    resolutionCompleted,

    responseBreachRate:
      totalTickets > 0
        ? Math.round(
            (responseBreached / totalTickets) * 100
          )
        : 0,

    resolutionBreachRate:
      totalTickets > 0
        ? Math.round(
            (resolutionBreached / totalTickets) * 100
          )
        : 0,
  };
}, [tickets]);

// ==========================================================
// SLA VISUAL CHART DATA
// ==========================================================

const slaChartData = [
  {
    name: "Response SLA",
    Completed: slaAnalytics.responseCompleted,
    Breached: slaAnalytics.responseBreached,
  },
  {
    name: "Resolution SLA",
    Completed: slaAnalytics.resolutionCompleted,
    Breached: slaAnalytics.resolutionBreached,
  },
];

const prioritySlaChartData = [
  {
    name: "Urgent",
    "Within SLA": slaAnalytics.priorityData.Urgent?.withinSla || 0,
    Warning: slaAnalytics.priorityData.Urgent?.warning || 0,
    Breached: slaAnalytics.priorityData.Urgent?.breached || 0,
  },
  {
    name: "High",
    "Within SLA": slaAnalytics.priorityData.High?.withinSla || 0,
    Warning: slaAnalytics.priorityData.High?.warning || 0,
    Breached: slaAnalytics.priorityData.High?.breached || 0,
  },
  {
    name: "Medium",
    "Within SLA": slaAnalytics.priorityData.Medium?.withinSla || 0,
    Warning: slaAnalytics.priorityData.Medium?.warning || 0,
    Breached: slaAnalytics.priorityData.Medium?.breached || 0,
  },
  {
    name: "Low",
    "Within SLA": slaAnalytics.priorityData.Low?.withinSla || 0,
    Warning: slaAnalytics.priorityData.Low?.warning || 0,
    Breached: slaAnalytics.priorityData.Low?.breached || 0,
  },
];

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

    setAgentFilter(
      "All Agents"
    );

    setCustomerFilter(
      "All Customers"
    );

    setFromDate("");

    setToDate("");

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
            fetchAgents();
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
    CSAT / CUSTOMER SATISFACTION
==================================================== */}

<section className="csat-dashboard-section">

  <div className="csat-section-header">
    <div>
      <span className="csat-eyebrow">
        CUSTOMER EXPERIENCE
      </span>

      <h2>Customer Satisfaction (CSAT)</h2>

      <p>
        Customer feedback and support experience overview.
      </p>
    </div>

    <div className="csat-header-icon">
      😊
    </div>
  </div>

  <div className="csat-cards-grid">

    {/* AVERAGE RATING */}
    <div className="csat-card csat-average-card">

      <div className="csat-card-icon">
        ⭐
      </div>

      <div className="csat-card-content">
        <span>Average Rating</span>

        <strong>
          {feedbackLoading
            ? "..."
            : `${Number(
                feedbackSummary.averageRating || 0
              ).toFixed(1)} / 5`}
        </strong>

        <div className="csat-stars">
          {"★★★★★"}
        </div>
      </div>

    </div>


    {/* TOTAL RESPONSES */}
    <div className="csat-card">

      <div className="csat-card-icon">
        💬
      </div>

      <div className="csat-card-content">
        <span>Total Responses</span>

        <strong>
          {feedbackLoading
            ? "..."
            : feedbackSummary.totalFeedback || 0}
        </strong>

        <small>
          Customer feedback received
        </small>
      </div>

    </div>


    {/* 5 STAR */}
    <div className="csat-card">

      <div className="csat-card-icon">
        🤩
      </div>

      <div className="csat-card-content">
        <span>5 Star Ratings</span>

        <strong>
          {feedbackLoading
            ? "..."
            : feedbackSummary.ratingDistribution?.[5] || 0}
        </strong>

        <small>
          Excellent
        </small>
      </div>

    </div>


    {/* 4 STAR */}
    <div className="csat-card">

      <div className="csat-card-icon">
        😄
      </div>

      <div className="csat-card-content">
        <span>4 Star Ratings</span>

        <strong>
          {feedbackLoading
            ? "..."
            : feedbackSummary.ratingDistribution?.[4] || 0}
        </strong>

        <small>
          Very Good
        </small>
      </div>

    </div>

  </div>


  {/* RATING DISTRIBUTION */}

  <div className="csat-distribution-card">

    <div className="csat-distribution-header">

      <div>
        <span className="csat-eyebrow">
          RATING BREAKDOWN
        </span>

        <h3>Feedback Distribution</h3>
      </div>

      <span className="csat-distribution-icon">
        📊
      </span>

    </div>


    <div className="csat-rating-list">

      {[5, 4, 3, 2, 1].map((rating) => {

        const count =
          feedbackSummary.ratingDistribution?.[rating] || 0;

        const total =
          feedbackSummary.totalFeedback || 0;

        const percentage =
          total > 0
            ? (count / total) * 100
            : 0;

        return (
          <div
            className="csat-rating-row"
            key={rating}
          >

            <div className="csat-rating-label">
              <span>
                {rating} ⭐
              </span>

              <strong>
                {count}
              </strong>
            </div>

            <div className="csat-rating-track">

              <div
                className="csat-rating-fill"
                style={{
                  width: `${percentage}%`,
                }}
              />

            </div>

            <span className="csat-rating-percentage">
              {percentage.toFixed(0)}%
            </span>

          </div>
        );

      })}

    </div>

  </div>

</section>

{/* ====================================================
    SLA STATISTICS
==================================================== */}

<section className="sla-statistics-section">

  <div className="sla-statistics-header">
    <div>
      <span className="sla-statistics-eyebrow">
        SERVICE LEVEL AGREEMENT
      </span>

      <h2>SLA Statistics</h2>

      <p>
        Real-time overview of response and resolution SLA performance.
      </p>
    </div>

    <div className="sla-statistics-icon">
      ⏱️
    </div>
  </div>

  <div className="sla-statistics-grid">

    {/* TOTAL */}
    <div className="sla-statistics-card sla-total-card">
      <div className="sla-statistics-card-icon">
        🎫
      </div>

      <div className="sla-statistics-card-content">
        <span>Total Tickets</span>

        <strong>
          {slaStatistics.total}
        </strong>

        <small>
          Tickets monitored
        </small>
      </div>
    </div>

    {/* WITHIN SLA */}
    <div className="sla-statistics-card sla-within-card">
      <div className="sla-statistics-card-icon">
        🟢
      </div>

      <div className="sla-statistics-card-content">
        <span>Within SLA</span>

        <strong>
          {slaStatistics.withinSla}
        </strong>

        <small>
          {slaStatistics.withinSlaPercentage}% of tickets
        </small>
      </div>
    </div>

    {/* WARNING */}
    <div className="sla-statistics-card sla-warning-card">
      <div className="sla-statistics-card-icon">
        ⚠️
      </div>

      <div className="sla-statistics-card-content">
        <span>Approaching Breach</span>

        <strong>
          {slaStatistics.warning}
        </strong>

        <small>
          {slaStatistics.warningPercentage}% of tickets
        </small>
      </div>
    </div>

    {/* BREACHED */}
    <div className="sla-statistics-card sla-breached-card">
      <div className="sla-statistics-card-icon">
        🚨
      </div>

      <div className="sla-statistics-card-content">
        <span>Breached</span>

        <strong>
          {slaStatistics.breached}
        </strong>

        <small>
          {slaStatistics.breachedPercentage}% of tickets
        </small>
      </div>
    </div>

  </div>

</section>


      {/* ====================================================
          SLA ANALYTICS
      ==================================================== */}

      <section className="sla-analytics-section">

        <div className="sla-analytics-header">

          <div>
            <span className="sla-statistics-eyebrow">
              SLA PERFORMANCE
            </span>

            <h2>SLA Analytics</h2>

            <p>
              Detailed response, resolution and priority-wise SLA performance.
            </p>
          </div>

          <div className="sla-statistics-icon">
            📈
          </div>

        </div>


        {/* RESPONSE + RESOLUTION */}

        <div className="sla-analytics-summary-grid">

          <div className="sla-analytics-summary-card">

            <div className="sla-analytics-summary-icon">
              💬
            </div>

            <div className="sla-analytics-summary-content">

              <span>Response SLA</span>

              <strong>
                {slaAnalytics.responseCompleted}
                <small> Completed</small>
              </strong>

              <div className="sla-analytics-summary-meta">

                <span>
                  🚨 {slaAnalytics.responseBreached} Breached
                </span>

                <span>
                  {slaAnalytics.responseBreachRate}% Breach Rate
                </span>

              </div>

            </div>

          </div>


          <div className="sla-analytics-summary-card">

            <div className="sla-analytics-summary-icon">
              ✅
            </div>

            <div className="sla-analytics-summary-content">

              <span>Resolution SLA</span>

              <strong>
                {slaAnalytics.resolutionCompleted}
                <small> Completed</small>
              </strong>

              <div className="sla-analytics-summary-meta">

                <span>
                  🚨 {slaAnalytics.resolutionBreached} Breached
                </span>

                <span>
                  {slaAnalytics.resolutionBreachRate}% Breach Rate
                </span>

              </div>

            </div>

          </div>

        </div>


        {/* PRIORITY-WISE SLA */}

        <div className="sla-priority-analytics-card">

          <div className="sla-priority-analytics-header">

            <div>

              <span className="sla-statistics-eyebrow">
                PRIORITY PERFORMANCE
              </span>

              <h3>Priority-wise SLA Performance</h3>

              <p>
                SLA status breakdown across different ticket priorities.
              </p>

            </div>

            <span className="sla-priority-analytics-icon">
              🎯
            </span>

          </div>


          <div className="sla-priority-table-wrapper">

            <table className="sla-priority-table">

              <thead>

                <tr>
                  <th>Priority</th>
                  <th>Total</th>
                  <th>Within SLA</th>
                  <th>Warning</th>
                  <th>Breached</th>
                </tr>

              </thead>

              <tbody>

                {["Urgent", "High", "Medium", "Low"].map(
                  (priority) => {

                    const data =
                      slaAnalytics.priorityData[priority] || {
                        total: 0,
                        withinSla: 0,
                        warning: 0,
                        breached: 0,
                      };

                    return (

                      <tr key={priority}>

                        <td>
                          <span
                            className={`sla-priority-badge sla-priority-${priority.toLowerCase()}`}
                          >
                            {priority}
                          </span>
                        </td>

                        <td>
                          <strong>
                            {data.total}
                          </strong>
                        </td>

                        <td>
                          <span className="sla-table-within">
                            {data.withinSla}
                          </span>
                        </td>

                        <td>
                          <span className="sla-table-warning">
                            {data.warning}
                          </span>
                        </td>

                        <td>
                          <span className="sla-table-breached">
                            {data.breached}
                          </span>
                        </td>

                      </tr>

                    );

                  }
                )}

              </tbody>

            </table>

          </div>

        </div>

      </section>


      {/* ====================================================
          SLA VISUAL ANALYTICS
      ==================================================== */}

      <section className="sla-chart-section">
        <div className="sla-chart-header">
          <div>
            <span className="sla-statistics-eyebrow">
              VISUAL ANALYTICS
            </span>
            <h2>SLA Breach Comparison</h2>
            <p>
              Response and resolution SLA performance at a glance.
            </p>
          </div>

          <div className="sla-statistics-icon">📊</div>
        </div>

        <div className="sla-chart-card">
          <ResponsiveContainer width="100%" height={320}>
            <BarChart
              data={slaChartData}
              margin={{ top: 10, right: 20, left: 0, bottom: 10 }}
              barGap={14}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="rgba(255,255,255,0.08)"
              />

              <XAxis
                dataKey="name"
                tick={{ fill: "#9ca9bc", fontSize: 12 }}
                axisLine={{ stroke: "rgba(255,255,255,0.08)" }}
                tickLine={false}
              />

              <YAxis
                allowDecimals={false}
                tick={{ fill: "#9ca9bc", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />

              <Tooltip
                cursor={{ fill: "rgba(255,255,255,0.03)" }}
                contentStyle={{
                  background: "#101827",
                  border: "1px solid rgba(255,255,255,0.10)",
                  borderRadius: "12px",
                  color: "#ffffff",
                }}
              />

              <Legend
                wrapperStyle={{
                  paddingTop: "14px",
                  color: "#cbd5e1",
                }}
              />

              <Bar
                dataKey="Completed"
                fill="#4ade80"
                radius={[6, 6, 0, 0]}
                maxBarSize={55}
              />

              <Bar
                dataKey="Breached"
                fill="#fb7185"
                radius={[6, 6, 0, 0]}
                maxBarSize={55}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* ====================================================
          PRIORITY-WISE SLA VISUAL ANALYTICS
      ==================================================== */}

      <section className="sla-chart-section">
        <div className="sla-chart-header">
          <div>
            <span className="sla-statistics-eyebrow">
              PRIORITY VISUAL ANALYTICS
            </span>

            <h2>Priority-wise SLA Performance</h2>

            <p>
              Compare SLA performance across Urgent, High, Medium and Low priority tickets.
            </p>
          </div>

          <div className="sla-statistics-icon">🎯</div>
        </div>

        <div className="sla-chart-card">
          <ResponsiveContainer width="100%" height={340}>
            <BarChart
              data={prioritySlaChartData}
              margin={{ top: 10, right: 20, left: 0, bottom: 10 }}
              barGap={8}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="rgba(255,255,255,0.08)"
              />

              <XAxis
                dataKey="name"
                tick={{ fill: "#9ca9bc", fontSize: 12 }}
                axisLine={{ stroke: "rgba(255,255,255,0.08)" }}
                tickLine={false}
              />

              <YAxis
                allowDecimals={false}
                tick={{ fill: "#9ca9bc", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />

              <Tooltip
                cursor={{ fill: "rgba(255,255,255,0.03)" }}
                contentStyle={{
                  background: "#101827",
                  border: "1px solid rgba(255,255,255,0.10)",
                  borderRadius: "12px",
                  color: "#ffffff",
                }}
              />

              <Legend
                wrapperStyle={{
                  paddingTop: "14px",
                  color: "#cbd5e1",
                }}
              />

              <Bar
                dataKey="Within SLA"
                fill="#4ade80"
                radius={[6, 6, 0, 0]}
                maxBarSize={45}
              />

              <Bar
                dataKey="Warning"
                fill="#facc15"
                radius={[6, 6, 0, 0]}
                maxBarSize={45}
              />

              <Bar
                dataKey="Breached"
                fill="#fb7185"
                radius={[6, 6, 0, 0]}
                maxBarSize={45}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* ====================================================
          ANALYTICS
      ==================================================== */}

      <div className="dashboard-analytics">

        {/* STATUS ANALYTICS */}
        <div className="analytics-card">
          <div className="analytics-card-header">
            <div>
              <span className="analytics-eyebrow">
                TICKET STATUS
              </span>
              <h2>Status Overview</h2>
            </div>
            <span className="analytics-icon">📊</span>
          </div>

          <div className="analytics-list">
            {Object.entries(analytics.statusCounts).map(
              ([status, count]) => (
                <div
                  className="analytics-row"
                  key={status}
                >
                  <div className="analytics-row-info">
                    <span>{status}</span>
                    <strong>{count}</strong>
                  </div>

                  <div className="analytics-progress">
                    <div
                      className="analytics-progress-fill"
                      style={{
                        width: `${
                          totalTickets
                            ? (count / totalTickets) * 100
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>
              )
            )}
          </div>
        </div>

        {/* PRIORITY ANALYTICS */}
        <div className="analytics-card">
          <div className="analytics-card-header">
            <div>
              <span className="analytics-eyebrow">
                TICKET PRIORITY
              </span>
              <h2>Priority Overview</h2>
            </div>
            <span className="analytics-icon">🚨</span>
          </div>

          <div className="analytics-list">
            {Object.entries(analytics.priorityCounts).map(
              ([priority, count]) => (
                <div
                  className="analytics-row"
                  key={priority}
                >
                  <div className="analytics-row-info">
                    <span>{priority}</span>
                    <strong>{count}</strong>
                  </div>

                  <div className="analytics-progress">
                    <div
                      className={`analytics-progress-fill priority-${priority.toLowerCase()}`}
                      style={{
                        width: `${
                          totalTickets
                            ? (count / totalTickets) * 100
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>
              )
            )}
          </div>
        </div>

        {/* CATEGORY ANALYTICS */}
        <div className="analytics-card analytics-category-card">
          <div className="analytics-card-header">
            <div>
              <span className="analytics-eyebrow">
                TICKET CATEGORIES
              </span>
              <h2>Category Overview</h2>
            </div>
            <span className="analytics-icon">📁</span>
          </div>

          <div className="analytics-list">
            {Object.entries(analytics.categoryCounts).length ===
            0 ? (
              <div className="analytics-empty">
                No category data available.
              </div>
            ) : (
              Object.entries(analytics.categoryCounts)
                .sort((a, b) => b[1] - a[1])
                .map(([category, count]) => (
                  <div
                    className="analytics-row"
                    key={category}
                  >
                    <div className="analytics-row-info">
                      <span>{category}</span>
                      <strong>{count}</strong>
                    </div>

                    <div className="analytics-progress">
                      <div
                        className="analytics-progress-fill"
                        style={{
                          width: `${
                            totalTickets
                              ? (count / totalTickets) * 100
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>

      </div>
      

      {/* ====================================================
          REAL DATA GRAPHS
      ==================================================== */}

      <section className="dashboard-graphs">

        {/* TICKET CREATION TREND */}
        <div className="dashboard-graph-card ticket-trend-graph">

          <div className="graph-card-header">
            <div>
              <span className="graph-eyebrow">
                LAST 7 DAYS
              </span>
              <h2>Ticket Creation Trend</h2>
              <p>
                Daily ticket volume based on actual created tickets.
              </p>
            </div>

            <div className="graph-header-icon">
              📈
            </div>
          </div>

          <div className="line-chart-wrapper">

            <div className="line-chart-y-axis">
              <span>{trendMax}</span>
              <span>{Math.ceil(trendMax * 0.75)}</span>
              <span>{Math.ceil(trendMax * 0.5)}</span>
              <span>{Math.ceil(trendMax * 0.25)}</span>
              <span>0</span>
            </div>

            <div className="line-chart-main">

              <div className="chart-grid-lines">
                <span />
                <span />
                <span />
                <span />
                <span />
              </div>

              <svg
                className="ticket-line-chart"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                aria-label="Ticket creation trend"
              >
                <polyline
                  points={trendPoints}
                  fill="none"
                  className="trend-line"
                  vectorEffect="non-scaling-stroke"
                />

                {ticketTrend.map((item, index) => {
                  const x =
                    ticketTrend.length === 1
                      ? 50
                      : (index / (ticketTrend.length - 1)) * 100;

                  const y =
                    90 - (item.count / trendMax) * 70;

                  return (
                    <circle
                      key={item.key}
                      cx={x}
                      cy={y}
                      r="1.6"
                      className="trend-point"
                    />
                  );
                })}
              </svg>

              <div className="line-chart-labels">
                {ticketTrend.map((item) => (
                  <div key={item.key}>
                    <strong>{item.label}</strong>
                    <span>{item.shortDate}</span>
                  </div>
                ))}
              </div>

              <div className="trend-tooltip-row">
                {ticketTrend.map((item) => (
                  <div key={item.key}>
                    <span>{item.count}</span>
                  </div>
                ))}
              </div>

            </div>
          </div>

          <div className="graph-summary">
            <span>
              <i className="graph-dot" />
              Total created in 7 days
            </span>
            <strong>
              {ticketTrend.reduce(
                (sum, item) => sum + item.count,
                0
              )}
            </strong>
          </div>

        </div>

        {/* STATUS DISTRIBUTION */}
        <div className="dashboard-graph-card status-distribution-graph">

          <div className="graph-card-header">
            <div>
              <span className="graph-eyebrow">
                CURRENT STATUS
              </span>
              <h2>Status Distribution</h2>
              <p>
                Current distribution of all support tickets.
              </p>
            </div>

            <div className="graph-header-icon">
              📊
            </div>
          </div>

          <div className="status-chart-body">

            <div className="status-donut">
              <div className="status-donut-inner">
                <strong>{statusTotal}</strong>
                <span>Total</span>
              </div>
            </div>

            <div className="status-bars">
              {statusGraphData.map((item) => (
                <div
                  className="status-graph-row"
                  key={item.label}
                >
                  <div className="status-graph-label">
                    <span>
                      <i
                        className={`status-graph-dot ${item.className}`}
                      />
                      {item.label}
                    </span>

                    <strong>{item.count}</strong>
                  </div>

                  <div className="status-graph-track">
                    <div
                      className={`status-graph-fill ${item.className}`}
                      style={{
                        width: `${
                          (item.count / statusBarsMax) * 100
                        }%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

          </div>

          <div className="graph-summary status-summary">
            <span>
              Active tickets
            </span>
            <strong>
              {openTickets + inProgressTickets}
            </strong>
          </div>

        </div>

      </section>

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
                Waiting for Customer
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

          {/* ASSIGNED AGENT */}

          <div className="filter-control">

            <label>
              Assigned Agent
            </label>

            <select
              className="filter-select"
              value={agentFilter}
              onChange={(e) =>
                setAgentFilter(e.target.value)
              }
            >
              <option value="All Agents">
                All Agents
              </option>

              {agents.map((agent) => (
                <option
                  key={agent._id}
                  value={agent._id}
                >
                  {agent.name}
                </option>
              ))}
            </select>

          </div>

          {/* CUSTOMER */}

          <div className="filter-control">

            <label>
              Customer
            </label>

            <select
              className="filter-select"
              value={customerFilter}
              onChange={(e) =>
                setCustomerFilter(e.target.value)
              }
            >
              <option value="All Customers">
                All Customers
              </option>

              {customers.map((customer) => (
                <option
                  key={customer.id}
                  value={customer.id}
                >
                  {customer.name}
                  {customer.email
                    ? ` — ${customer.email}`
                    : ""}
                </option>
              ))}
            </select>

          </div>

          {/* FROM DATE */}

          <div className="filter-control">

            <label>
              From Date
            </label>

            <input
              type="date"
              className="filter-select"
              value={fromDate}
              max={toDate || undefined}
              onChange={(e) =>
                setFromDate(e.target.value)
              }
            />

          </div>

          {/* TO DATE */}

          <div className="filter-control">

            <label>
              To Date
            </label>

            <input
              type="date"
              className="filter-select"
              value={toDate}
              min={fromDate || undefined}
              onChange={(e) =>
                setToDate(e.target.value)
              }
            />

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
            "All Categories" ||
          agentFilter !==
            "All Agents" ||
          customerFilter !==
            "All Customers" ||
          fromDate ||
          toDate) && (
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
    CUSTOMER LOCATION
========================================== */}

{ticket.location?.latitude !== null &&
 ticket.location?.latitude !== undefined &&
 ticket.location?.longitude !== null &&
 ticket.location?.longitude !== undefined &&
 !(Number(ticket.location.latitude) === 0 &&
   Number(ticket.location.longitude) === 0) && (
    
  <div
    className="customer-location-section"
    style={{
      marginTop: "24px",
      padding: "20px",
      border: "1px solid rgba(99, 102, 241, 0.25)",
      borderRadius: "16px",
      background: "rgba(15, 23, 42, 0.55)",
    }}
  >
    {/* HEADER */}
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "16px",
        marginBottom: "16px",
        flexWrap: "wrap",
      }}
    >
      <div>
        <h3
          style={{
            margin: 0,
            fontSize: "18px",
          }}
        >
          📍 Customer Location
        </h3>

        <p
          style={{
            margin: "6px 0 0",
            color: "#94a3b8",
            fontSize: "13px",
          }}
        >
          Location captured when the ticket was created.
        </p>
      </div>

      <a
        href={`https://www.google.com/maps?q=${ticket.location.latitude},${ticket.location.longitude}`}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          padding: "10px 14px",
          borderRadius: "10px",
          background: "#4f46e5",
          color: "#ffffff",
          textDecoration: "none",
          fontWeight: "600",
          fontSize: "13px",
          whiteSpace: "nowrap",
        }}
      >
        🗺️ Open in Google Maps
      </a>
    </div>

    {/* LOCATION DETAILS */}
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
        gap: "12px",
        marginBottom: "12px",
      }}
    >
      {/* LATITUDE */}
      <div
        style={{
          padding: "12px",
          borderRadius: "10px",
          background: "rgba(255,255,255,0.04)",
        }}
      >
        <span
          style={{
            display: "block",
            color: "#94a3b8",
            fontSize: "12px",
            marginBottom: "5px",
          }}
        >
          Latitude
        </span>

        <strong>
          {Number(ticket.location.latitude).toFixed(6)}
        </strong>
      </div>

      {/* LONGITUDE */}
      <div
        style={{
          padding: "12px",
          borderRadius: "10px",
          background: "rgba(255,255,255,0.04)",
        }}
      >
        <span
          style={{
            display: "block",
            color: "#94a3b8",
            fontSize: "12px",
            marginBottom: "5px",
          }}
        >
          Longitude
        </span>

        <strong>
          {Number(ticket.location.longitude).toFixed(6)}
        </strong>
      </div>
    </div>

    {/* ACCURACY + CAPTURE TIME */}
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
        gap: "12px",
        marginBottom: "16px",
      }}
    >
      {/* ACCURACY */}
      <div
        style={{
          padding: "12px",
          borderRadius: "10px",
          background: "rgba(255,255,255,0.04)",
        }}
      >
        <span
          style={{
            display: "block",
            color: "#94a3b8",
            fontSize: "12px",
            marginBottom: "5px",
          }}
        >
          🎯 Location Accuracy
        </span>

        <strong>
          {ticket.location.accuracy !== null &&
          ticket.location.accuracy !== undefined &&
          Number.isFinite(Number(ticket.location.accuracy))
            ? `±${Number(ticket.location.accuracy).toFixed(1)} meters`
            : "Not available"}
        </strong>
      </div>

      {/* CAPTURED TIME */}
      <div
        style={{
          padding: "12px",
          borderRadius: "10px",
          background: "rgba(255,255,255,0.04)",
        }}
      >
        <span
          style={{
            display: "block",
            color: "#94a3b8",
            fontSize: "12px",
            marginBottom: "5px",
          }}
        >
          🕒 Captured At
        </span>

        <strong>
          {ticket.location.capturedAt
            ? new Date(ticket.location.capturedAt).toLocaleString(
                "en-IN",
                {
                  dateStyle: "medium",
                  timeStyle: "short",
                }
              )
            : "Not available"}
        </strong>
      </div>
    </div>

    {/* MAP */}
    <iframe
      title="Customer Location Map"
      src={`https://www.google.com/maps?q=${ticket.location.latitude},${ticket.location.longitude}&z=15&output=embed`}
      width="100%"
      height="280"
      style={{
        border: 0,
        borderRadius: "12px",
      }}
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
    />
  </div>
)}

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
    SLA COUNTDOWN + NEAR-BREACH WARNING
========================================== */}

<div className="ticket-sla-section">

  <div className="sla-header">
    <div>
      <span className="sla-label">
        ⏱️ SLA STATUS
      </span>

      <p className="sla-description">
        Live response and resolution countdown
      </p>
    </div>
  </div>

  <div className="sla-countdown-grid">

    {/* ==========================
        FIRST RESPONSE SLA
    ========================== */}

    {(() => {
      const responseSeconds = getRemainingSeconds(
        ticket.slaStatus?.responseDeadline
      );

      const responseClass =
        getSlaWarningClass(responseSeconds);

      return (
        <div
          className={`sla-countdown-card ${responseClass}`}
        >
          <span className="sla-countdown-title">
            First Response
          </span>

          <strong>
            {formatSlaCountdown(responseSeconds)}
          </strong>

          {/* NORMAL */}
          {responseSeconds !== null &&
            responseSeconds > 60 * 60 && (
              <small className="sla-status-message">
                🟢 SLA within target
              </small>
            )}

          {/* NEAR BREACH */}
          {responseSeconds !== null &&
            responseSeconds > 15 * 60 &&
            responseSeconds <= 60 * 60 && (
              <small className="sla-status-message">
                ⚠️ SLA approaching breach
              </small>
            )}

          {/* CRITICAL */}
          {responseSeconds !== null &&
            responseSeconds > 0 &&
            responseSeconds <= 15 * 60 && (
              <small className="sla-status-message">
                🔴 Critical — less than 15 minutes
              </small>
            )}

          {/* BREACHED */}
          {responseSeconds !== null &&
            responseSeconds <= 0 && (
              <small className="sla-status-message">
                🚨 Response SLA breached
              </small>
            )}
        </div>
      );
    })()}


    {/* ==========================
        RESOLUTION SLA
    ========================== */}

    {(() => {
      const resolutionSeconds = getRemainingSeconds(
        ticket.slaStatus?.resolutionDeadline
      );

      const resolutionClass =
        getSlaWarningClass(resolutionSeconds);

      return (
        <div
          className={`sla-countdown-card ${resolutionClass}`}
        >
          <span className="sla-countdown-title">
            Resolution
          </span>

          <strong>
            {formatSlaCountdown(resolutionSeconds)}
          </strong>

          {/* NORMAL */}
          {resolutionSeconds !== null &&
            resolutionSeconds > 60 * 60 && (
              <small className="sla-status-message">
                🟢 SLA within target
              </small>
            )}

          {/* NEAR BREACH */}
          {resolutionSeconds !== null &&
            resolutionSeconds > 15 * 60 &&
            resolutionSeconds <= 60 * 60 && (
              <small className="sla-status-message">
                ⚠️ SLA approaching breach
              </small>
            )}

          {/* CRITICAL */}
          {resolutionSeconds !== null &&
            resolutionSeconds > 0 &&
            resolutionSeconds <= 15 * 60 && (
              <small className="sla-status-message">
                🔴 Critical — less than 15 minutes
              </small>
            )}

          {/* BREACHED */}
          {resolutionSeconds !== null &&
            resolutionSeconds <= 0 && (
              <small className="sla-status-message">
                🚨 Resolution SLA breached
              </small>
            )}
        </div>
      );
    })()}

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
                      Assign this ticket to a support agent.
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
                      agentsLoading
                    }
                    onChange={(e) =>
                      assignTicket(
                        ticket._id,
                        e.target.value
                      )
                    }
                  >

                    <option value="">
                      {agentsLoading
                        ? "Loading Support Agents..."
                        : "Unassigned"}
                    </option>

                    {agents.map(
                      (agent) => (
                        <option
                          key={agent._id}
                          value={agent._id}
                        >
                          {agent.name} —{" "}
                          {agent.email}
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
                  !agentsLoading &&
                  agents.length === 0 && (
                    <p className="no-admins-message">
                      ⚠️ No support agents found.
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
                      Waiting for Customer
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