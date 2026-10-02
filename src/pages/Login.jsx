import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // ==================================================
  // EMAIL + PASSWORD LOGIN
  // ==================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      alert("Please enter email and password.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        "http://localhost:5000/api/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim(),
            password,
          }),
        }
      );

      const data = await response.json();

      console.log("Login Response:", data);

      if (!response.ok) {
        throw new Error(
          data.message || "Invalid email or password"
        );
      }

      // Save JWT token
      if (data.token) {
        localStorage.setItem("token", data.token);
      }

      // Save user information
      if (data.user) {
        localStorage.setItem(
          "user",
          JSON.stringify(data.user)
        );
      }

      console.log("JWT Token saved successfully");

      // Go to dashboard
      navigate("/dashboard");

    } catch (error) {
      console.error("Login Error:", error);

      alert(error.message || "Login failed");

    } finally {
      setLoading(false);
    }
  };

  // ==================================================
  // UI
  // ==================================================

  return (
    <div className="login-page">

      {/* ==================================================
          LEFT BRANDING SECTION
      ================================================== */}

      <div className="login-brand-section">

        <div className="login-brand-content">

          {/* LOGO */}
          <div className="login-logo">

            <div className="login-logo-icon">
              SF
            </div>

            <span>
              SupportFlow
            </span>

          </div>

          {/* BRAND TEXT */}
          <div className="login-brand-text">

            <span className="login-eyebrow">
              CUSTOMER SUPPORT PLATFORM
            </span>

            <h1>
              Support customers.
              <br />

              <span>
                Build better experiences.
              </span>
            </h1>

            <p>
              Manage support tickets, communicate
              with customers in real-time and empower
              your support team with intelligent AI tools.
            </p>

          </div>

          {/* FEATURES */}
          <div className="login-features">

            <div className="login-feature">

              <div className="feature-icon">
                ✓
              </div>

              <div>

                <strong>
                  Smart Ticket Management
                </strong>

                <span>
                  Organize, assign and resolve
                  tickets efficiently.
                </span>

              </div>

            </div>

            <div className="login-feature">

              <div className="feature-icon">
                ✓
              </div>

              <div>

                <strong>
                  Real-Time Communication
                </strong>

                <span>
                  Chat and voice communication
                  with customers.
                </span>

              </div>

            </div>

            <div className="login-feature">

              <div className="feature-icon">
                ✓
              </div>

              <div>

                <strong>
                  AI-Powered Support
                </strong>

                <span>
                  Analyze tickets and generate
                  intelligent replies.
                </span>

              </div>

            </div>

          </div>

        </div>

        <div className="login-brand-footer">
          © 2026 SupportFlow. All rights reserved.
        </div>

      </div>


      {/* ==================================================
          RIGHT LOGIN SECTION
      ================================================== */}

      <div className="login-form-section">

        <div className="login-form-wrapper">

          {/* MOBILE LOGO */}
          <div className="mobile-login-logo">

            <div className="login-logo-icon">
              SF
            </div>

            <span>
              SupportFlow
            </span>

          </div>


          {/* HEADING */}
          <div className="login-heading">

            <span className="login-small-title">
              WELCOME BACK
            </span>

            <h2>
              Sign in to your account
            </h2>

            <p>
              Sign in using your email and password.
            </p>

          </div>


          {/* ==================================================
              EMAIL + PASSWORD LOGIN
          ================================================== */}

          <form
            className="login-form"
            onSubmit={handleSubmit}
          >

            {/* EMAIL */}
            <div className="login-field">

              <label htmlFor="email">
                Email address
              </label>

              <div className="login-input-wrapper">

                <span className="login-input-icon">
                  @
                </span>

                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  autoComplete="email"
                />

              </div>

            </div>


            {/* PASSWORD */}
            <div className="login-field">

              <div className="password-label-row">

                <label htmlFor="password">
                  Password
                </label>

                <button
                  type="button"
                  className="forgot-password"
                  onClick={() =>
                    alert(
                      "Please contact your administrator to reset your password."
                    )
                  }
                >
                  Forgot password?
                </button>

              </div>

              <div className="login-input-wrapper">

                <span className="login-input-icon">
                  🔒
                </span>

                <input
                  id="password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  autoComplete="current-password"
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowPassword(
                      (previous) => !previous
                    )
                  }
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showPassword
                    ? "🙈"
                    : "👁️"}
                </button>

              </div>

            </div>


            {/* REMEMBER */}
            <label className="remember-me">

              <input
                type="checkbox"
              />

              <span>
                Keep me signed in
              </span>

            </label>


            {/* LOGIN BUTTON */}
            <button
              type="submit"
              className="login-submit-button"
              disabled={loading}
            >

              {loading ? (
                <>
                  <span className="login-spinner"></span>

                  Signing in...
                </>
              ) : (
                <>
                  Sign in

                  <span className="login-arrow">
                    →
                  </span>
                </>
              )}

            </button>

          </form>


          {/* REGISTER */}
          <div className="login-register">

            <span>
              Don't have an account?
            </span>

            <button
              type="button"
              onClick={() =>
                navigate("/register")
              }
            >
              Create an account
            </button>

          </div>


          {/* SECURITY */}
          <div className="login-security">

            <span>
              🔐
            </span>

            <span>
              Your connection is secure and protected.
            </span>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Login;