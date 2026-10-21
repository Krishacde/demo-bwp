
import { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({
  children,
  allowedRoles = []
}) => {
  const {
    user,
    loading,
    refreshUser
  } = useAuth();

  const location = useLocation();

  // A user may log in after the app's initial auth check.
  // Re-check the session if a token exists but user is not loaded.
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token && !user && !loading) {
      refreshUser();
    }
  }, [user, loading, refreshUser]);

  // Do not redirect while authentication is being checked.
  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="dashboard-spinner" />
        <p>Checking your session...</p>
      </div>
    );
  }

  // No authenticated user: send them to login.
  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    );
  }

  // A logged-in user cannot access another role's dashboard.
  if (
    allowedRoles.length > 0 &&
    !allowedRoles.includes(user.role)
  ) {
    const correctDashboard =
      user.role === "founder"
        ? "/founder/dashboard"
        : "/collaborator/dashboard";

    return (
      <Navigate
        to={correctDashboard}
        replace
      />
    );
  }

  return children;
};

export default ProtectedRoute;
