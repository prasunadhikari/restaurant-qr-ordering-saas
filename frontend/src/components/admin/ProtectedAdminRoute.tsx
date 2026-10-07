import { Navigate, Outlet } from "react-router-dom";

function ProtectedAdminRoute() {
  if (localStorage.getItem("staffToken")) {
    return <Navigate to="/staff" replace />;
  }
  const token = localStorage.getItem("adminToken");

  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }

  return <Outlet />;
}

export default ProtectedAdminRoute;