import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Register.css";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // =========================================================
  // BACKEND URL
  // =========================================================

  const API_URL = "http://localhost:5000";

  // =========================================================
  // FORMAT PHONE NUMBER
  // =========================================================

  const getFormattedPhone = () => {
    let formattedPhone = phone.trim();

    formattedPhone = formattedPhone.replace(/\s+/g, "");

    if (!formattedPhone.startsWith("+")) {
      formattedPhone = `+91${formattedPhone}`;
    }

    return formattedPhone;
  };

  // =========================================================
  // REGISTER USER
  // =========================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    // -------------------------------------------------------
    // NAME VALIDATION
    // -------------------------------------------------------

    if (!name.trim()) {
      alert("Please enter your full name.");
      return;
    }

    // -------------------------------------------------------
    // EMAIL VALIDATION
    // -------------------------------------------------------

    if (!email.trim()) {
      alert("Please enter your email address.");
      return;
    }

    // -------------------------------------------------------
    // PHONE VALIDATION
    // -------------------------------------------------------

    const cleanPhone = phone
      .replace(/\s+/g, "")
      .replace(/^\+91/, "");

    if (!/^\d{10}$/.test(cleanPhone)) {
      alert(
        "Please enter a valid 10-digit Indian phone number."
      );
      return;
    }

    // -------------------------------------------------------
    // PASSWORD VALIDATION
    // -------------------------------------------------------

    if (password.length < 6) {
      alert(
        "Password must be at least 6 characters."
      );
      return;
    }

    // -------------------------------------------------------
    // CONFIRM PASSWORD
    // -------------------------------------------------------

    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const formattedPhone =
        getFormattedPhone();

      console.log(
        "================================="
      );

      console.log(
        "Registering SupportFlow user..."
      );

      console.log(
        "Name:",
        name.trim()
      );

      console.log(
        "Email:",
        email.trim()
      );

      console.log(
        "Phone:",
        formattedPhone
      );

      console.log(
        "================================="
      );

      // -------------------------------------------------------
      // REGISTER API
      // -------------------------------------------------------

      const response = await fetch(
        `${API_URL}/api/register`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            name: name.trim(),
            email: email.trim(),
            password,
            phone: formattedPhone,
          }),
        }
      );

      const data =
        await response.json();

      console.log(
        "Register Response:",
        data
      );

      // -------------------------------------------------------
      // ERROR
      // -------------------------------------------------------

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Registration failed"
        );
      }

      // -------------------------------------------------------
      // SUCCESS
      // -------------------------------------------------------

      alert(
        "Registration successful! Please login with your email and password."
      );

      // -------------------------------------------------------
      // GO TO LOGIN
      // -------------------------------------------------------

      navigate("/login");

    } catch (error) {

      console.error(
        "Registration Error:",
        error
      );

      alert(
        error.message ||
          "Unable to create your account."
      );

    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="register-page">

      {/* =====================================================
          LEFT BRANDING SECTION
      ===================================================== */}

      <div className="register-brand-section">

        <div className="register-brand-content">

          {/* LOGO */}

          <div className="register-logo">

            <div className="register-logo-icon">
              SF
            </div>

            <span>
              SupportFlow
            </span>

          </div>

          {/* BRAND TEXT */}

          <div className="register-brand-text">

            <span className="register-eyebrow">
              CUSTOMER SUPPORT PLATFORM
            </span>

            <h1>
              Start managing
              <br />

              <span>
                support smarter.
              </span>
            </h1>

            <p>
              Create your SupportFlow account and
              bring your customer support experience
              into one powerful platform.
            </p>

          </div>

          {/* FEATURES */}

          <div className="register-features">

            {/* FEATURE 1 */}

            <div className="register-feature">

              <div className="register-feature-icon">
                ✓
              </div>

              <div>

                <strong>
                  Manage Support Tickets
                </strong>

                <span>
                  Organize and resolve customer
                  issues efficiently.
                </span>

              </div>

            </div>

            {/* FEATURE 2 */}

            <div className="register-feature">

              <div className="register-feature-icon">
                ✓
              </div>

              <div>

                <strong>
                  Real-Time Communication
                </strong>

                <span>
                  Connect with customers through
                  chat and voice.
                </span>

              </div>

            </div>

            {/* FEATURE 3 */}

            <div className="register-feature">

              <div className="register-feature-icon">
                ✓
              </div>

              <div>

                <strong>
                  AI-Powered Support
                </strong>

                <span>
                  Work faster with intelligent AI
                  assistance.
                </span>

              </div>

            </div>

          </div>

        </div>

        {/* FOOTER */}

        <div className="register-brand-footer">
          © 2026 SupportFlow. All rights reserved.
        </div>

      </div>

      {/* =====================================================
          RIGHT REGISTER SECTION
      ===================================================== */}

      <div className="register-form-section">

        <div className="register-form-wrapper">

          {/* MOBILE LOGO */}

          <div className="mobile-register-logo">

            <div className="register-logo-icon">
              SF
            </div>

            <span>
              SupportFlow
            </span>

          </div>

          {/* =================================================
              HEADING
          ================================================= */}

          <div className="register-heading">

            <span className="register-small-title">
              GET STARTED
            </span>

            <h2>
              Create your account
            </h2>

            <p>
              Join SupportFlow and start managing
              customer support better.
            </p>

          </div>

          {/* =================================================
              REGISTRATION FORM
          ================================================= */}

          <form
            className="register-form"
            onSubmit={handleSubmit}
          >

            {/* NAME */}

            <div className="register-field">

              <label htmlFor="name">
                Full name
              </label>

              <div className="register-input-wrapper">

                <span className="register-input-icon">
                  👤
                </span>

                <input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) =>
                    setName(
                      e.target.value
                    )
                  }
                  autoComplete="name"
                  required
                />

              </div>

            </div>

            {/* EMAIL */}

            <div className="register-field">

              <label htmlFor="register-email">
                Email address
              </label>

              <div className="register-input-wrapper">

                <span className="register-input-icon">
                  @
                </span>

                <input
                  id="register-email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) =>
                    setEmail(
                      e.target.value
                    )
                  }
                  autoComplete="email"
                  required
                />

              </div>

            </div>

            {/* PHONE */}

            <div className="register-field">

              <label htmlFor="register-phone">
                Phone number
              </label>

              <div className="register-input-wrapper">

                <span className="register-input-icon">
                  📱
                </span>

                <input
                  id="register-phone"
                  type="tel"
                  placeholder="9876543210"
                  value={phone}
                  onChange={(e) =>
                    setPhone(
                      e.target.value
                        .replace(
                          /[^\d+]/g,
                          ""
                        )
                        .slice(0, 13)
                    )
                  }
                  autoComplete="tel"
                  required
                />

              </div>

              <span className="register-hint">
                Enter your 10-digit Indian mobile number.
              </span>

            </div>

            {/* PASSWORD */}

            <div className="register-field">

              <label htmlFor="register-password">
                Password
              </label>

              <div className="register-input-wrapper">

                <span className="register-input-icon">
                  🔒
                </span>

                <input
                  id="register-password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) =>
                    setPassword(
                      e.target.value
                    )
                  }
                  autoComplete="new-password"
                  required
                  minLength={6}
                />

                <button
                  type="button"
                  className="register-password-toggle"
                  onClick={() =>
                    setShowPassword(
                      (previous) =>
                        !previous
                    )
                  }
                >
                  {showPassword
                    ? "🙈"
                    : "👁️"}
                </button>

              </div>

              <span className="register-hint">
                Use at least 6 characters.
              </span>

            </div>

            {/* CONFIRM PASSWORD */}

            <div className="register-field">

              <label htmlFor="confirm-password">
                Confirm password
              </label>

              <div className="register-input-wrapper">

                <span className="register-input-icon">
                  🔐
                </span>

                <input
                  id="confirm-password"
                  type={
                    showConfirmPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) =>
                    setConfirmPassword(
                      e.target.value
                    )
                  }
                  autoComplete="new-password"
                  required
                />

                <button
                  type="button"
                  className="register-password-toggle"
                  onClick={() =>
                    setShowConfirmPassword(
                      (previous) =>
                        !previous
                    )
                  }
                >
                  {showConfirmPassword
                    ? "🙈"
                    : "👁️"}
                </button>

              </div>

            </div>

            {/* TERMS */}

            <label className="register-terms">

              <input
                type="checkbox"
                required
              />

              <span>
                I agree to the{" "}

                <button
                  type="button"
                  onClick={(e) =>
                    e.preventDefault()
                  }
                >
                  Terms & Conditions
                </button>

              </span>

            </label>

            {/* REGISTER BUTTON */}

            <button
              type="submit"
              className="register-submit-button"
              disabled={loading}
            >

              {loading ? (
                <>
                  <span className="register-spinner"></span>
                  Creating account...
                </>
              ) : (
                <>
                  Create account

                  <span className="register-arrow">
                    →
                  </span>
                </>
              )}

            </button>

          </form>

          {/* =================================================
              LOGIN LINK
          ================================================= */}

          <div className="register-login">

            <span>
              Already have an account?
            </span>

            <button
              type="button"
              onClick={() =>
                navigate("/login")
              }
            >
              Sign in
            </button>

          </div>

          {/* =================================================
              SECURITY
          ================================================= */}

          <div className="register-security">

            <span>
              🔐
            </span>

            <span>
              Your information is secure and
              protected.
            </span>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Register;