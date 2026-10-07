import { Navigate, Outlet } from "react-router-dom";

function ProtectedStaffRoute() {
  if (localStorage.getItem("staffToken")) return <Outlet />;
  if (localStorage.getItem("ownerToken")) {
    return <Navigate to="/dashboard" replace />;
  }
  if (localStorage.getItem("adminToken")) {
    return <Navigate to="/admin" replace />;
  }
  return <Navigate to="/staff/login" replace />;
}

export default ProtectedStaffRoute;
