import { Navigate, Outlet } from "react-router-dom";

function ProtectedAdminRoute() {
  const token = localStorage.getItem("adminToken");
  if (token) return <Outlet />;
  if (localStorage.getItem("ownerToken")) {
    return <Navigate to="/dashboard" replace />;
  }
  if (localStorage.getItem("staffToken")) {
    return <Navigate to="/staff" replace />;
  }
  return <Navigate to="/admin/login" replace />;
}

export default ProtectedAdminRoute;