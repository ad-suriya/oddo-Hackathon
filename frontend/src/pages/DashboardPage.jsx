import { useAuth } from "../context/AuthContext.jsx";
import { isAdminRole } from "../utils/constants.js";
import EmployeeDashboard from "./dashboard/EmployeeDashboard.jsx";
import AdminDashboard from "./dashboard/AdminDashboard.jsx";

export default function DashboardPage() {
  const { user } = useAuth();
  return isAdminRole(user?.role) ? <AdminDashboard /> : <EmployeeDashboard />;
}
