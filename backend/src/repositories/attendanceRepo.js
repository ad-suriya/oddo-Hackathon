import { pool } from "./db.js";

const BASE_COLUMNS =
  "id, employee_id, attendance_date, check_in_at, check_out_at, status, created_at, updated_at";

export async function findTodayRecord(employeeId) {
  const { rows } = await pool.query(
    `SELECT ${BASE_COLUMNS} FROM attendance WHERE employee_id = $1 AND attendance_date = CURRENT_DATE`,
    [employeeId]
  );
  return rows[0] || null;
}

export async function insertCheckIn(employeeId) {
  const { rows } = await pool.query(
    `INSERT INTO attendance (employee_id, attendance_date, check_in_at, status)
     VALUES ($1, CURRENT_DATE, now(), 'present')
     RETURNING ${BASE_COLUMNS}`,
    [employeeId]
  );
  return rows[0];
}

export async function setCheckOut(employeeId) {
  const { rows } = await pool.query(
    `UPDATE attendance
     SET check_out_at = now()
     WHERE employee_id = $1 AND attendance_date = CURRENT_DATE
     RETURNING ${BASE_COLUMNS}`,
    [employeeId]
  );
  return rows[0] || null;
}

export async function listForEmployee(employeeId, { from, to } = {}) {
  const conditions = ["employee_id = $1"];
  const params = [employeeId];
  if (from) {
    params.push(from);
    conditions.push(`attendance_date >= $${params.length}`);
  }
  if (to) {
    params.push(to);
    conditions.push(`attendance_date <= $${params.length}`);
  }
  const { rows } = await pool.query(
    `SELECT ${BASE_COLUMNS} FROM attendance WHERE ${conditions.join(" AND ")} ORDER BY attendance_date DESC`,
    params
  );
  return rows;
}

export async function listForDate(date) {
  const { rows } = await pool.query(
    `SELECT a.id, a.employee_id, a.attendance_date, a.check_in_at, a.check_out_at, a.status,
            a.created_at, a.updated_at,
            e.id AS emp_id, e.full_name AS emp_full_name, e.employee_code AS emp_employee_code,
            e.department AS emp_department
     FROM attendance a
     JOIN employees e ON e.id = a.employee_id
     WHERE a.attendance_date = $1
     ORDER BY e.full_name`,
    [date]
  );
  return rows;
}
