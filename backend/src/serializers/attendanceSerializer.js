import { toDateOnly, toIsoString } from "./dateHelpers.js";

export function serializeAttendance(row) {
  return {
    id: String(row.id),
    employeeId: row.employee_id,
    attendanceDate: toDateOnly(row.attendance_date),
    checkInAt: toIsoString(row.check_in_at),
    checkOutAt: toIsoString(row.check_out_at),
    status: row.status,
  };
}

export function serializeAttendanceWithEmployee(row) {
  return {
    ...serializeAttendance(row),
    employee: row.emp_id
      ? {
          id: row.emp_id,
          fullName: row.emp_full_name,
          employeeCode: row.emp_employee_code,
          department: row.emp_department,
        }
      : null,
  };
}
