import { Navigate, Outlet } from "react-router-dom";

function AdminRoute() {
  const userData =
    localStorage.getItem("user");

  // ======================================================
  // NOT LOGGED IN
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
  // CHECK USER
  // ======================================================

  try {
    const user =
      JSON.parse(userData);

    // ====================================================
    // ADMIN CHECK
    // ====================================================

    const isAdmin =
      user.role === "Admin" ||
      user.role === "admin" ||
      user.isAdmin === true;

    // ====================================================
    // CUSTOMER TRYING TO ACCESS ADMIN PAGE
    // ====================================================

    if (!isAdmin) {
      return (
        <Navigate
          to="/"
          replace
        />
      );
    }

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
  // ADMIN AUTHORIZED
  // ======================================================

  return <Outlet />;
}

export default AdminRoute;