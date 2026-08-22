import { pool } from "./db.js";

export async function createSession({ tokenHash, userId, expiresAt }) {
  await pool.query(
    `INSERT INTO sessions (token_hash, user_id, expires_at) VALUES ($1, $2, $3)`,
    [tokenHash, userId, expiresAt]
  );
}

export async function findValidSessionByTokenHash(tokenHash) {
  const { rows } = await pool.query(
    `SELECT token_hash, user_id, expires_at, created_at
     FROM sessions
     WHERE token_hash = $1 AND expires_at > now()`,
    [tokenHash]
  );
  return rows[0] || null;
}

export async function deleteSessionByTokenHash(tokenHash) {
  await pool.query(`DELETE FROM sessions WHERE token_hash = $1`, [tokenHash]);
}

// Backs the periodic sweep in server.js (idx_sessions_expires_at exists
// for exactly this query). findValidSessionByTokenHash already excludes
// expired rows from auth, so this is pure cleanup, not a correctness fix.
export async function deleteExpiredSessions() {
  const { rowCount } = await pool.query(`DELETE FROM sessions WHERE expires_at <= now()`);
  return rowCount;
}
