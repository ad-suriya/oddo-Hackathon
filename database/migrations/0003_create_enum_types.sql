-- Fixed, small vocabularies enforced at the database level, not just in
-- application code. Values come directly from PROJECT_CONTEXT.md / the
-- Dayflow requirements doc.

CREATE TYPE user_role AS ENUM ('employee', 'admin', 'hr');

CREATE TYPE attendance_status AS ENUM ('present', 'absent', 'half_day', 'leave');

CREATE TYPE leave_type AS ENUM ('paid', 'sick', 'unpaid');

CREATE TYPE leave_status AS ENUM ('pending', 'approved', 'rejected');
