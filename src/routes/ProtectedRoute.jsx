import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const isApprovedCompany = (user) => {
  if (user?.role !== "company") {
    return true;
  }

  const rawApproval =
    user?.approved ??
    user?.is_active ??
    user?.details?.approved ??
    user?.details?.is_active;

  return String(rawApproval) === "1" || rawApproval === true;
};

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (allowedRoles?.length && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/login" replace />;
  }

  if (!isApprovedCompany(user)) {
    return (
      <Navigate
        to="/login"
        state={{
          from: location.pathname,
          reason: "company-not-approved",
        }}
        replace
      />
    );
  }

  return children;
};

export default ProtectedRoute;
