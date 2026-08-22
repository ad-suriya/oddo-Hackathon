import { pool } from "./db.js";

export async function listDocumentsForEmployee(employeeId) {
  const { rows } = await pool.query(
    `SELECT d.id, d.employee_id, d.file_name, d.file_type, d.file_size_bytes, d.created_at,
            uploader.full_name AS uploaded_by_name
     FROM employee_documents d
     LEFT JOIN users u ON u.id = d.uploaded_by
     LEFT JOIN employees uploader ON uploader.user_id = u.id
     WHERE d.employee_id = $1
     ORDER BY d.created_at DESC`,
    [employeeId]
  );
  return rows;
}
