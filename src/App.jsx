import { Routes, Route } from "react-router-dom";

import "./App.css";

import Navbar from "./components/Navbar";
import AIChatbot from "./components/AIChatbot";
import AIVoiceAssistant from "./components/AIVoiceAssistant";

import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";

import Dashboard from "./pages/Dashboard";
import Analytics from "./pages/Analytics";

import CreateTicket from "./pages/CreateTicket";
import MyTickets from "./pages/MyTickets";
import TicketDetails from "./pages/TicketDetails";

// Support Agent Dashboard
import AgentDashboard from "./pages/AgentDashboard";

function App() {
  return (
    <>
      {/* ==================================================
          NAVBAR
      ================================================== */}
      <Navbar />

      <Routes>

        {/* ==================================================
            PUBLIC ROUTES
        ================================================== */}

        <Route
          path="/"
          element={<Home />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />


        {/* ==================================================
            LOGGED-IN USER ROUTES
        ================================================== */}

        <Route element={<ProtectedRoute />}>

          <Route
            path="/create-ticket"
            element={<CreateTicket />}
          />

          <Route
            path="/my-tickets"
            element={<MyTickets />}
          />

          <Route
            path="/ticket/:id"
            element={<TicketDetails />}
          />

        </Route>


        {/* ==================================================
            SUPPORT AGENT ROUTE
        ================================================== */}

        <Route element={<ProtectedRoute />}>

          <Route
            path="/agent-dashboard"
            element={<AgentDashboard />}
          />

        </Route>


        {/* ==================================================
            ADMIN ROUTES
        ================================================== */}

        <Route element={<AdminRoute />}>

          <Route
            path="/dashboard"
            element={<Dashboard />}
          />

          <Route
            path="/analytics"
            element={<Analytics />}
          />

        </Route>

      </Routes>


      {/* ==================================================
          AI SUPPORT FEATURES
      ================================================== */}

      {/* Existing AI Chatbot */}
      <AIChatbot />

      {/* New AI Voice Assistant */}
      <AIVoiceAssistant />

    </>
  );
}

export default App;