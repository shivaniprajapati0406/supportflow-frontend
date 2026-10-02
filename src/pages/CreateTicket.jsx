import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiPostFormData } from "../api/api";
import "./CreateTicket.css";

function CreateTicket() {
  const navigate = useNavigate();

  // ==================================================
  // TICKET STATE
  // ==================================================

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Technical");
  const [priority, setPriority] = useState("Medium");

  // ==================================================
  // FILE STATE
  // ==================================================

  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  // ==================================================
  // CUSTOMER LOCATION
  // ==================================================

  const [location, setLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState("");

  // ==================================================
  // AI TICKET INTELLIGENCE
  // ==================================================

  const [aiLoading, setAiLoading] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [aiError, setAiError] = useState("");

  // ==================================================
  // LOAD AI CHATBOT TICKET DRAFT
  // ==================================================

  useEffect(() => {
    try {
      const savedDraft =
        localStorage.getItem("aiTicketDraft");

      if (!savedDraft) {
        return;
      }

      const draft =
        JSON.parse(savedDraft);

    if (draft?.title) {
  setTitle(
    draft.title
  );
}

if (draft?.description) {
  setDescription(
    draft.description
  );
}

      // Remove draft after loading
      localStorage.removeItem(
        "aiTicketDraft"
      );

    } catch (error) {
      console.error(
        "AI Ticket Draft Error:",
        error
      );

      localStorage.removeItem(
        "aiTicketDraft"
      );
    }
  }, []);

  // ==================================================
  // FILE CONFIGURATION
  // ==================================================

  const MAX_FILES = 5;
  const MAX_FILE_SIZE =
    10 * 1024 * 1024;

  const allowedExtensions = [
    ".jpg",
    ".jpeg",
    ".png",
    ".gif",
    ".webp",
    ".pdf",
    ".txt",
    ".doc",
    ".docx",
    ".xls",
    ".xlsx",
    ".zip",
  ];

  // ==================================================
  // FILE SELECTION
  // ==================================================

  const handleFileChange = (e) => {
    const selectedFiles =
      Array.from(
        e.target.files || []
      );

    if (
      selectedFiles.length === 0
    ) {
      return;
    }

    if (
      files.length +
        selectedFiles.length >
      MAX_FILES
    ) {
      alert(
        `You can upload maximum ${MAX_FILES} files.`
      );

      e.target.value = "";
      return;
    }

    const validFiles = [];

    for (const file of selectedFiles) {
      const extension =
        "." +
        file.name
          .split(".")
          .pop()
          .toLowerCase();

      if (
        file.size >
        MAX_FILE_SIZE
      ) {
        alert(
          `"${file.name}" is larger than 10 MB.`
        );

        continue;
      }

      if (
        !allowedExtensions.includes(
          extension
        )
      ) {
        alert(
          `"${file.name}" is not an allowed file type.`
        );

        continue;
      }

      validFiles.push(file);
    }

    setFiles(
      (previousFiles) => [
        ...previousFiles,
        ...validFiles,
      ]
    );

    e.target.value = "";
  };

  // ==================================================
  // REMOVE FILE
  // ==================================================

  const removeFile = (
    indexToRemove
  ) => {
    setFiles(
      (previousFiles) =>
        previousFiles.filter(
          (_, index) =>
            index !==
            indexToRemove
        )
    );
  };

  // ==================================================
  // FORMAT FILE SIZE
  // ==================================================

  const formatFileSize = (
    size
  ) => {
    if (size < 1024) {
      return `${size} B`;
    }

    if (
      size <
      1024 * 1024
    ) {
      return `${(
        size / 1024
      ).toFixed(1)} KB`;
    }

    return `${(
      size /
      (1024 * 1024)
    ).toFixed(1)} MB`;
  };

  // ==================================================
  // NORMALIZE AI CATEGORY
  // ==================================================

  const normalizeAiCategory = (
    aiCategory
  ) => {
    const value =
      String(
        aiCategory || ""
      )
        .trim()
        .toLowerCase();

    const categoryMap = {
      technical:
        "Technical",

      "technical support":
        "Technical",

      software:
        "Technical",

      hardware:
        "Technical",

      network:
        "Technical",

      account:
        "Account",

      login:
        "Account",

      security:
        "Account",

      billing:
        "Billing",

      payment:
        "Billing",

      general:
        "General",
    };

    return (
      categoryMap[value] ||
      "General"
    );
  };

  // ==================================================
  // ANALYZE TICKET WITH AI
  // ==================================================

  const handleAiAnalyze =
    async () => {
      if (!title.trim()) {
        alert(
          "Please enter a ticket title first."
        );

        return;
      }

      if (!description.trim()) {
        alert(
          "Please describe your issue first."
        );

        return;
      }

      const token =
        localStorage.getItem(
          "token"
        );

      if (!token) {
        alert(
          "Authentication token not found. Please login again."
        );

        navigate("/login");

        return;
      }

      try {
        setAiLoading(true);
        setAiError("");
        setAiAnalysis(null);

        const apiBaseUrl =
          import.meta.env
            .VITE_API_BASE_URL ||
          "http://localhost:5000/api";

        const response =
          await fetch(
            `${apiBaseUrl}/ai/analyze-ticket`,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",

                Authorization:
                  `Bearer ${token}`,
              },

              body: JSON.stringify({
                title:
                  title.trim(),

                description:
                  description.trim(),
              }),
            }
          );

        const data =
          await response.json();

        if (
          !response.ok ||
          !data.success
        ) {
          throw new Error(
            data.message ||
              "AI analysis failed"
          );
        }

        if (!data.analysis) {
          throw new Error(
            "AI analysis response is empty"
          );
        }

        setAiAnalysis(
          data.analysis
        );

      } catch (error) {
        console.error(
          "AI Ticket Analysis Error:",
          error
        );

        const message =
          error.message ||
          "Unable to analyze ticket with AI.";

        setAiError(message);

        alert(message);

      } finally {
        setAiLoading(false);
      }
    };

  // ==================================================
  // APPLY AI SUGGESTIONS
  // ==================================================

  const handleApplyAiSuggestions =
    () => {
      if (!aiAnalysis) {
        return;
      }

      setCategory(
        normalizeAiCategory(
          aiAnalysis.category
        )
      );

      setPriority(
        [
          "Low",
          "Medium",
          "High",
          "Urgent",
        ].includes(
          aiAnalysis.priority
        )
          ? aiAnalysis.priority
          : "Medium"
      );
    };

  // ==================================================
  // GET CUSTOMER LOCATION
  // ==================================================

  const handleGetLocation = () => {
    setLocationError("");

    if (!navigator.geolocation) {
      setLocationError(
        "Location is not supported by this browser."
      );
      return;
    }

    setLocationLoading(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } =
          position.coords;

        setLocation({
          latitude,
          longitude,
          accuracy,
          capturedAt: new Date().toISOString(),
        });

        setLocationError("");
        setLocationLoading(false);
      },
      (error) => {
        console.error("Location Error:", error);

        let message =
          "Unable to get your location.";

        if (error.code === 1) {
          message =
            "Location permission was denied. Please allow location access and try again.";
        } else if (error.code === 2) {
          message =
            "Your location could not be determined. Please try again.";
        } else if (error.code === 3) {
          message =
            "Location request timed out. Please try again.";
        }

        setLocationError(message);
        setLocationLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 30000,
        maximumAge: 0,
      }
    );
  };

  // ==================================================
  // REMOVE CUSTOMER LOCATION
  // ==================================================

  const removeLocation = () => {
    setLocation(null);
    setLocationError("");
  };

  // ==================================================
  // SUBMIT TICKET
  // ==================================================

  const handleSubmit =
    async (e) => {
      e.preventDefault();

      try {
        const userData =
          localStorage.getItem(
            "user"
          );

        if (!userData) {
          alert(
            "Please login first"
          );

          navigate("/login");

          return;
        }

        let user;

        try {
          user =
            JSON.parse(
              userData
            );

        } catch (error) {
          console.error(
            "Invalid user data:",
            error
          );

          localStorage.removeItem(
            "user"
          );

          localStorage.removeItem(
            "token"
          );

          alert(
            "Session expired. Please login again."
          );

          navigate("/login");

          return;
        }

        const userId =
          user._id ||
          user.id;

        if (!userId) {
          alert(
            "User ID not found. Please login again."
          );

          localStorage.removeItem(
            "user"
          );

          localStorage.removeItem(
            "token"
          );

          navigate("/login");

          return;
        }

        const token =
          localStorage.getItem(
            "token"
          );

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

        if (!title.trim()) {
          alert(
            "Please enter a ticket title."
          );

          return;
        }

        if (!description.trim()) {
          alert(
            "Please describe your issue."
          );

          return;
        }

        setLoading(true);

        const formData =
          new FormData();

        formData.append(
          "userId",
          userId
        );

        formData.append(
          "title",
          title.trim()
        );

        formData.append(
          "description",
          description.trim()
        );

        formData.append(
          "category",
          category
        );

        formData.append(
          "priority",
          priority
        );

        // ==================================================
        // SAVE CUSTOMER LOCATION
        // ==================================================

        if (location) {
          formData.append(
            "location",
            JSON.stringify(location)
          );
        }

        // ==================================================
        // SAVE AI ANALYSIS
        // ==================================================

        if (aiAnalysis) {
          formData.append(
            "aiAnalysis",
            JSON.stringify({
              category: String(
                aiAnalysis.category ||
                  ""
              ).trim(),

              priority: [
                "Low",
                "Medium",
                "High",
                "Urgent",
              ].includes(
                aiAnalysis.priority
              )
                ? aiAnalysis.priority
                : "Medium",

              sentiment: [
                "Positive",
                "Neutral",
                "Negative",
                "Angry",
                "Frustrated",
              ].includes(
                aiAnalysis.sentiment
              )
                ? aiAnalysis.sentiment
                : "Neutral",

              summary:
                String(
                  aiAnalysis.summary ||
                    ""
                ).trim(),

              analyzedAt:
                aiAnalysis.analyzedAt ||
                new Date().toISOString(),
            })
          );
        }

        // ==================================================
        // ATTACHMENTS
        // ==================================================

        files.forEach(
          (file) => {
            formData.append(
              "attachments",
              file
            );
          }
        );

        // ==================================================
        // CREATE TICKET
        // ==================================================

        const data =
          await apiPostFormData(
            "/tickets",
            formData
          );

        console.log(
          "Create Ticket Response:",
          data
        );

        alert(
          files.length > 0
            ? `Ticket Created Successfully! 🎫\n${files.length} attachment(s) uploaded.`
            : "Ticket Created Successfully! 🎫"
        );

        // ==================================================
        // RESET
        // ==================================================

        setTitle("");
        setDescription("");
        setCategory(
          "Technical"
        );
        setPriority(
          "Medium"
        );
        setFiles([]);
        setAiAnalysis(null);
        setAiError("");
        setLocation(null);
        setLocationError("");

        navigate(
          "/my-tickets"
        );

      } catch (error) {
        console.error(
          "Create Ticket Error:",
          error
        );

        alert(
          error.message ||
            "Ticket creation failed"
        );

      } finally {
        setLoading(false);
      }
    };

  // ==================================================
  // UI
  // ==================================================

  return (
    <div className="create-ticket-page">

      {/* ==================================================
          PAGE HEADER
      ================================================== */}

      <div className="create-ticket-header">

        <div>

          <div className="create-ticket-eyebrow">
            ✦ SUPPORT
          </div>

          <h1>
            Create New{" "}
            <span>
              Support Ticket
            </span>{" "}
            🎫
          </h1>

          <p>
            Tell us what's wrong and
            we'll help you get it
            resolved as quickly as
            possible.
          </p>

        </div>

        <div className="support-header-note">

          <span>
            ⚡
          </span>

          Better Support

          <strong>
            Brighter Tomorrow
          </strong>

        </div>

      </div>


      {/* ==================================================
          MAIN LAYOUT
      ================================================== */}

      <div className="create-ticket-layout">

        {/* ==================================================
            LEFT FORM
        ================================================== */}

        <form
          className="create-ticket-form"
          onSubmit={
            handleSubmit
          }
        >

          {/* FORM HEADER */}

          <div className="form-section-header">

            <div className="form-section-icon">
              ✎
            </div>

            <div>

              <h2>
                Ticket Details
              </h2>

              <p>
                Provide the necessary
                information about your
                issue.
              </p>

            </div>

            <div className="form-progress">

              <span>
                Step 1 of 2
              </span>

              <div>
                <i></i>
              </div>

            </div>

          </div>


          {/* ==================================================
              TITLE
          ================================================== */}

          <div className="form-field">

            <label>
              Ticket Title{" "}
              <span>*</span>
            </label>

            <input
              className="ticket-input"
              type="text"
              placeholder="Enter a clear and descriptive title"
              value={title}
              onChange={(e) => {
                setTitle(
                  e.target.value
                );

                setAiAnalysis(
                  null
                );

                setAiError("");
              }}
              required
            />

            <small>
              Keep it short and
              descriptive
            </small>

          </div>


          {/* ==================================================
              DESCRIPTION
          ================================================== */}

          <div className="form-field">

            <label>
              Description{" "}
              <span>*</span>
            </label>

            <textarea
              className="ticket-textarea"
              placeholder="Describe your issue in detail..."
              value={description}
              onChange={(e) => {
                setDescription(
                  e.target.value
                );

                setAiAnalysis(
                  null
                );

                setAiError("");
              }}
              required
            />

            <small>
              Include error messages,
              steps to reproduce, or any
              other relevant information
            </small>

          </div>


          {/* ==================================================
              AI TICKET INTELLIGENCE
          ================================================== */}

          <div className="ai-ticket-section">

            <div className="ai-section-main">

              <div className="ai-icon">
                🤖
              </div>

              <div>

                <h3>
                  AI Ticket Intelligence
                </h3>

                <p>
                  Analyze your issue to
                  get AI-powered category,
                  priority, sentiment and
                  summary.
                </p>

              </div>

            </div>

            <button
              type="button"
              className="ai-analyze-button"
              onClick={
                handleAiAnalyze
              }
              disabled={
                aiLoading ||
                loading
              }
            >
              {aiLoading
                ? "🤖 Analyzing..."
                : "✨ Analyze with AI"}
            </button>

          </div>


          {/* ==================================================
              AI ERROR
          ================================================== */}

          {aiError && (
            <div className="ai-error">
              ❌ {aiError}
            </div>
          )}


          {/* ==================================================
              AI RESULT
          ================================================== */}

          {aiAnalysis && (
            <div className="ai-analysis-result">

              <div className="ai-result-header">

                <div>

                  <span>
                    🤖
                  </span>

                  <strong>
                    AI Analysis Result
                  </strong>

                </div>

                <span className="ai-ready-badge">
                  READY
                </span>

              </div>


              <div className="ai-result-grid">

                <div className="ai-result-item">

                  <small>
                    Category
                  </small>

                  <strong>
                    {
                      aiAnalysis.category
                    }
                  </strong>

                </div>


                <div className="ai-result-item">

                  <small>
                    Priority
                  </small>

                  <strong>
                    {
                      aiAnalysis.priority
                    }
                  </strong>

                </div>


                <div className="ai-result-item">

                  <small>
                    Sentiment
                  </small>

                  <strong>
                    {
                      aiAnalysis.sentiment
                    }
                  </strong>

                </div>

              </div>


              <div className="ai-summary">

                <small>
                  AI Summary
                </small>

                <p>
                  {
                    aiAnalysis.summary
                  }
                </p>

              </div>


              <button
                type="button"
                className="ai-apply-button"
                onClick={
                  handleApplyAiSuggestions
                }
                disabled={
                  loading
                }
              >
                ✓ Apply AI Suggestions
              </button>

            </div>
          )}


          {/* ==================================================
              CATEGORY + PRIORITY
          ================================================== */}

          <div className="form-two-column">

            {/* CATEGORY */}

            <div className="form-field">

              <label>
                Category{" "}
                <span>*</span>
              </label>

              <select
                className="ticket-select"
                value={
                  category
                }
                onChange={(e) =>
                  setCategory(
                    e.target.value
                  )
                }
              >

                <option value="Technical">
                  Technical
                </option>

                <option value="Account">
                  Account
                </option>

                <option value="Billing">
                  Billing
                </option>

                <option value="General">
                  General
                </option>

              </select>

              <small>
                Select the most
                relevant category
              </small>

            </div>


            {/* PRIORITY */}

            <div className="form-field">

              <label>
                Priority{" "}
                <span>*</span>
              </label>

              <select
                className="ticket-select"
                value={
                  priority
                }
                onChange={(e) =>
                  setPriority(
                    e.target.value
                  )
                }
              >

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

              <small>
                Set the priority level
                for your issue
              </small>

            </div>

          </div>


          {/* ==================================================
              CUSTOMER LOCATION
          ================================================== */}

          <div className="customer-location-section">
            <div className="location-heading">
              <div>
                <label>
                  📍 Customer Location
                </label>

                <small>
                  Optional: Share your current location to help support identify your location.
                </small>
              </div>

              {location && (
                <span className="location-added-badge">
                  ✓ Location Added
                </span>
              )}
            </div>

            {!location ? (
              <button
                type="button"
                className="use-location-button"
                onClick={handleGetLocation}
                disabled={
                  loading ||
                  locationLoading
                }
              >
                {locationLoading
                  ? "📍 Getting Location..."
                  : "📍 Use My Location"}
              </button>
            ) : (
              <div className="location-success-box">
                <div className="location-success-icon">
                  📍
                </div>

                <div className="location-success-details">
                  <strong>
                    Current location captured
                  </strong>

                  <small>
                    Accuracy:{" "}
                    {location.accuracy
                      ? `${Math.round(location.accuracy)} meters`
                      : "Unavailable"}
                  </small>

                  <small>
                    Coordinates:{" "}
                    {location.latitude.toFixed(6)},{" "}
                    {location.longitude.toFixed(6)}
                  </small>
                </div>

                <button
                  type="button"
                  className="remove-location-button"
                  onClick={removeLocation}
                  disabled={loading}
                  title="Remove location"
                >
                  ×
                </button>
              </div>
            )}

            {locationError && (
              <div className="location-error">
                ❌ {locationError}
              </div>
            )}
          </div>


          {/* ==================================================
              ATTACHMENTS
          ================================================== */}

          <div className="attachment-upload-section">

            <div className="attachment-heading">

              <div>

                <label
                  htmlFor="ticket-attachments"
                  className={
                    files.length >=
                    MAX_FILES
                      ? "attachment-label disabled"
                      : "attachment-label"
                  }
                >
                  📎 Choose Files
                </label>

                <input
                  id="ticket-attachments"
                  type="file"
                  multiple
                  disabled={
                    loading ||
                    files.length >=
                      MAX_FILES
                  }
                  onChange={
                    handleFileChange
                  }
                  accept=".jpg,.jpeg,.png,.gif,.webp,.pdf,.txt,.doc,.docx,.xls,.xlsx,.zip"
                />

                <small>
                  Maximum 5 files,
                  10 MB each
                </small>

              </div>

              <span className="attachment-count">
                {files.length}/
                {MAX_FILES}
              </span>

            </div>


            {/* SELECTED FILES */}

            {files.length > 0 && (
              <div className="selected-files">

                <div className="selected-files-title">
                  Selected Files
                </div>

                {files.map(
                  (
                    file,
                    index
                  ) => (
                    <div
                      className="selected-file"
                      key={`${file.name}-${index}`}
                    >

                      <div className="file-icon">
                        📄
                      </div>

                      <div className="file-details">

                        <strong>
                          {
                            file.name
                          }
                        </strong>

                        <span>
                          {formatFileSize(
                            file.size
                          )}
                        </span>

                      </div>

                      <button
                        type="button"
                        className="remove-file-button"
                        onClick={() =>
                          removeFile(
                            index
                          )
                        }
                        disabled={
                          loading
                        }
                        title="Remove file"
                      >
                        ×
                      </button>

                    </div>
                  )
                )}

              </div>
            )}

          </div>


          {/* ==================================================
              ACTIONS
          ================================================== */}

          <div className="create-ticket-actions">

            <button
              type="button"
              className="cancel-ticket-button"
              onClick={() =>
                navigate(
                  "/my-tickets"
                )
              }
              disabled={
                loading
              }
            >
              × &nbsp; Cancel
            </button>


            <button
              className="create-ticket-button"
              type="submit"
              disabled={
                loading
              }
            >
              {loading
                ? files.length > 0
                  ? "Uploading & Creating..."
                  : "Creating Ticket..."
                : "➤  Create Ticket"}
            </button>

          </div>

        </form>


        {/* ==================================================
            RIGHT SIDEBAR
        ================================================== */}

        <aside className="create-ticket-sidebar">

          {/* ==================================================
              QUICK TIPS
          ================================================== */}

          <div className="help-card tips-card">

            <div className="help-card-header">

              <div className="help-icon yellow">
                💡
              </div>

              <div>

                <h3>
                  Quick Tips
                </h3>

                <p>
                  Get faster resolution
                </p>

              </div>

            </div>


            <div className="tips-list">

              <div>
                ✓
                <span>
                  Use a clear and
                  descriptive title
                </span>
              </div>

              <div>
                ✓
                <span>
                  Provide detailed
                  information
                </span>
              </div>

              <div>
                ✓
                <span>
                  Include error messages
                  if any
                </span>
              </div>

              <div>
                ✓
                <span>
                  Select the correct
                  category
                </span>
              </div>

              <div>
                ✓
                <span>
                  Set an appropriate
                  priority
                </span>
              </div>

            </div>

          </div>


          {/* ==================================================
              IMMEDIATE HELP
          ================================================== */}

          <div className="help-card">

            <div className="help-card-header">

              <div className="help-icon green">
                🎧
              </div>

              <div>

                <h3>
                  Need Immediate Help?
                </h3>

                <p>
                  Try these options
                </p>

              </div>

            </div>


            <div className="help-options">

              <div className="help-option">

                <span>
                  💬
                </span>

                <div>

                  <strong>
                    Live Chat
                  </strong>

                  <small>
                    Chat with support
                  </small>

                </div>

              </div>


              <div className="help-option">

                <span>
                  📞
                </span>

                <div>

                  <strong>
                    Voice Support
                  </strong>

                  <small>
                    Talk to our team
                  </small>

                </div>

              </div>

            </div>

          </div>


          {/* ==================================================
              COMMON ISSUES
          ================================================== */}

          <div className="help-card common-issues-card">

            <div className="help-card-header">

              <div className="help-icon purple">
                📖
              </div>

              <div>

                <h3>
                  Common Issues
                </h3>

                <p>
                  Check if your issue
                  is already covered
                </p>

              </div>

              <span className="help-arrow">
                →
              </span>

            </div>


            <div className="common-issues-list">

              <div>
                ▣ &nbsp;
                How to reset your
                password
              </div>

              <div>
                ▣ &nbsp;
                Email configuration
                guide
              </div>

              <div>
                ▣ &nbsp;
                Network connection
                issues
              </div>

              <div>
                ▣ &nbsp;
                Software installation
                help
              </div>

            </div>

          </div>

        </aside>

      </div>

    </div>
  );
}

export default CreateTicket;