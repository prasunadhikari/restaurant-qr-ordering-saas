import { Navigate, Outlet } from "react-router-dom";

function ProtectedOwnerRoute() {
  if (localStorage.getItem("staffToken")) {
    return <Navigate to="/staff" replace />;
  }
  const token = localStorage.getItem("ownerToken");
  const user = localStorage.getItem("ownerUser");
  let hasUnexpectedRole = false;
  if (user) {
    try {
      hasUnexpectedRole = JSON.parse(user).role !== "restaurant_owner";
    } catch {
      localStorage.removeItem("ownerUser");
    }
  }

  if (hasUnexpectedRole) return <Navigate to="/staff/login" replace />;
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

export default ProtectedOwnerRoute;