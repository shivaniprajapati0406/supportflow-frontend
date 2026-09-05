const API_BASE_URL =
  "https://supportflow-backend-whmb.onrender.com/api";

// ======================================================
// GET JWT TOKEN
// ======================================================

const getToken = () => {
  return localStorage.getItem("token");
};

// ======================================================
// API REQUEST HELPER
// ======================================================

const apiRequest = async (endpoint, options = {}) => {
  const token = getToken();

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  // ====================================================
  // JWT HEADER
  // ====================================================

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // ====================================================
  // SEND REQUEST
  // ====================================================

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // ====================================================
  // READ RESPONSE
  // ====================================================

  let data;

  try {
    data = await response.json();
  } catch (error) {
    data = {};
  }

  console.log(
    `API ${options.method || "GET"} ${endpoint}:`,
    response.status,
    data
  );

  // ====================================================
  // UNAUTHORIZED
  // ====================================================

  if (response.status === 401) {
    console.error("Authentication failed");

    localStorage.removeItem("token");
    localStorage.removeItem("user");

    window.location.href = "/login";

    return;
  }

  // ====================================================
  // FORBIDDEN
  // ====================================================

  if (response.status === 403) {
    throw new Error(
      data.message ||
        "You are not authorized to perform this action"
    );
  }

  // ====================================================
  // OTHER API ERRORS
  // ====================================================

  if (!response.ok) {
    throw new Error(
      data.message || "API request failed"
    );
  }

  // ====================================================
  // SUCCESS
  // ====================================================

  return data;
};

// ======================================================
// GET
// ======================================================

export const apiGet = (endpoint) => {
  return apiRequest(endpoint, {
    method: "GET",
  });
};

// ======================================================
// POST - JSON
// ======================================================

export const apiPost = (endpoint, body) => {
  return apiRequest(endpoint, {
    method: "POST",
    body: JSON.stringify(body),
  });
};

// ======================================================
// POST - FORMDATA / FILE UPLOAD
// ======================================================

export const apiPostFormData = async (
  endpoint,
  formData
) => {
  const token = getToken();

  // IMPORTANT:
  // Do NOT set Content-Type manually here.
  // Browser automatically sets multipart/form-data
  // with the correct boundary.

  const headers = {};

  // ====================================================
  // JWT HEADER
  // ====================================================

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // ====================================================
  // SEND FORMDATA REQUEST
  // ====================================================

  const response = await fetch(
    `${API_BASE_URL}${endpoint}`,
    {
      method: "POST",
      headers,
      body: formData,
    }
  );

  // ====================================================
  // READ RESPONSE
  // ====================================================

  let data;

  try {
    data = await response.json();
  } catch (error) {
    data = {};
  }

  console.log(
    `API POST FormData ${endpoint}:`,
    response.status,
    data
  );

  // ====================================================
  // UNAUTHORIZED
  // ====================================================

  if (response.status === 401) {
    console.error("Authentication failed");

    localStorage.removeItem("token");
    localStorage.removeItem("user");

    window.location.href = "/login";

    return;
  }

  // ====================================================
  // FORBIDDEN
  // ====================================================

  if (response.status === 403) {
    throw new Error(
      data.message ||
        "You are not authorized to perform this action"
    );
  }

  // ====================================================
  // OTHER API ERRORS
  // ====================================================

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Upload request failed"
    );
  }

  // ====================================================
  // SUCCESS
  // ====================================================

  return data;
};

// ======================================================
// PUT
// ======================================================

export const apiPut = (endpoint, body) => {
  return apiRequest(endpoint, {
    method: "PUT",
    body: JSON.stringify(body),
  });
};

// ======================================================
// DELETE
// ======================================================

export const apiDelete = (endpoint) => {
  return apiRequest(endpoint, {
    method: "DELETE",
  });
};

// ======================================================
// DEFAULT EXPORT
// ======================================================

export default apiRequest;