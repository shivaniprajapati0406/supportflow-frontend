import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiPostFormData } from "../api/api";

function CreateTicket() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Technical");
  const [priority, setPriority] = useState("Medium");

  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  // ==================================================
  // FILE CONFIGURATION
  // ==================================================

  const MAX_FILES = 5;
  const MAX_FILE_SIZE = 10 * 1024 * 1024;

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
    const selectedFiles = Array.from(
      e.target.files || []
    );

    if (selectedFiles.length === 0) {
      return;
    }

    // --------------------------------------------------
    // MAX FILE COUNT
    // --------------------------------------------------

    if (
      files.length + selectedFiles.length >
      MAX_FILES
    ) {
      alert(
        `You can upload maximum ${MAX_FILES} files.`
      );

      e.target.value = "";
      return;
    }

    // --------------------------------------------------
    // VALIDATE FILES
    // --------------------------------------------------

    const validFiles = [];

    for (const file of selectedFiles) {
      const extension =
        "." +
        file.name
          .split(".")
          .pop()
          .toLowerCase();

      // File size
      if (file.size > MAX_FILE_SIZE) {
        alert(
          `"${file.name}" is larger than 10 MB.`
        );

        continue;
      }

      // File extension
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

    setFiles((previousFiles) => [
      ...previousFiles,
      ...validFiles,
    ]);

    // Reset input so same file can be selected again
    e.target.value = "";
  };

  // ==================================================
  // REMOVE FILE
  // ==================================================

  const removeFile = (indexToRemove) => {
    setFiles((previousFiles) =>
      previousFiles.filter(
        (_, index) =>
          index !== indexToRemove
      )
    );
  };

  // ==================================================
  // FORMAT FILE SIZE
  // ==================================================

  const formatFileSize = (size) => {
    if (size < 1024) {
      return `${size} B`;
    }

    if (size < 1024 * 1024) {
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
  // SUBMIT TICKET
  // ==================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

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

      // ==================================================
      // BASIC VALIDATION
      // ==================================================

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

      // ==================================================
      // START LOADING
      // ==================================================

      setLoading(true);

      // ==================================================
      // CREATE FORMDATA
      // ==================================================

      const formData = new FormData();

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
      // ADD ATTACHMENTS
      // ==================================================

      files.forEach((file) => {
        formData.append(
          "attachments",
          file
        );
      });

      // ==================================================
      // SEND REQUEST
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

      // ==================================================
      // SUCCESS
      // ==================================================

      alert(
        files.length > 0
          ? `Ticket Created Successfully! 🎫\n${files.length} attachment(s) uploaded.`
          : "Ticket Created Successfully! 🎫"
      );

      // ==================================================
      // CLEAR FORM
      // ==================================================

      setTitle("");
      setDescription("");
      setCategory("Technical");
      setPriority("Medium");
      setFiles([]);

      // ==================================================
      // GO TO MY TICKETS
      // ==================================================

      navigate("/my-tickets");

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

  return (
    <div className="create-ticket-page">

      <h1>
        Create New Support Ticket 🎫
      </h1>

      <form onSubmit={handleSubmit}>

        {/* ==================================================
            TITLE
        ================================================== */}

        <input
          type="text"
          placeholder="Enter ticket title"
          value={title}
          onChange={(e) =>
            setTitle(e.target.value)
          }
          required
        />

        <br />
        <br />

        {/* ==================================================
            DESCRIPTION
        ================================================== */}

        <textarea
          placeholder="Describe your issue"
          value={description}
          onChange={(e) =>
            setDescription(
              e.target.value
            )
          }
          required
        />

        <br />
        <br />

        {/* ==================================================
            CATEGORY
        ================================================== */}

        <select
          value={category}
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

        <br />
        <br />

        {/* ==================================================
            PRIORITY
        ================================================== */}

        <select
          value={priority}
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

        <br />
        <br />

        {/* ==================================================
            ATTACHMENTS
        ================================================== */}

        <div
          className="attachment-upload-section"
          style={{
            marginTop: "20px",
            marginBottom: "20px",
          }}
        >
          <label
            htmlFor="ticket-attachments"
            style={{
              display: "inline-block",
              padding: "10px 16px",
              border: "1px solid #ccc",
              borderRadius: "8px",
              cursor:
                files.length >= MAX_FILES
                  ? "not-allowed"
                  : "pointer",
            }}
          >
            📎 Choose Files
          </label>

          <input
            id="ticket-attachments"
            type="file"
            multiple
            disabled={
              loading ||
              files.length >= MAX_FILES
            }
            onChange={handleFileChange}
            accept="
              .jpg,
              .jpeg,
              .png,
              .gif,
              .webp,
              .pdf,
              .txt,
              .doc,
              .docx,
              .xls,
              .xlsx,
              .zip
            "
            style={{
              display: "none",
            }}
          />

          <div
            style={{
              marginTop: "8px",
              fontSize: "14px",
              color: "#666",
            }}
          >
            Maximum 5 files, 10 MB each
          </div>

          {/* ==================================================
              SELECTED FILES
          ================================================== */}

          {files.length > 0 && (
            <div
              style={{
                marginTop: "15px",
              }}
            >
              <strong>
                Selected Files ({files.length}/
                {MAX_FILES})
              </strong>

              {files.map(
                (file, index) => (
                  <div
                    key={`${file.name}-${index}`}
                    style={{
                      display: "flex",
                      alignItems:
                        "center",
                      justifyContent:
                        "space-between",
                      gap: "10px",
                      padding:
                        "10px 12px",
                      marginTop:
                        "8px",
                      border:
                        "1px solid #ddd",
                      borderRadius:
                        "8px",
                    }}
                  >
                    <div
                      style={{
                        overflow:
                          "hidden",
                      }}
                    >
                      <div
                        style={{
                          fontWeight:
                            "600",
                          wordBreak:
                            "break-word",
                        }}
                      >
                        📄 {file.name}
                      </div>

                      <div
                        style={{
                          fontSize:
                            "13px",
                          color:
                            "#777",
                          marginTop:
                            "3px",
                        }}
                      >
                        {formatFileSize(
                          file.size
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        removeFile(
                          index
                        )
                      }
                      disabled={loading}
                      style={{
                        border:
                          "none",
                        background:
                          "transparent",
                        color:
                          "#d32f2f",
                        cursor:
                          "pointer",
                        fontSize:
                          "18px",
                      }}
                      title="Remove file"
                    >
                      ❌
                    </button>
                  </div>
                )
              )}
            </div>
          )}
        </div>

        {/* ==================================================
            BUTTON
        ================================================== */}

        <button
          type="submit"
          disabled={loading}
        >
          {loading
            ? files.length > 0
              ? "Uploading & Creating..."
              : "Creating Ticket..."
            : "Create Ticket"}
        </button>

      </form>

    </div>
  );
}

export default CreateTicket;