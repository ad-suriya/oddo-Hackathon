import { pool } from "./db.js";

const JOIN_SELECT = `
  SELECT e.id, e.user_id, e.employee_code, e.full_name, e.phone, e.address,
         e.job_title, e.department, e.date_joined, e.profile_picture_url,
         e.created_at, e.updated_at,
         u.email, u.role
  FROM employees e
  JOIN users u ON u.id = e.user_id
`;

export async function findEmployeeByUserId(userId) {
  const { rows } = await pool.query(`${JOIN_SELECT} WHERE e.user_id = $1`, [userId]);
  return rows[0] || null;
}

export async function findEmployeeById(id) {
  const { rows } = await pool.query(`${JOIN_SELECT} WHERE e.id = $1`, [id]);
  return rows[0] || null;
}

export async function findEmployeeByCode(employeeCode) {
  const { rows } = await pool.query(`SELECT id FROM employees WHERE employee_code = $1`, [employeeCode]);
  return rows[0] || null;
}

export async function createEmployee({ userId, employeeCode, fullName }) {
  const { rows } = await pool.query(
    `INSERT INTO employees (user_id, employee_code, full_name, date_joined)
     VALUES ($1, $2, $3, CURRENT_DATE)
     RETURNING id`,
    [userId, employeeCode, fullName]
  );
  return findEmployeeById(rows[0].id);
}

function buildEmployeeFilter({ search, department }) {
  const conditions = [];
  const params = [];
  if (department) {
    params.push(department);
    conditions.push(`e.department = $${params.length}`);
  }
  if (search) {
    params.push(`%${search.trim().toLowerCase()}%`);
    const p = `$${params.length}`;
    conditions.push(`(LOWER(e.full_name) LIKE ${p} OR LOWER(e.employee_code) LIKE ${p} OR LOWER(u.email) LIKE ${p})`);
  }
  return { where: conditions.length ? `WHERE ${conditions.join(" AND ")}` : "", params };
}

export async function listEmployees({ search, department, limit, offset } = {}) {
  const { where, params } = buildEmployeeFilter({ search, department });
  const paged = [...params, limit, offset];
  const { rows } = await pool.query(
    `${JOIN_SELECT} ${where} ORDER BY e.full_name LIMIT $${paged.length - 1} OFFSET $${paged.length}`,
    paged
  );
  return rows;
}

export async function countEmployees({ search, department } = {}) {
  const { where, params } = buildEmployeeFilter({ search, department });
  const { rows } = await pool.query(`SELECT count(*) FROM employees e JOIN users u ON u.id = e.user_id ${where}`, params);
  return Number(rows[0].count);
}

const UPDATABLE_COLUMNS = {
  fullName: "full_name",
  phone: "phone",
  address: "address",
  jobTitle: "job_title",
  department: "department",
  dateJoined: "date_joined",
  profilePictureUrl: "profile_picture_url",
};

export async function updateEmployee(id, patch) {
  const setClauses = [];
  const params = [];
  for (const [key, column] of Object.entries(UPDATABLE_COLUMNS)) {
    if (Object.prototype.hasOwnProperty.call(patch, key)) {
      params.push(patch[key]);
      setClauses.push(`${column} = $${params.length}`);
    }
  }
  if (setClauses.length === 0) return findEmployeeById(id);
  params.push(id);
  await pool.query(`UPDATE employees SET ${setClauses.join(", ")} WHERE id = $${params.length}`, params);
  return findEmployeeById(id);
}
