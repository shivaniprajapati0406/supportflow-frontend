import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiPost } from "../api/api";
import "./AIChatbot.css";

const AIChatbot = () => {
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [messages, setMessages] = useState([
    {
      sender: "ai",
      text: "Hi! 👋 I'm SupportFlow AI. How can I help you today?",
    },
  ]);

  // ==================================================
  // CREATE TICKET FROM CHAT
  // ==================================================

  const handleCreateTicket = () => {
    const customerMessages = messages
      .filter((msg) => msg.sender === "user")
      .map((msg) => msg.text.trim())
      .filter(Boolean);

    // No customer message
    if (customerMessages.length === 0) {
      navigate("/create-ticket");
      setIsOpen(false);
      return;
    }

    // First customer message becomes ticket title
    let ticketTitle = customerMessages[0];

    // Keep title short
    if (ticketTitle.length > 80) {
      ticketTitle =
        ticketTitle.substring(0, 77) + "...";
    }

    // All customer messages become description
    const ticketDescription =
      customerMessages.join("\n\n");

    // Save chatbot ticket draft
    localStorage.setItem(
      "aiTicketDraft",
      JSON.stringify({
        title: ticketTitle,
        description: ticketDescription,
      })
    );

    // Open Create Ticket page
    navigate("/create-ticket");

    // Close chatbot
    setIsOpen(false);
  };

  // ==================================================
  // SEND MESSAGE
  // ==================================================

  const handleSend = async () => {
    const userMessage = message.trim();

    if (!userMessage || isLoading) {
      return;
    }

    // Add customer message
    const updatedMessages = [
      ...messages,
      {
        sender: "user",
        text: userMessage,
      },
    ];

    setMessages(updatedMessages);
    setMessage("");
    setIsLoading(true);

    try {
      // Prepare conversation
      const conversation =
        updatedMessages
          .map((msg) => {
            const sender =
              msg.sender === "user"
                ? "Customer"
                : "SupportFlow AI";

            return `${sender}: ${msg.text}`;
          })
          .join("\n");

      // Call AI backend
      const data = await apiPost(
        "/ai/chat",
        {
          message: userMessage,
          conversation,
        }
      );

      if (
        data?.success &&
        data?.reply
      ) {
        setMessages((prev) => [
          ...prev,
          {
            sender: "ai",
            text: data.reply,
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            sender: "ai",
            text:
              data?.message ||
              "Sorry, I couldn't generate a response right now.",
          },
        ]);
      }

    } catch (error) {
      console.error(
        "AI Chatbot Error:",
        error
      );

      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text:
            "Sorry, I'm having trouble connecting right now. Please try again.",
        },
      ]);

    } finally {
      setIsLoading(false);
    }
  };

  // ==================================================
  // UI
  // ==================================================

  return (
    <>
      {/* ==================================================
          FLOATING AI BUTTON
      ================================================== */}

      <button
        className="ai-chatbot-button"
        onClick={() =>
          setIsOpen(!isOpen)
        }
        aria-label="Open AI Chatbot"
      >
        🤖
      </button>

      {/* ==================================================
          CHAT WINDOW
      ================================================== */}

      {isOpen && (
        <div className="ai-chatbot-window">

          {/* HEADER */}

          <div className="ai-chatbot-header">

            <div>
              <h3>
                🤖 SupportFlow AI
              </h3>

              <span>
                AI Support Assistant
              </span>
            </div>

            <button
              className="ai-chatbot-close"
              onClick={() =>
                setIsOpen(false)
              }
            >
              ×
            </button>

          </div>


          {/* ==================================================
              MESSAGES
          ================================================== */}

          <div className="ai-chatbot-messages">

            {messages.map(
              (msg, index) => (
                <div
                  key={index}
                  className={`chat-message ${msg.sender}`}
                >
                  {msg.text}
                </div>
              )
            )}

            {isLoading && (
              <div className="chat-message ai">
                🤖 Thinking...
              </div>
            )}

          </div>


          {/* ==================================================
              CREATE SUPPORT TICKET
          ================================================== */}

          <div className="ai-chatbot-ticket-action">

            <button
              type="button"
              onClick={
                handleCreateTicket
              }
            >
              🎫 Create Support Ticket
            </button>

          </div>


          {/* ==================================================
              INPUT
          ================================================== */}

          <div className="ai-chatbot-input-area">

            <input
              type="text"
              placeholder="Describe your problem..."
              value={message}
              disabled={isLoading}
              onChange={(e) =>
                setMessage(
                  e.target.value
                )
              }
              onKeyDown={(e) => {
                if (
                  e.key === "Enter"
                ) {
                  handleSend();
                }
              }}
            />

            <button
              onClick={handleSend}
              disabled={
                isLoading ||
                !message.trim()
              }
            >
              {isLoading
                ? "..."
                : "➤"}
            </button>

          </div>

        </div>
      )}
    </>
  );
};

export default AIChatbot;