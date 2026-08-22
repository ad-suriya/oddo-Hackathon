import { pool } from "./db.js";

const JOIN_SELECT = `
  SELECT s.id, s.employee_id, s.basic_pay, s.allowances, s.deductions, s.currency,
         s.updated_by, s.created_at, s.updated_at,
         e.id AS emp_id, e.full_name AS emp_full_name, e.employee_code AS emp_employee_code,
         e.department AS emp_department
  FROM employee_salary s
  JOIN employees e ON e.id = s.employee_id
`;

export async function findSalaryByEmployeeId(employeeId) {
  const { rows } = await pool.query(`${JOIN_SELECT} WHERE s.employee_id = $1`, [employeeId]);
  return rows[0] || null;
}

export async function listAllSalaries() {
  const { rows } = await pool.query(`${JOIN_SELECT} ORDER BY e.full_name`);
  return rows;
}

export async function upsertSalary(employeeId, { basicPay, allowances, deductions, currency = "INR", updatedBy }) {
  await pool.query(
    `INSERT INTO employee_salary (employee_id, basic_pay, allowances, deductions, currency, updated_by)
     VALUES ($1, $2, $3, $4, $5, $6)
     ON CONFLICT (employee_id)
     DO UPDATE SET basic_pay = EXCLUDED.basic_pay, allowances = EXCLUDED.allowances,
                   deductions = EXCLUDED.deductions, currency = EXCLUDED.currency,
                   updated_by = EXCLUDED.updated_by`,
    [employeeId, basicPay, allowances, deductions, currency, updatedBy]
  );
  return findSalaryByEmployeeId(employeeId);
}
