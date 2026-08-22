import { pool } from "./db.js";

const JOIN_SELECT = `
  SELECT lr.id, lr.employee_id, lr.leave_type, lr.start_date, lr.end_date, lr.remarks,
         lr.status, lr.reviewed_by, lr.reviewer_comment, lr.reviewed_at,
         lr.created_at, lr.updated_at,
         req.id AS req_id, req.full_name AS req_full_name, req.employee_code AS req_employee_code,
         req.department AS req_department,
         rev.id AS rev_id, rev.full_name AS rev_full_name
  FROM leave_requests lr
  JOIN employees req ON req.id = lr.employee_id
  LEFT JOIN employees rev ON rev.id = lr.reviewed_by
`;

export async function createLeaveRequest({ employeeId, leaveType, startDate, endDate, remarks }) {
  const { rows } = await pool.query(
    `INSERT INTO leave_requests (employee_id, leave_type, start_date, end_date, remarks)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id`,
    [employeeId, leaveType, startDate, endDate, remarks]
  );
  return findLeaveRequestById(rows[0].id);
}

export async function findLeaveRequestById(id) {
  const { rows } = await pool.query(`${JOIN_SELECT} WHERE lr.id = $1`, [id]);
  return rows[0] || null;
}

export async function listForEmployee(employeeId) {
  const { rows } = await pool.query(
    `${JOIN_SELECT} WHERE lr.employee_id = $1 ORDER BY lr.created_at DESC`,
    [employeeId]
  );
  return rows;
}

export async function listAll({ status } = {}) {
  const params = [];
  let where = "";
  if (status) {
    params.push(status);
    where = `WHERE lr.status = $${params.length}`;
  }
  const { rows } = await pool.query(`${JOIN_SELECT} ${where} ORDER BY lr.created_at DESC`, params);
  return rows;
}

export async function reviewLeaveRequest(id, { status, reviewerId, reviewerComment }) {
  const { rows } = await pool.query(
    `UPDATE leave_requests
     SET status = $2, reviewed_by = $3, reviewer_comment = $4, reviewed_at = now()
     WHERE id = $1 AND status = 'pending'
     RETURNING id`,
    [id, status, reviewerId, reviewerComment]
  );
  if (!rows[0]) return null;
  return findLeaveRequestById(id);
}
