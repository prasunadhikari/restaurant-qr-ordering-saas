import { Navigate, Outlet } from "react-router-dom";

function ProtectedStaffRoute() {
  return localStorage.getItem("staffToken")
    ? <Outlet />
    : <Navigate to="/staff/login" replace />;
}

export default ProtectedStaffRoute;
