-- Development-only seed data. Never run against production.
--
-- password_hash values below are PLACEHOLDERS, not real bcrypt/argon2
-- hashes — no hashing library is wired into the backend yet (see
-- backend/package.json). Regenerate these with the real hashing function
-- once auth is implemented; every seeded account currently has no valid
-- login password.

BEGIN;

INSERT INTO users (id, email, password_hash, role, email_verified_at) VALUES
    ('10000000-0000-0000-0000-000000000001', 'admin@dayflow.dev',    '$2b$PLACEHOLDER_HASH$admin',    'admin', now()),
    ('10000000-0000-0000-0000-000000000002', 'hr@dayflow.dev',       '$2b$PLACEHOLDER_HASH$hr',       'hr',    now()),
    ('10000000-0000-0000-0000-000000000003', 'alice@dayflow.dev',    '$2b$PLACEHOLDER_HASH$alice',    'employee', now()),
    ('10000000-0000-0000-0000-000000000004', 'bob@dayflow.dev',      '$2b$PLACEHOLDER_HASH$bob',      'employee', now()),
    ('10000000-0000-0000-0000-000000000005', 'carol@dayflow.dev',    '$2b$PLACEHOLDER_HASH$carol',    'employee', NULL);

INSERT INTO employees (id, user_id, employee_code, full_name, phone, address, job_title, department, date_joined) VALUES
    ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'EMP0001', 'Ada Admin',    '+91-9000000001', 'Bengaluru, India', 'Administrator', 'Operations', '2024-01-10'),
    ('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', 'EMP0002', 'Helen Ross',   '+91-9000000002', 'Bengaluru, India', 'HR Officer',    'Human Resources', '2024-02-15'),
    ('20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000003', 'EMP0003', 'Alice Kumar',  '+91-9000000003', 'Chennai, India',   'Software Engineer', 'Engineering', '2024-03-01'),
    ('20000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000004', 'EMP0004', 'Bob Nair',     '+91-9000000004', 'Chennai, India',   'Software Engineer', 'Engineering', '2024-04-20'),
    ('20000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000005', 'EMP0005', 'Carol D''Souza','+91-9000000005', 'Pune, India',      'QA Engineer',   'Engineering', '2024-06-05');

INSERT INTO employee_salary (employee_id, basic_pay, allowances, deductions, currency, updated_by) VALUES
    ('20000000-0000-0000-0000-000000000001', 90000, 10000, 5000, 'INR', '10000000-0000-0000-0000-000000000001'),
    ('20000000-0000-0000-0000-000000000002', 70000, 8000,  4000, 'INR', '10000000-0000-0000-0000-000000000001'),
    ('20000000-0000-0000-0000-000000000003', 60000, 5000,  3000, 'INR', '10000000-0000-0000-0000-000000000002'),
    ('20000000-0000-0000-0000-000000000004', 58000, 5000,  3000, 'INR', '10000000-0000-0000-0000-000000000002'),
    ('20000000-0000-0000-0000-000000000005', 52000, 4000,  2500, 'INR', '10000000-0000-0000-0000-000000000002');

INSERT INTO attendance (employee_id, attendance_date, check_in_at, check_out_at, status) VALUES
    ('20000000-0000-0000-0000-000000000003', CURRENT_DATE - 1, (CURRENT_DATE - 1) + TIME '09:02', (CURRENT_DATE - 1) + TIME '18:05', 'present'),
    ('20000000-0000-0000-0000-000000000003', CURRENT_DATE,     CURRENT_DATE + TIME '09:10', NULL, 'present'),
    ('20000000-0000-0000-0000-000000000004', CURRENT_DATE - 1, (CURRENT_DATE - 1) + TIME '09:00', (CURRENT_DATE - 1) + TIME '13:00', 'half_day'),
    ('20000000-0000-0000-0000-000000000004', CURRENT_DATE,     NULL, NULL, 'absent'),
    ('20000000-0000-0000-0000-000000000005', CURRENT_DATE - 1, NULL, NULL, 'leave');

INSERT INTO leave_requests (employee_id, leave_type, start_date, end_date, remarks, status, reviewed_by, reviewer_comment, reviewed_at) VALUES
    ('20000000-0000-0000-0000-000000000005', 'sick', CURRENT_DATE - 1, CURRENT_DATE - 1, 'Fever', 'approved', '20000000-0000-0000-0000-000000000002', 'Approved, get well soon', now() - INTERVAL '1 day'),
    ('20000000-0000-0000-0000-000000000004', 'paid', CURRENT_DATE + 5, CURRENT_DATE + 7, 'Family function', 'pending', NULL, NULL, NULL),
    ('20000000-0000-0000-0000-000000000003', 'unpaid', CURRENT_DATE + 10, CURRENT_DATE + 10, 'Personal', 'rejected', '20000000-0000-0000-0000-000000000002', 'Insufficient notice period', now() - INTERVAL '2 hours');

COMMIT;
