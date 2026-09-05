import { Navigate, Outlet } from "react-router-dom";

function ProtectedRoute() {
  const userData =
    localStorage.getItem("user");

  // ======================================================
  // USER NOT LOGGED IN
  // ======================================================

  if (!userData) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  // ======================================================
  // CHECK USER DATA
  // ======================================================

  try {
    JSON.parse(userData);
  } catch (error) {
    localStorage.removeItem("user");

    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  // ======================================================
  // USER IS LOGGED IN
  // ======================================================

  return <Outlet />;
}

export default ProtectedRoute;