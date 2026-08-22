export const ROLES = {
  EMPLOYEE: "employee",
  HR: "hr",
  ADMIN: "admin",
};

export function isAdminRole(role) {
  return role === ROLES.HR || role === ROLES.ADMIN;
}

export const LEAVE_TYPES = [
  { value: "paid", label: "Paid Leave" },
  { value: "sick", label: "Sick Leave" },
  { value: "unpaid", label: "Unpaid Leave" },
];

export const LEAVE_STATUS = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
};

export const ATTENDANCE_STATUS = {
  PRESENT: "present",
  ABSENT: "absent",
  HALF_DAY: "half_day",
  LEAVE: "leave",
};

export const ATTENDANCE_STATUS_LABELS = {
  present: "Present",
  absent: "Absent",
  half_day: "Half Day",
  leave: "On Leave",
};

export const LEAVE_STATUS_LABELS = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
};

export const PAYMENT_STATUS_LABELS = {
  paid: "Paid",
  processing: "Processing",
  pending: "Pending",
};

export const DEFAULT_CURRENCY = "INR";
