import { useEffect, useState } from "react";
import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

import { apiGet, apiPut, apiDelete } from "../api/api";
import "./Navbar.css";

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] =
    useState(false);
  const [loadingNotifications, setLoadingNotifications] =
    useState(false);

  // ==========================================================
  // LOAD USER
  // ==========================================================

  useEffect(() => {
    const loadUser = () => {
      const userData =
        localStorage.getItem("user");

      if (!userData) {
        setUser(null);
        return;
      }

      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
      } catch (error) {
        console.error(
          "User parsing error:",
          error
        );

        localStorage.removeItem("user");
        localStorage.removeItem("token");

        setUser(null);
      }
    };

    loadUser();

    window.addEventListener(
      "storage",
      loadUser
    );

    return () => {
      window.removeEventListener(
        "storage",
        loadUser
      );
    };
  }, [location]);

  // ==========================================================
  // ADMIN CHECK
  // ==========================================================

  const isAdmin =
    user?.role === "Admin" ||
    user?.role === "admin" ||
    user?.isAdmin === true;

  // ==========================================================
  // LOAD NOTIFICATIONS
  // ==========================================================

  const loadNotifications = async () => {
    if (!user?._id && !user?.id) {
      return;
    }

    const userId = user._id || user.id;

    try {
      setLoadingNotifications(true);

      const data = await apiGet(
        `/notifications/user/${userId}`
      );

      if (
        data &&
        data.success &&
        Array.isArray(data.notifications)
      ) {
        setNotifications(
          data.notifications
        );
      }

      const countData = await apiGet(
        `/notifications/user/${userId}/unread-count`
      );

      if (
        countData &&
        countData.success
      ) {
        setUnreadCount(
          countData.count || 0
        );
      }
    } catch (error) {
      console.error(
        "Notification loading error:",
        error
      );
    } finally {
      setLoadingNotifications(false);
    }
  };

  // ==========================================================
  // INITIAL NOTIFICATION LOAD
  // ==========================================================

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    loadNotifications();

    const interval = setInterval(() => {
      loadNotifications();
    }, 10000);

    return () => {
      clearInterval(interval);
    };
  }, [user]);

  // ==========================================================
  // MARK SINGLE NOTIFICATION AS READ
  // ==========================================================

  const markAsRead = async (
    notificationId
  ) => {
    try {
      await apiPut(
        `/notifications/${notificationId}/read`,
        {}
      );

      setNotifications((prev) =>
        prev.map((notification) =>
          notification._id ===
          notificationId
            ? {
                ...notification,
                isRead: true,
              }
            : notification
        )
      );

      setUnreadCount((prev) =>
        Math.max(prev - 1, 0)
      );
    } catch (error) {
      console.error(
        "Mark notification read error:",
        error
      );
    }
  };

  // ==========================================================
  // MARK ALL AS READ
  // ==========================================================

  const markAllAsRead = async () => {
    if (!user) return;

    const userId =
      user._id || user.id;

    try {
      await apiPut(
        `/notifications/user/${userId}/read-all`,
        {}
      );

      setNotifications((prev) =>
        prev.map((notification) => ({
          ...notification,
          isRead: true,
        }))
      );

      setUnreadCount(0);
    } catch (error) {
      console.error(
        "Mark all notifications read error:",
        error
      );
    }
  };

  // ==========================================================
  // DELETE NOTIFICATION
  // ==========================================================

  const deleteNotification = async (
    event,
    notificationId
  ) => {
    event.stopPropagation();

    try {
      await apiDelete(
        `/notifications/${notificationId}`
      );

      setNotifications((prev) =>
        prev.filter(
          (notification) =>
            notification._id !==
            notificationId
        )
      );

      setUnreadCount((prev) => {
        const deletedNotification =
          notifications.find(
            (notification) =>
              notification._id ===
              notificationId
          );

        if (
          deletedNotification &&
          !deletedNotification.isRead
        ) {
          return Math.max(
            prev - 1,
            0
          );
        }

        return prev;
      });
    } catch (error) {
      console.error(
        "Delete notification error:",
        error
      );
    }
  };

  // ==========================================================
  // NOTIFICATION CLICK
  // ==========================================================

  const handleNotificationClick = async (
    notification
  ) => {
    if (!notification) return;

    if (!notification.isRead) {
      await markAsRead(
        notification._id
      );
    }

    setShowNotifications(false);

    if (notification.ticketId?._id) {
      navigate(
        `/ticket/${notification.ticketId._id}`
      );
    } else if (
      typeof notification.ticketId ===
      "string"
    ) {
      navigate(
        `/ticket/${notification.ticketId}`
      );
    }
  };

  // ==========================================================
  // LOGOUT
  // ==========================================================

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setUser(null);
    setNotifications([]);
    setUnreadCount(0);
    setShowNotifications(false);

    navigate("/login");
  };

  // ==========================================================
  // ACTIVE LINK
  // ==========================================================

  const isActive = (path) => {
    return location.pathname === path;
  };

  // ==========================================================
  // FORMAT NOTIFICATION TIME
  // ==========================================================

  const formatTime = (date) => {
    if (!date) return "";

    const notificationDate =
      new Date(date);

    if (
      Number.isNaN(
        notificationDate.getTime()
      )
    ) {
      return "";
    }

    return notificationDate.toLocaleString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <nav className="navbar">
      <div className="navbar-container">

        {/* ==================================================
            LOGO
        ================================================== */}

        <Link
          to="/"
          className="navbar-logo"
        >
          SupportFlow
        </Link>

        {/* ==================================================
            NAVIGATION LINKS
        ================================================== */}

        <div className="navbar-links">

          <Link
            to="/"
            className={
              isActive("/")
                ? "active"
                : ""
            }
          >
            Home
          </Link>

          {user && (
            <>
              <Link
                to="/create-ticket"
                className={
                  isActive(
                    "/create-ticket"
                  )
                    ? "active"
                    : ""
                }
              >
                Create Ticket
              </Link>

              <Link
                to="/my-tickets"
                className={
                  isActive(
                    "/my-tickets"
                  )
                    ? "active"
                    : ""
                }
              >
                My Tickets
              </Link>
            </>
          )}

          {user && isAdmin && (
            <>
              <Link
                to="/dashboard"
                className={
                  isActive(
                    "/dashboard"
                  )
                    ? "active"
                    : ""
                }
              >
                Admin Dashboard
              </Link>

              <Link
                to="/analytics"
                className={
                  isActive(
                    "/analytics"
                  )
                    ? "active"
                    : ""
                }
              >
                Analytics
              </Link>
            </>
          )}
        </div>

        {/* ==================================================
            RIGHT SIDE
        ================================================== */}

        <div className="navbar-right">

          {!user ? (
            <>
              <Link
                to="/login"
                className="navbar-login"
              >
                Login
              </Link>

              <Link
                to="/register"
                className="navbar-get-started"
              >
                Get Started
              </Link>
            </>
          ) : (
            <>
              {/* ==========================================
                  NOTIFICATION
              ========================================== */}

              <div className="notification-wrapper">

                <button
                  type="button"
                  className={`notification-button ${
                    unreadCount > 0
                      ? "notification-active"
                      : ""
                  }`}
                  onClick={() =>
                    setShowNotifications(
                      (prev) => !prev
                    )
                  }
                  aria-label="Notifications"
                >
                  <span className="notification-bell">
                    🔔
                  </span>

                  {unreadCount > 0 && (
                    <span className="notification-badge">
                      {unreadCount > 99
                        ? "99+"
                        : unreadCount}
                    </span>
                  )}
                </button>

                {/* ========================================
                    NOTIFICATION DROPDOWN
                ======================================== */}

                {showNotifications && (
                  <div className="notification-dropdown">

                    <div className="notification-header">

                      <div>
                        <h3>
                          Notifications
                        </h3>

                        <span>
                          {unreadCount > 0
                            ? `${unreadCount} unread`
                            : "All caught up"}
                        </span>
                      </div>

                      {unreadCount >
                        0 && (
                        <button
                          type="button"
                          className="mark-all-button"
                          onClick={
                            markAllAsRead
                          }
                        >
                          Mark all read
                        </button>
                      )}
                    </div>

                    <div className="notification-list">

                      {loadingNotifications ? (
                        <div className="notification-empty">
                          <div className="notification-loading">
                            Loading...
                          </div>
                        </div>
                      ) : notifications.length ===
                        0 ? (
                        <div className="notification-empty">
                          <div className="empty-notification-icon">
                            🔔
                          </div>

                          <strong>
                            No notifications
                          </strong>

                          <span>
                            You're all caught up.
                          </span>
                        </div>
                      ) : (
                        notifications.map(
                          (
                            notification
                          ) => (
                            <div
                              key={
                                notification._id
                              }
                              className={`notification-item ${
                                !notification.isRead
                                  ? "unread"
                                  : ""
                              }`}
                              onClick={() =>
                                handleNotificationClick(
                                  notification
                                )
                              }
                            >

                              <div className="notification-item-icon">
                                {notification.type ===
                                "Status"
                                  ? "🔄"
                                  : notification.type ===
                                    "Ticket"
                                  ? "🎫"
                                  : "💬"}
                              </div>

                              <div className="notification-content">

                                <div className="notification-title-row">

                                  <strong>
                                    {
                                      notification.title
                                    }
                                  </strong>

                                  {!notification.isRead && (
                                    <span className="unread-dot"></span>
                                  )}
                                </div>

                                <p>
                                  {
                                    notification.message
                                  }
                                </p>

                                <span className="notification-time">
                                  {formatTime(
                                    notification.createdAt
                                  )}
                                </span>
                              </div>

                              <button
                                type="button"
                                className="notification-delete"
                                onClick={(
                                  event
                                ) =>
                                  deleteNotification(
                                    event,
                                    notification._id
                                  )
                                }
                                aria-label="Delete notification"
                              >
                                ×
                              </button>

                            </div>
                          )
                        )
                      )}

                    </div>
                  </div>
                )}
              </div>

              {/* ==========================================
                  USER
              ========================================== */}

              <div className="navbar-user">

                <span className="user-icon">
                  👤
                </span>

                <span className="user-name">
                  {user.name ||
                    user.email ||
                    "User"}
                </span>

                {isAdmin && (
                  <span className="admin-badge">
                    Admin
                  </span>
                )}
              </div>

              {/* ==========================================
                  LOGOUT
              ========================================== */}

              <button
                type="button"
                className="logout-button"
                onClick={handleLogout}
              >
                Logout
              </button>
            </>
          )}

        </div>
      </div>
    </nav>
  );
}

export default Navbar;