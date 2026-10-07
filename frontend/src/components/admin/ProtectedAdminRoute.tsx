import { Navigate, Outlet } from "react-router-dom";

function ProtectedAdminRoute() {
  return localStorage.getItem("adminToken")
    ? <Outlet />
    : <Navigate to="/admin/login" replace />;
}

export default ProtectedAdminRoute;