export const NAV_ITEMS = [
  { label: "Dashboard", to: "/dashboard", icon: "dashboard" },
  { label: "Attendance", to: "/attendance", icon: "attendance" },
  { label: "Leave", to: "/leave", icon: "leave" },
  { label: "Payroll", to: "/payroll", icon: "payroll" },
  { label: "Documents", to: "/documents", icon: "documents" },
  { label: "Profile", to: "/profile", icon: "profile" },
];

export const ADMIN_NAV_ITEMS = [
  { label: "Employees", to: "/employees", icon: "employees" },
  { label: "Attendance Management", to: "/admin/attendance", icon: "attendance" },
  { label: "Leave Management", to: "/admin/leave", icon: "leave" },
  { label: "Payroll Management", to: "/admin/payroll", icon: "payroll" },
];

// Two sign-in portals: Employee, and a combined Admin/HR portal (those two
// roles share the same authorization level today — see docs/DECISIONS.md,
// "Admin and HR Officer Are Two Distinct Roles"). Signing in with the wrong
// role's credentials on the wrong portal is rejected client-side (see
// LoginPage) — the account still only ever has the one real
// (docs/DATABASE.md: users.role) role, this just keeps each audience on the
// page meant for them.
export const LOGIN_PORTALS = [
  { key: "employee", roles: ["employee"], label: "Employee", path: "/login" },
  { key: "staff", roles: ["hr", "admin"], label: "Admin / HR", path: "/admin/login" },
];

export function portalForRole(role) {
  return LOGIN_PORTALS.find((p) => p.roles.includes(role)) || LOGIN_PORTALS[0];
}
