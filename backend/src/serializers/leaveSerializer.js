import { toDateOnly, toIsoString } from "./dateHelpers.js";

export function serializeLeaveRequest(row) {
  return {
    id: String(row.id),
    employeeId: row.employee_id,
    leaveType: row.leave_type,
    startDate: toDateOnly(row.start_date),
    endDate: toDateOnly(row.end_date),
    remarks: row.remarks,
    status: row.status,
    reviewedBy: row.reviewed_by,
    reviewerComment: row.reviewer_comment,
    reviewedAt: toIsoString(row.reviewed_at),
    createdAt: toIsoString(row.created_at),
    employee: row.req_id
      ? {
          id: row.req_id,
          fullName: row.req_full_name,
          employeeCode: row.req_employee_code,
          department: row.req_department,
        }
      : null,
    reviewer: row.rev_id ? { id: row.rev_id, fullName: row.rev_full_name } : null,
  };
}
