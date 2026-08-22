-- Reference queries for the backend's data-access layer.
-- Every query is parameterized with $1, $2, ... for use with node-postgres (pg).

-- === Auth ===

-- Look up a user by email for login.
-- SELECT id, email, password_hash, role, email_verified_at FROM users WHERE email = $1;

-- Mark email verified and clear the token after successful verification.
-- UPDATE users
-- SET email_verified_at = now(), email_verification_token_hash = NULL, email_verification_expires_at = NULL
-- WHERE id = $1 AND email_verification_token_hash = $2 AND email_verification_expires_at > now();

-- === Employee profile ===

-- Own profile (joins users for email/role).
-- SELECT e.*, u.email, u.role
-- FROM employees e JOIN users u ON u.id = e.user_id
-- WHERE e.user_id = $1;

-- Admin/HR: list all employees.
-- SELECT e.id, e.employee_code, e.full_name, e.job_title, e.department, u.email, u.role
-- FROM employees e JOIN users u ON u.id = e.user_id
-- ORDER BY e.full_name;

-- === Attendance ===

-- Check-in: create today's row if it doesn't exist, or fail if already checked in.
-- INSERT INTO attendance (employee_id, attendance_date, check_in_at, status)
-- VALUES ($1, CURRENT_DATE, now(), 'present')
-- ON CONFLICT (employee_id, attendance_date) DO NOTHING
-- RETURNING id;

-- Check-out: set check_out_at on today's row.
-- UPDATE attendance
-- SET check_out_at = now()
-- WHERE employee_id = $1 AND attendance_date = CURRENT_DATE AND check_out_at IS NULL
-- RETURNING id;

-- Own attendance, most recent first (weekly view = LIMIT 7 or WHERE attendance_date >= $2).
-- SELECT attendance_date, check_in_at, check_out_at, status
-- FROM attendance
-- WHERE employee_id = $1
-- ORDER BY attendance_date DESC
-- LIMIT 30;

-- Admin/HR: attendance for a given day, all employees.
-- SELECT e.full_name, e.employee_code, a.check_in_at, a.check_out_at, a.status
-- FROM attendance a JOIN employees e ON e.id = a.employee_id
-- WHERE a.attendance_date = $1
-- ORDER BY e.full_name;

-- === Leave requests ===

-- Create a leave request.
-- INSERT INTO leave_requests (employee_id, leave_type, start_date, end_date, remarks)
-- VALUES ($1, $2, $3, $4, $5)
-- RETURNING id, status;

-- Own leave requests.
-- SELECT id, leave_type, start_date, end_date, status, reviewer_comment, created_at
-- FROM leave_requests
-- WHERE employee_id = $1
-- ORDER BY created_at DESC;

-- Admin/HR: pending leave requests queue.
-- SELECT lr.id, e.full_name, lr.leave_type, lr.start_date, lr.end_date, lr.remarks, lr.created_at
-- FROM leave_requests lr JOIN employees e ON e.id = lr.employee_id
-- WHERE lr.status = 'pending'
-- ORDER BY lr.created_at ASC;

-- Approve/reject a leave request.
-- UPDATE leave_requests
-- SET status = $2, reviewed_by = $3, reviewer_comment = $4, reviewed_at = now()
-- WHERE id = $1 AND status = 'pending'
-- RETURNING id, status;

-- === Payroll ===

-- Own salary (read-only for employees).
-- SELECT basic_pay, allowances, deductions, currency,
--        (basic_pay + allowances - deductions) AS net_pay
-- FROM employee_salary
-- WHERE employee_id = $1;

-- Admin/HR: update salary structure (upsert since it's a 1:1 current snapshot).
-- INSERT INTO employee_salary (employee_id, basic_pay, allowances, deductions, currency, updated_by)
-- VALUES ($1, $2, $3, $4, $5, $6)
-- ON CONFLICT (employee_id)
-- DO UPDATE SET basic_pay = EXCLUDED.basic_pay, allowances = EXCLUDED.allowances,
--               deductions = EXCLUDED.deductions, currency = EXCLUDED.currency,
--               updated_by = EXCLUDED.updated_by;

-- === Documents ===

-- List an employee's documents.
-- SELECT id, file_name, file_type, file_size_bytes, created_at
-- FROM employee_documents
-- WHERE employee_id = $1
-- ORDER BY created_at DESC;

-- Record an uploaded document (file itself is written to disk by the backend first).
-- INSERT INTO employee_documents (employee_id, file_name, file_type, file_size_bytes, storage_path, uploaded_by)
-- VALUES ($1, $2, $3, $4, $5, $6)
-- RETURNING id;
