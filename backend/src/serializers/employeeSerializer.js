import { toDateOnly } from "./dateHelpers.js";

export function serializeEmployee(row) {
  return {
    id: row.id,
    employeeCode: row.employee_code,
    fullName: row.full_name,
    email: row.email ?? null,
    role: row.role ?? "employee",
    phone: row.phone,
    address: row.address,
    jobTitle: row.job_title,
    department: row.department,
    dateJoined: toDateOnly(row.date_joined),
    profilePictureUrl: row.profile_picture_url,
  };
}

export function serializeEmployeeSummary(row) {
  return {
    id: row.id,
    fullName: row.full_name,
    employeeCode: row.employee_code,
    department: row.department,
  };
}
