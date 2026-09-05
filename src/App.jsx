import { Routes, Route } from "react-router-dom";

import "./App.css";

import Navbar from "./components/Navbar";

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

function App() {
  return (
    <>
      <Navbar />

      <Routes>

        {/* ==================================================
            PUBLIC
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
            LOGGED-IN USER
        ================================================== */}

        <Route
          element={<ProtectedRoute />}
        >

          <Route
            path="/create-ticket"
            element={
              <CreateTicket />
            }
          />

          <Route
            path="/my-tickets"
            element={
              <MyTickets />
            }
          />

          <Route
            path="/ticket/:id"
            element={
              <TicketDetails />
            }
          />

        </Route>

        {/* ==================================================
            ADMIN
        ================================================== */}

        <Route
          element={<AdminRoute />}
        >

          <Route
            path="/dashboard"
            element={
              <Dashboard />
            }
          />

          <Route
            path="/analytics"
            element={
              <Analytics />
            }
          />

        </Route>

      </Routes>
    </>
  );
}

export default App;