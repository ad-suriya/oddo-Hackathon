import { Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";
import { ToastProvider } from "./context/ToastContext.jsx";
import AppShell from "./components/layout/AppShell.jsx";
import ProtectedRoute from "./components/layout/ProtectedRoute.jsx";
import AdminRoute from "./components/layout/AdminRoute.jsx";

import LoginPage from "./pages/auth/LoginPage.jsx";
import SignupPage from "./pages/auth/SignupPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import AttendancePage from "./pages/attendance/AttendancePage.jsx";
import AdminAttendancePage from "./pages/attendance/AdminAttendancePage.jsx";
import LeavePage from "./pages/leave/LeavePage.jsx";
import AdminLeavePage from "./pages/leave/AdminLeavePage.jsx";
import PayrollPage from "./pages/payroll/PayrollPage.jsx";
import AdminPayrollPage from "./pages/payroll/AdminPayrollPage.jsx";
import DocumentsPage from "./pages/DocumentsPage.jsx";
import EmployeesPage from "./pages/employees/EmployeesPage.jsx";
import EmployeeDetailPage from "./pages/employees/EmployeeDetailPage.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Routes>
          <Route path="/login" element={<LoginPage portalKey="employee" />} />
          <Route path="/admin/login" element={<LoginPage portalKey="staff" />} />
          <Route path="/hr/login" element={<Navigate to="/admin/login" replace />} />
          <Route path="/signup" element={<SignupPage />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<AppShell />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/attendance" element={<AttendancePage />} />
              <Route path="/leave" element={<LeavePage />} />
              <Route path="/payroll" element={<PayrollPage />} />
              <Route path="/documents" element={<DocumentsPage />} />

              <Route element={<AdminRoute />}>
                <Route path="/employees" element={<EmployeesPage />} />
                <Route path="/employees/:id" element={<EmployeeDetailPage />} />
                <Route path="/admin/attendance" element={<AdminAttendancePage />} />
                <Route path="/admin/leave" element={<AdminLeavePage />} />
                <Route path="/admin/payroll" element={<AdminPayrollPage />} />
              </Route>
            </Route>
          </Route>

          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </ToastProvider>
    </AuthProvider>
  );
}
