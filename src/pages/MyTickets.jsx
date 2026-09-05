import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiGet } from "../api/api";

function MyTickets() {
  const navigate = useNavigate();

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  // ======================================================
  // FETCH TICKETS
  // ======================================================

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      // ==================================================
      // GET LOGGED-IN USER
      // ==================================================

      const userData =
        localStorage.getItem("user");

      if (!userData) {
        alert("Please login first");
        navigate("/login");
        return;
      }

      // ==================================================
      // PARSE USER
      // ==================================================

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

      // ==================================================
      // GET USER ID
      // ==================================================

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

      // ==================================================
      // CHECK JWT TOKEN
      // ==================================================

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

      // ==================================================
      // GET USER TICKETS
      // JWT IS AUTOMATICALLY ATTACHED
      // ==================================================

      const data = await apiGet(
        `/tickets/user/${userId}`
      );

      console.log(
        "My Tickets:",
        data
      );

      // ==================================================
      // SET TICKETS
      // ==================================================

      setTickets(
        data.tickets || []
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

  // ======================================================
  // UI
  // ======================================================

  return (
    <div className="my-tickets-page">

      {/* ==================================================
          HEADER
      ================================================== */}

      <div className="my-tickets-header">

        <div>

          <h1>
            My Support Tickets 🎫
          </h1>

          <p>
            Track all your support requests
          </p>

        </div>

        <button
          onClick={() =>
            navigate("/create-ticket")
          }
          className="new-ticket-btn"
        >
          + New Ticket
        </button>

      </div>

      {/* ==================================================
          LOADING
      ================================================== */}

      {loading && (
        <div className="message-box">
          Loading tickets...
        </div>
      )}

      {/* ==================================================
          NO TICKETS
      ================================================== */}

      {!loading &&
        tickets.length === 0 && (

        <div className="message-box">

          <div className="empty-icon">
            🎫
          </div>

          <h2>
            No Tickets Found
          </h2>

          <p>
            You haven't created any
            tickets yet.
          </p>

          <button
            onClick={() =>
              navigate("/create-ticket")
            }
            className="new-ticket-btn"
          >
            Create Your First Ticket
          </button>

        </div>
      )}

      {/* ==================================================
          TICKETS
      ================================================== */}

      {!loading &&
        tickets.length > 0 && (

        <div className="tickets-container">

          {tickets.map((ticket) => (

            <div
              className="ticket-card"
              key={ticket._id}
              onClick={() =>
                navigate(
                  `/ticket/${ticket._id}`
                )
              }
              style={{
                cursor: "pointer",
              }}
            >

              {/* ==========================================
                  TICKET HEADER
              ========================================== */}

              <div className="ticket-card-header">

                <div>

                  <h2>
                    {ticket.title}
                  </h2>

                  <small>
                    Ticket ID:{" "}
                    {ticket._id}
                  </small>

                </div>

                <span className="status-badge">
                  {ticket.status ||
                    "Open"}
                </span>

              </div>

              {/* ==========================================
                  DESCRIPTION
              ========================================== */}

              <div className="ticket-description">
                {ticket.description}
              </div>

              {/* ==========================================
                  TICKET INFORMATION
              ========================================== */}

              <div className="ticket-info">

                <div>

                  <label>
                    Category
                  </label>

                  <strong>
                    {ticket.category ||
                      "General"}
                  </strong>

                </div>

                <div>

                  <label>
                    Priority
                  </label>

                  <strong>
                    {ticket.priority ||
                      "Medium"}
                  </strong>

                </div>

                <div>

                  <label>
                    Created
                  </label>

                  <strong>
                    {ticket.createdAt
                      ? new Date(
                          ticket.createdAt
                        ).toLocaleDateString()
                      : "N/A"}
                  </strong>

                </div>

              </div>

              {/* ==========================================
                  DETAILS LINK
              ========================================== */}

              <div
                style={{
                  marginTop: "20px",
                  fontWeight: "bold",
                }}
              >
                Click to view details →
              </div>

            </div>

          ))}

        </div>
      )}

    </div>
  );
}

export default MyTickets;