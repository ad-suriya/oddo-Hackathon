import { toIsoString } from "./dateHelpers.js";

export function serializeAuthUser(user, employee) {
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    emailVerifiedAt: toIsoString(user.email_verified_at),
    employee: employee
      ? {
          id: employee.id,
          employeeCode: employee.employee_code,
          fullName: employee.full_name,
          jobTitle: employee.job_title,
          department: employee.department,
          profilePictureUrl: employee.profile_picture_url,
        }
      : null,
  };
}
