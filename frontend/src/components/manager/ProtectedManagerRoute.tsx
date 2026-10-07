import { Navigate, Outlet } from "react-router-dom";

function ProtectedManagerRoute() {
  return localStorage.getItem("managerToken")
    ? <Outlet />
    : <Navigate to="/manager/login" replace />;
}

export default ProtectedManagerRoute;
