import { Navigate, Outlet } from "react-router-dom";

function ProtectedOwnerRoute() {
  const token = localStorage.getItem("ownerToken");
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

export default ProtectedOwnerRoute;