import { pool } from "./db.js";

const SELECT_COLUMNS = "id, email, password_hash, role, email_verified_at, created_at, updated_at";

export async function findUserByEmail(email) {
  const { rows } = await pool.query(`SELECT ${SELECT_COLUMNS} FROM users WHERE email = $1`, [email]);
  return rows[0] || null;
}

export async function findUserById(id) {
  const { rows } = await pool.query(`SELECT ${SELECT_COLUMNS} FROM users WHERE id = $1`, [id]);
  return rows[0] || null;
}

export async function createUser({ email, passwordHash, role = "employee" }) {
  const { rows } = await pool.query(
    `INSERT INTO users (email, password_hash, role, email_verified_at)
     VALUES ($1, $2, $3, now())
     RETURNING ${SELECT_COLUMNS}`,
    [email, passwordHash, role]
  );
  return rows[0];
}
