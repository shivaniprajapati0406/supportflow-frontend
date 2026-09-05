import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(
        "https://supportflow-backend-whmb.onrender.com/api/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      const data = await response.json();

      console.log("Login Response:", data);

      if (!response.ok) {
        throw new Error(
          data.message || "Login failed"
        );
      }

      // ==================================================
      // SAVE JWT TOKEN
      // ==================================================

      if (data.token) {
        localStorage.setItem(
          "token",
          data.token
        );
      }

      // ==================================================
      // SAVE USER INFORMATION
      // ==================================================

      if (data.user) {
        localStorage.setItem(
          "user",
          JSON.stringify(data.user)
        );
      }

      console.log(
        "JWT Token saved successfully"
      );

      alert(data.message);

      // ==================================================
      // REDIRECT
      // ==================================================

      navigate("/dashboard");

    } catch (error) {
      console.error(
        "Login Error:",
        error
      );

      alert(error.message);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">

        <h1>Welcome Back 👋</h1>

        <p>
          Login to your SupportFlow account
        </p>

        <form onSubmit={handleSubmit}>

          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            required
          />

          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            required
          />

          <button type="submit">
            Login
          </button>

        </form>

      </div>
    </div>
  );
}

export default Login;