import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  apiGet,
  apiPost,
  apiPut,
} from "../api/api";

function TicketDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [ticket, setTicket] = useState(null);
  const [replies, setReplies] = useState([]);
  const [activities, setActivities] = useState([]);
  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(true);
  const [activityLoading, setActivityLoading] =
    useState(true);
  const [sending, setSending] = useState(false);
  const [updating, setUpdating] = useState(false);

  // =====================================================
  // GET CURRENT USER
  // =====================================================

  const getCurrentUser = () => {
    const userData =
      localStorage.getItem("user");

    if (!userData) {
      return null;
    }

    try {
      return JSON.parse(userData);
    } catch (error) {
      console.error(
        "User Parse Error:",
        error
      );

      return null;
    }
  };

  // =====================================================
  // LOAD DATA
  // =====================================================

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    loadData();
  }, [id]);

  const loadData = async () => {
    setLoading(true);

    await Promise.all([
      fetchTicket(),
      fetchReplies(),
      fetchActivities(),
    ]);

    setLoading(false);
  };

  // =====================================================
  // FETCH TICKET
  // =====================================================

  const fetchTicket = async () => {
    try {
      const data = await apiGet(
        `/ticket/${id}`
      );

      console.log(
        "Ticket Details:",
        data
      );

      setTicket(
        data.ticket || null
      );
    } catch (error) {
      console.error(
        "Fetch Ticket Error:",
        error
      );

      setTicket(null);

      alert(
        error.message ||
          "Failed to load ticket"
      );
    }
  };

  // =====================================================
  // FETCH REPLIES
  // =====================================================

  const fetchReplies = async () => {
    try {
      const data = await apiGet(
        `/replies/ticket/${id}`
      );

      console.log(
        "Ticket Replies:",
        data
      );

      setReplies(
        data.replies || []
      );
    } catch (error) {
      console.error(
        "Fetch Replies Error:",
        error
      );

      setReplies([]);
    }
  };

  // =====================================================
  // FETCH ACTIVITIES
  // =====================================================

  const fetchActivities = async () => {
    try {
      setActivityLoading(true);

      const data = await apiGet(
        `/admin/activity/ticket/${id}`
      );

      console.log(
        "Ticket Activities:",
        data
      );

      setActivities(
        data.activities || []
      );
    } catch (error) {
      console.error(
        "Fetch Activities Error:",
        error
      );

      setActivities([]);
    } finally {
      setActivityLoading(false);
    }
  };

  // =====================================================
  // CHECK ADMIN
  // =====================================================

  const checkIfAdmin = (user) => {
    if (!user) {
      return false;
    }

    return (
      user.role === "Admin" ||
      user.role === "admin" ||
      user.isAdmin === true
    );
  };

  // =====================================================
  // GET TICKET OWNER ID
  // =====================================================

  const getTicketOwnerId = () => {
    if (!ticket?.userId) {
      return null;
    }

    if (
      typeof ticket.userId ===
      "object"
    ) {
      return (
        ticket.userId._id ||
        ticket.userId.id
      );
    }

    return ticket.userId;
  };

  // =====================================================
  // ATTACHMENT HELPERS
  // =====================================================

  const API_BASE_URL = "http://localhost:5000/api";

  const getAttachmentUrl = (
    attachment,
    type = "ticket",
    replyId = null
  ) => {
    if (!attachment?._id) {
      return "#";
    }

    if (type === "reply") {
      return `${API_BASE_URL}/attachments/reply/${replyId}/${attachment._id}`;
    }

    return `${API_BASE_URL}/attachments/ticket/${id}/${attachment._id}`;
  };

  const getFileIcon = (fileName = "") => {
    const extension = fileName.split(".").pop()?.toLowerCase();

    switch (extension) {
      case "pdf":
        return "📕";
      case "doc":
      case "docx":
        return "📘";
      case "xls":
      case "xlsx":
        return "📊";
      case "zip":
        return "🗜️";
      case "txt":
        return "📝";
      case "jpg":
      case "jpeg":
      case "png":
      case "gif":
      case "webp":
        return "🖼️";
      default:
        return "📎";
    }
  };

  const isImageFile = (fileName = "") => {
    const extension = fileName.split(".").pop()?.toLowerCase();

    return ["jpg", "jpeg", "png", "gif", "webp"].includes(extension);
  };

  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) {
      return "0 KB";
    }

    if (bytes < 1024) {
      return `${bytes} B`;
    }

    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }

    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const downloadAttachment = async (
    attachment,
    type = "ticket",
    replyId = null
  ) => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        alert("Authentication token not found. Please login again.");
        navigate("/login");
        return;
      }

      const url = getAttachmentUrl(
        attachment,
        type,
        replyId
      );

      if (url === "#") {
        throw new Error("Invalid attachment.");
      }

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        let errorMessage = "Failed to download attachment.";

        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch {
          // Ignore non-JSON error responses
        }

        throw new Error(errorMessage);
      }

      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = blobUrl;
      link.download =
        attachment.originalName ||
        attachment.fileName ||
        "attachment";

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Attachment Download Error:", error);
      alert(error.message || "Failed to download attachment.");
    }
  };

  const previewAttachment = async (
    attachment,
    type = "ticket",
    replyId = null
  ) => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        alert("Authentication token not found. Please login again.");
        navigate("/login");
        return;
      }

      const url = getAttachmentUrl(
        attachment,
        type,
        replyId
      );

      if (url === "#") {
        throw new Error("Invalid attachment.");
      }

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        let errorMessage = "Unable to preview attachment.";

        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch {
          // Ignore non-JSON error responses
        }

        throw new Error(errorMessage);
      }

      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const previewWindow = window.open(blobUrl, "_blank");

      if (!previewWindow) {
        window.URL.revokeObjectURL(blobUrl);
        throw new Error("Please allow pop-ups to preview the image.");
      }

      setTimeout(() => {
        window.URL.revokeObjectURL(blobUrl);
      }, 60000);
    } catch (error) {
      console.error("Attachment Preview Error:", error);
      alert(error.message || "Unable to preview attachment.");
    }
  };

  const renderAttachment = (
    attachment,
    type = "ticket",
    replyId = null
  ) => {
    if (!attachment) {
      return null;
    }

    const fileName =
      attachment.originalName ||
      attachment.fileName ||
      "Attachment";

    return (
      <div
        key={attachment._id}
        className="ticket-attachment-card"
      >
        <div className="ticket-attachment-left">
          <div className="ticket-attachment-icon">
            {getFileIcon(fileName)}
          </div>

          <div className="ticket-attachment-info">
            <strong title={fileName}>
              {fileName}
            </strong>

            <span>
              {formatFileSize(attachment.size)}
            </span>
          </div>
        </div>

        <div className="ticket-attachment-actions">
          {isImageFile(fileName) && (
            <button
              type="button"
              className="attachment-preview-btn"
              onClick={() =>
                previewAttachment(
                  attachment,
                  type,
                  replyId
                )
              }
            >
              👁️ Preview
            </button>
          )}

          <button
            type="button"
            className="attachment-download-btn"
            onClick={() =>
              downloadAttachment(
                attachment,
                type,
                replyId
              )
            }
          >
            📥 Download
          </button>
        </div>
      </div>
    );
  };

  // =====================================================
  // SEND REPLY
  // =====================================================

  const sendReply = async (e) => {
    e.preventDefault();

    const text = message.trim();

    if (!text) {
      return;
    }

    const user =
      getCurrentUser();

    if (!user) {
      alert(
        "Please login first."
      );

      navigate("/login");

      return;
    }

    const token =
      localStorage.getItem("token");

    if (!token) {
      alert(
        "Authentication token not found. Please login again."
      );

      localStorage.removeItem(
        "user"
      );

      navigate("/login");

      return;
    }

    const currentUserId =
      user._id || user.id;

    if (!currentUserId) {
      alert(
        "Please login again."
      );

      navigate("/login");

      return;
    }

    try {
      setSending(true);

      const ticketOwnerId =
        getTicketOwnerId();

      const isAdminByRole =
        checkIfAdmin(user);

      const isTicketOwner =
        ticketOwnerId &&
        String(ticketOwnerId) ===
          String(currentUserId);

      const senderType =
        isAdminByRole ||
        !isTicketOwner
          ? "Admin"
          : "Customer";

      const data =
        await apiPost(
          "/replies",
          {
            ticketId: id,
            userId:
              currentUserId,
            message: text,
            senderType:
              senderType,
          }
        );

      console.log(
        "Send Reply Response:",
        data
      );

      if (data.reply) {
        setReplies(
          (previousReplies) => [
            ...previousReplies,
            data.reply,
          ]
        );
      }

      setMessage("");

      // Refresh activity timeline
      await fetchActivities();
    } catch (error) {
      console.error(
        "Send Reply Error:",
        error
      );

      alert(
        error.message ||
          "Failed to send reply"
      );
    } finally {
      setSending(false);
    }
  };

  // =====================================================
  // UPDATE STATUS
  // =====================================================

  const updateStatus = async (
    newStatus
  ) => {
    try {
      setUpdating(true);

      const data =
        await apiPut(
          `/admin/tickets/${id}/status`,
          {
            status:
              newStatus,
          }
        );

      console.log(
        "Update Status Response:",
        data
      );

      setTicket(
        (previousTicket) => ({
          ...previousTicket,

          status:
            data.ticket?.status ||
            newStatus,
        })
      );

      // Refresh activity timeline
      await fetchActivities();
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
      setUpdating(false);
    }
  };

  // =====================================================
  // DATE FORMAT
  // =====================================================

  const formatDate = (
    date
  ) => {
    if (!date) {
      return "N/A";
    }

    try {
      return new Date(
        date
      ).toLocaleString(
        "en-IN",
        {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }
      );
    } catch {
      return "N/A";
    }
  };

  // =====================================================
  // ACTIVITY TIME
  // =====================================================

  const formatActivityDate = (
    date
  ) => {
    if (!date) {
      return "N/A";
    }

    try {
      return new Date(
        date
      ).toLocaleString(
        "en-IN",
        {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }
      );
    } catch {
      return "N/A";
    }
  };

  // =====================================================
  // STATUS CLASS
  // =====================================================

  const getStatusClass = (
    status
  ) => {
    switch (status) {
      case "Open":
        return "status-open";

      case "In Progress":
        return "status-in-progress";

      case "Resolved":
        return "status-resolved";

      case "Closed":
        return "status-closed";

      default:
        return "status-open";
    }
  };

  // =====================================================
  // PRIORITY CLASS
  // =====================================================

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

  // =====================================================
  // ACTIVITY ICON
  // =====================================================

  const getActivityIcon = (
    action
  ) => {
    switch (action) {
      case "Ticket Created":
        return "🎫";

      case "Ticket Assigned":
        return "👤";

      case "Ticket Unassigned":
        return "↩️";

      case "Status Changed":
        return "🔄";

      case "Priority Changed":
        return "⚡";

      case "Customer Reply":
        return "💬";

      case "Admin Reply":
        return "🛠️";

      case "Ticket Deleted":
        return "🗑️";

      default:
        return "📌";
    }
  };

  // =====================================================
  // ACTIVITY CLASS
  // =====================================================

  const getActivityClass = (
    action
  ) => {
    switch (action) {
      case "Ticket Created":
        return "activity-created";

      case "Ticket Assigned":
        return "activity-assigned";

      case "Ticket Unassigned":
        return "activity-unassigned";

      case "Status Changed":
        return "activity-status";

      case "Priority Changed":
        return "activity-priority";

      case "Customer Reply":
        return "activity-customer";

      case "Admin Reply":
        return "activity-admin";

      case "Ticket Deleted":
        return "activity-deleted";

      default:
        return "activity-default";
    }
  };

  // =====================================================
  // ACTIVITY VALUE
  // =====================================================

  const renderActivityValues = (
    activity
  ) => {
    if (
      !activity.oldValue &&
      !activity.newValue
    ) {
      return null;
    }

    return (
      <div className="activity-values">

        {activity.oldValue && (
          <span className="activity-old-value">
            {activity.oldValue}
          </span>
        )}

        {activity.oldValue &&
          activity.newValue && (
            <span className="activity-arrow">
              →
            </span>
          )}

        {activity.newValue && (
          <span className="activity-new-value">
            {activity.newValue}
          </span>
        )}

      </div>
    );
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="ticket-details-page">

        <div className="ticket-loading-card">

          <div className="big-loading-icon">
            ⏳
          </div>

          <h2>
            Loading Ticket...
          </h2>

          <p>
            Please wait while we load your ticket.
          </p>

        </div>

      </div>
    );
  }

  // =====================================================
  // NOT FOUND
  // =====================================================

  if (!ticket) {
    return (
      <div className="ticket-details-page">

        <div className="ticket-loading-card">

          <div className="big-loading-icon">
            🎫
          </div>

          <h2>
            Ticket Not Found
          </h2>

          <p>
            We could not find this support ticket.
          </p>

          <button
            type="button"
            className="professional-back-btn"
            onClick={() =>
              navigate(-1)
            }
          >
            ← Go Back
          </button>

        </div>

      </div>
    );
  }

  // =====================================================
  // CURRENT USER
  // =====================================================

  const user =
    getCurrentUser();

  const currentUserId =
    user?._id || user?.id;

  const isAdmin =
    checkIfAdmin(user);

  // =====================================================
  // MAIN UI
  // =====================================================

  return (
    <div className="ticket-details-page">

      {/* =================================================
          BACK BUTTON
      ================================================= */}

      <div className="ticket-top-navigation">

        <button
          type="button"
          className="professional-back-btn"
          onClick={() =>
            navigate(-1)
          }
        >
          ← Back
        </button>

      </div>


      {/* =================================================
          TICKET CARD
      ================================================= */}

      <div className="professional-ticket-card">

        <div className="professional-ticket-header">

          <div className="ticket-title-area">

            <div className="ticket-small-label">
              SUPPORT TICKET
            </div>

            <h1>
              {ticket.title}
            </h1>

            <p className="professional-ticket-id">
              Ticket ID:{" "}
              {ticket._id}
            </p>

          </div>

          <div className="ticket-badge-area">

            <span
              className={`professional-status-badge ${getStatusClass(
                ticket.status
              )}`}
            >
              {ticket.status ||
                "Open"}
            </span>

            <span
              className={`professional-priority-badge ${getPriorityClass(
                ticket.priority
              )}`}
            >
              {ticket.priority ||
                "Medium"}
            </span>

          </div>

        </div>


        {/* =================================================
            DESCRIPTION
        ================================================= */}

        <div className="professional-description">

          <h3>
            Description
          </h3>

          <p>
            {ticket.description}
          </p>

        </div>

        {/* =================================================
            TICKET ATTACHMENTS
        ================================================= */}

        {ticket.attachments &&
          ticket.attachments.length > 0 && (

          <div className="ticket-attachments-section">

            <div className="ticket-attachments-header">
              <div>
                <h3>📎 Attachments</h3>
                <p>Files attached to this ticket</p>
              </div>

              <span className="attachment-count">
                {ticket.attachments.length}{" "}
                {ticket.attachments.length === 1
                  ? "File"
                  : "Files"}
              </span>
            </div>

            <div className="ticket-attachments-list">
              {ticket.attachments.map((attachment) =>
                renderAttachment(
                  attachment,
                  "ticket"
                )
              )}
            </div>

          </div>

        )}


        {/* =================================================
            INFO GRID
        ================================================= */}

        <div className="professional-info-grid">

          <div className="professional-info-card">

            <span>
              Category
            </span>

            <strong>
              {ticket.category ||
                "General"}
            </strong>

          </div>


          <div className="professional-info-card">

            <span>
              Priority
            </span>

            <strong>
              {ticket.priority ||
                "Medium"}
            </strong>

          </div>


          <div className="professional-info-card">

            <span>
              Status
            </span>

            <strong>
              {ticket.status ||
                "Open"}
            </strong>

          </div>


          <div className="professional-info-card">

            <span>
              Created
            </span>

            <strong>
              {formatDate(
                ticket.createdAt
              )}
            </strong>

          </div>

        </div>

      </div>


      {/* =================================================
          ACTIVITY TIMELINE
      ================================================= */}

      <div className="professional-activity-card">

        <div className="professional-activity-header">

          <div className="activity-header-left">

            <div className="activity-header-icon">
              📋
            </div>

            <div>
              <h2>
                Activity Timeline
              </h2>

              <p>
                Complete history of this support ticket
              </p>
            </div>

          </div>

          <div className="activity-counter">
            {activities.length}{" "}
            {activities.length === 1
              ? "Activity"
              : "Activities"}
          </div>

        </div>


        <div className="professional-activity-body">

          {activityLoading ? (

            <div className="activity-loading">
              <div className="activity-loading-icon">
                ⏳
              </div>

              <p>
                Loading activity history...
              </p>
            </div>

          ) : activities.length === 0 ? (

            <div className="professional-empty-activity">

              <div className="empty-activity-icon">
                📋
              </div>

              <h3>
                No activity yet
              </h3>

              <p>
                Ticket activity will appear here automatically.
              </p>

            </div>

          ) : (

            <div className="activity-timeline">

              {activities.map(
                (activity, index) => {

                  const activityUser =
                    activity.userId;

                  const userName =
                    activityUser?.name ||
                    "System";

                  return (
                    <div
                      key={
                        activity._id ||
                        index
                      }
                      className="activity-timeline-item"
                    >

                      {/* TIMELINE LINE */}

                      {index !==
                        activities.length -
                          1 && (
                        <div className="activity-line" />
                      )}


                      {/* ICON */}

                      <div
                        className={`activity-icon ${getActivityClass(
                          activity.action
                        )}`}
                      >
                        {getActivityIcon(
                          activity.action
                        )}
                      </div>


                      {/* CONTENT */}

                      <div className="activity-content">

                        <div className="activity-top-row">

                          <div>

                            <span className="activity-action">
                              {activity.action}
                            </span>

                            <span className="activity-user">
                              by{" "}
                              <strong>
                                {userName}
                              </strong>
                            </span>

                          </div>

                          <span className="activity-time">
                            {formatActivityDate(
                              activity.createdAt
                            )}
                          </span>

                        </div>


                        <p className="activity-description">
                          {activity.description}
                        </p>


                        {renderActivityValues(
                          activity
                        )}

                      </div>

                    </div>
                  );
                }
              )}

            </div>

          )}

        </div>

      </div>


      {/* =================================================
          CONVERSATION
      ================================================= */}

      <div className="professional-chat-card">

        <div className="professional-chat-header">

          <div className="chat-header-left">

            <div className="chat-icon">
              💬
            </div>

            <div>

              <h2>
                Conversation
              </h2>

              <p>
                Communicate with the support team
              </p>

            </div>

          </div>

          <div className="message-counter">

            {replies.length}

            {" "}

            {replies.length === 1
              ? "Message"
              : "Messages"}

          </div>

        </div>


        <div className="professional-chat-body">

          {replies.length === 0 ? (

            <div className="professional-empty-chat">

              <div className="empty-chat-icon">
                💬
              </div>

              <h3>
                No messages yet
              </h3>

              <p>
                Start the conversation by
                sending a message below.
              </p>

            </div>

          ) : (

            <div className="professional-message-list">

              {replies.map(
                (reply) => {

                  const replyUserId =
                    reply.userId?._id ||
                    reply.userId;

                  const isMine =
                    String(
                      replyUserId
                    ) ===
                    String(
                      currentUserId
                    );

                  const actualSenderType =
                    reply.senderType ===
                    "Admin"
                      ? "Admin"
                      : "Customer";

                  const isReplyAdmin =
                    actualSenderType ===
                    "Admin";

                  let senderName =
                    "Customer";

                  if (isMine) {
                    senderName =
                      "You";
                  } else if (
                    isReplyAdmin
                  ) {
                    senderName =
                      reply.userId?.name ||
                      "Support Admin";
                  } else {
                    senderName =
                      reply.userId?.name ||
                      "Customer";
                  }

                  return (
                    <div
                      key={
                        reply._id
                      }
                      className={`professional-message-row ${
                        isReplyAdmin
                          ? "message-row-admin"
                          : isMine
                          ? "message-row-mine"
                          : "message-row-other"
                      }`}
                    >

                      <div
                        className={`message-avatar ${
                          isReplyAdmin
                            ? "avatar-admin"
                            : "avatar-customer"
                        }`}
                      >
                        {isReplyAdmin
                          ? "🛠️"
                          : "👤"}
                      </div>


                      <div
                        className={`professional-message-wrapper ${
                          isReplyAdmin
                            ? "message-wrapper-admin"
                            : isMine
                            ? "message-wrapper-mine"
                            : "message-wrapper-other"
                        }`}
                      >

                        <div className="message-name-line">

                          <strong>
                            {senderName}
                          </strong>

                          <span
                            className={
                              isReplyAdmin
                                ? "admin-message-label"
                                : "customer-message-label"
                            }
                          >
                            {
                              actualSenderType
                            }
                          </span>

                        </div>


                        <div
                          className={`professional-message-bubble ${
                            isReplyAdmin
                              ? "message-bubble-admin"
                              : isMine
                              ? "message-bubble-mine"
                              : "message-bubble-customer"
                          }`}
                        >
                          {reply.message}
                        </div>

                        {/* =================================================
                            REPLY ATTACHMENTS
                        ================================================= */}

                        {reply.attachments &&
                          reply.attachments.length > 0 && (

                          <div className="reply-attachments">
                            {reply.attachments.map((attachment) =>
                              renderAttachment(
                                attachment,
                                "reply",
                                reply._id
                              )
                            )}
                          </div>

                        )}


                        <div className="message-time">

                          {formatDate(
                            reply.createdAt
                          )}

                        </div>

                      </div>

                    </div>
                  );
                }
              )}

            </div>

          )}

        </div>


        {/* =================================================
            REPLY FORM
        ================================================= */}

        {ticket.status !==
        "Closed" ? (

          <form
            className="professional-reply-form"
            onSubmit={
              sendReply
            }
          >

            <div className="reply-input-wrapper">

              <textarea
                value={message}
                onChange={(e) =>
                  setMessage(
                    e.target.value
                  )
                }
                placeholder="Type your message here..."
                rows={4}
                maxLength={1000}
                disabled={sending}
              />

              <div className="reply-input-footer">

                <span className="character-count">
                  {message.length}/1000
                </span>

                <button
                  type="submit"
                  className="professional-send-btn"
                  disabled={
                    sending ||
                    !message.trim()
                  }
                >
                  {sending
                    ? "Sending..."
                    : "Send Reply 💬"}
                </button>

              </div>

            </div>

          </form>

        ) : (

          <div className="professional-closed-message">
            🔒 This ticket is closed. New replies
            are disabled.
          </div>

        )}

      </div>


      {/* =================================================
          ADMIN CONTROLS
      ================================================= */}

      {isAdmin && (

        <div className="professional-admin-control">

          <div>

            <h3>
              🛠️ Admin Controls
            </h3>

            <p>
              Update the status of this support ticket.
            </p>

          </div>

          <select
            value={
              ticket.status ||
              "Open"
            }
            disabled={updating}
            onChange={(e) =>
              updateStatus(
                e.target.value
              )
            }
          >

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

          {updating && (
            <span className="admin-updating">
              Updating...
            </span>
          )}

        </div>

      )}

    </div>
  );
}

export default TicketDetails;