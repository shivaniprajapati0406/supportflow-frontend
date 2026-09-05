import { Link } from "react-router-dom";
import "./Home.css";

function Home() {
  const userData = localStorage.getItem("user");

  let user = null;

  try {
    user = userData
      ? JSON.parse(userData)
      : null;
  } catch {
    user = null;
  }

  return (
    <div className="home-page">

      {/* ==================================================
          HERO SECTION
      ================================================== */}

      <section className="hero-section">

        <div className="hero-content">

          <div className="hero-badge">
            ✨ Smart Customer Support Platform
          </div>

          <h1>
            Resolve Issues.
            <span> Build Better Support.</span>
          </h1>

          <p>
            SupportFlow makes customer support simple,
            organized and efficient. Create tickets,
            communicate with support teams and track
            every issue from one place.
          </p>

          <div className="hero-buttons">

            {user ? (
              <>
                <Link
                  to="/create-ticket"
                  className="hero-primary-btn"
                >
                  🎫 Create a Ticket
                </Link>

                <Link
                  to="/my-tickets"
                  className="hero-secondary-btn"
                >
                  View My Tickets →
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/register"
                  className="hero-primary-btn"
                >
                  Get Started →
                </Link>

                <Link
                  to="/login"
                  className="hero-secondary-btn"
                >
                  Login to SupportFlow
                </Link>
              </>
            )}

          </div>

        </div>

        {/* ==================================================
            HERO VISUAL
        ================================================== */}

        <div className="hero-visual">

          <div className="support-card">

            <div className="support-card-header">

              <div className="support-icon">
                💬
              </div>

              <div>
                <strong>
                  Support Center
                </strong>

                <span>
                  Always here to help
                </span>
              </div>

            </div>

            <div className="support-status">

              <div className="status-dot"></div>

              <span>
                Support team online
              </span>

              <strong>
                ●
              </strong>

            </div>

            <div className="support-ticket">

              <div>
                <span>
                  Ticket #SF-1024
                </span>

                <strong>
                  Internet Connection Issue
                </strong>
              </div>

              <span className="ticket-status">
                In Progress
              </span>

            </div>

            <div className="support-message">

              <div className="message-avatar">
                👨‍💼
              </div>

              <div>
                <strong>
                  Support Team
                </strong>

                <p>
                  We're checking your issue
                  and will assist you shortly.
                </p>
              </div>

            </div>

          </div>

        </div>

      </section>

      {/* ==================================================
          FEATURES
      ================================================== */}

      <section className="features-section">

        <div className="section-heading">

          <span>
            POWERFUL SUPPORT TOOLS
          </span>

          <h2>
            Everything you need to manage support
          </h2>

          <p>
            Keep customer conversations,
            tickets and updates organized
            in one simple platform.
          </p>

        </div>

        <div className="features-grid">

          {/* FEATURE 1 */}

          <div className="feature-card">

            <div className="feature-icon">
              🎫
            </div>

            <h3>
              Easy Ticket Management
            </h3>

            <p>
              Create and manage support tickets
              with categories, priorities and
              real-time status updates.
            </p>

          </div>

          {/* FEATURE 2 */}

          <div className="feature-card">

            <div className="feature-icon">
              💬
            </div>

            <h3>
              Real-Time Conversations
            </h3>

            <p>
              Communicate directly with the
              support team through organized
              ticket conversations.
            </p>

          </div>

          {/* FEATURE 3 */}

          <div className="feature-card">

            <div className="feature-icon">
              🔔
            </div>

            <h3>
              Smart Notifications
            </h3>

            <p>
              Stay updated when tickets receive
              replies, status changes or priority
              updates.
            </p>

          </div>

          {/* FEATURE 4 */}

          <div className="feature-card">

            <div className="feature-icon">
              📊
            </div>

            <h3>
              Admin Dashboard
            </h3>

            <p>
              Monitor tickets, manage priorities,
              update statuses and respond to
              customers efficiently.
            </p>

          </div>

        </div>

      </section>

      {/* ==================================================
          HOW IT WORKS
      ================================================== */}

      <section className="how-section">

        <div className="section-heading">

          <span>
            SIMPLE WORKFLOW
          </span>

          <h2>
            Get support in three simple steps
          </h2>

        </div>

        <div className="steps-grid">

          <div className="step-card">

            <div className="step-number">
              01
            </div>

            <h3>
              Create a Ticket
            </h3>

            <p>
              Tell us about your issue and
              submit a support ticket.
            </p>

          </div>

          <div className="step-card">

            <div className="step-number">
              02
            </div>

            <h3>
              Talk to Support
            </h3>

            <p>
              Communicate with the support
              team directly through your ticket.
            </p>

          </div>

          <div className="step-card">

            <div className="step-number">
              03
            </div>

            <h3>
              Track Resolution
            </h3>

            <p>
              Get notifications and track your
              ticket until the issue is resolved.
            </p>

          </div>

        </div>

      </section>

      {/* ==================================================
          CTA
      ================================================== */}

      <section className="cta-section">

        <div className="cta-content">

          <div className="cta-icon">
            🚀
          </div>

          <h2>
            Ready to get better support?
          </h2>

          <p>
            Start using SupportFlow today and
            keep every support request organized.
          </p>

          {!user && (
            <Link
              to="/register"
              className="cta-button"
            >
              Create Your Account →
            </Link>
          )}

        </div>

      </section>

      {/* ==================================================
          FOOTER
      ================================================== */}

      <footer className="home-footer">

        <div>
          © 2026 SupportFlow. All rights reserved.
        </div>

        <div>
          Customer Support Platform
        </div>

      </footer>

    </div>
  );
}

export default Home;