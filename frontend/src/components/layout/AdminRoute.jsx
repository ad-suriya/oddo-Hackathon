import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { isAdminRole } from "../../utils/constants.js";

export default function AdminRoute() {
  const { user } = useAuth();
  if (!isAdminRole(user?.role)) return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}
