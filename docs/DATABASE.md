# Dayflow Database

## 1. Purpose

This document defines the finalized database schema for Dayflow.

Dayflow uses PostgreSQL (13+) as its primary relational database, accessed
from the Node.js backend via `pg` (node-postgres) — no ORM.

---

# 2. Database Principles

- Use relational modeling.
- Use primary keys for entities.
- Use foreign keys for relationships.
- Avoid unnecessary data duplication.
- Enforce important constraints at the database level.
- Use appropriate indexes.
- Protect sensitive information.
- Use migrations for schema changes.
- Keep database changes reproducible.
- Do not manually modify the database schema without recording the change in a migration.

---

# 3. Tables

```text
users
  |
  | 1:1
  v
employees
  |
  +------< attendance
  |
  +------< leave_requests  (reviewed_by --> employees)
  |
  +------< employee_salary  (1:1)
  |
  +------< employee_documents
```

Seven tables total (six here plus `sessions`, added once the authentication
mechanism was decided — see §4.7 and `docs/DECISIONS.md`). No `roles` or
`leave_types` lookup tables — those are small, fixed vocabularies modeled as
native Postgres ENUM types (`user_role`, `attendance_status`, `leave_type`,
`leave_status`), defined in `database/migrations/0003_create_enum_types.sql`.

---

# 4. Tables and Columns

## 4.1 users

Authentication account. One row per login identity — Employee, HR, and
Admin all authenticate through this table.

| Column | Type | Notes |
|---|---|---|
| id | UUID PK | `gen_random_uuid()` |
| email | CITEXT UNIQUE NOT NULL | case-insensitive |
| password_hash | TEXT NOT NULL | never plaintext |
| role | user_role NOT NULL DEFAULT 'employee' | `employee`, `hr`, `admin` |
| email_verification_token_hash | TEXT NULL | hashed, not the raw token |
| email_verification_expires_at | TIMESTAMPTZ NULL | |
| email_verified_at | TIMESTAMPTZ NULL | |
| created_at / updated_at | TIMESTAMPTZ NOT NULL | |

**Public signup always inserts `role = 'employee'`**, regardless of what the
signup form displays. `hr` and `admin` accounts are created out-of-band
(seed data or an internal invite endpoint the backend restricts to existing
admins). See [DECISIONS.md](DECISIONS.md) — the requirements doc's literal
"choose Employee or HR at signup" is a privilege-escalation hole and was
deliberately not implemented that way.

## 4.2 employees

HR profile. 1:1 with `users` — every account, including HR/Admin, is staff
and gets exactly one row here.

| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| user_id | UUID UNIQUE NOT NULL FK → users | |
| employee_code | TEXT UNIQUE NOT NULL | human-readable ID entered at signup |
| full_name | TEXT NOT NULL | |
| phone | TEXT NULL | |
| address | TEXT NULL | employee-editable |
| job_title | TEXT NULL | |
| department | TEXT NULL | |
| date_joined | DATE NULL | |
| profile_picture_url | TEXT NULL | employee-editable |
| created_at / updated_at | TIMESTAMPTZ NOT NULL | |

## 4.3 attendance

| Column | Type | Notes |
|---|---|---|
| id | BIGSERIAL PK | |
| employee_id | UUID NOT NULL FK → employees ON DELETE CASCADE | |
| attendance_date | DATE NOT NULL | |
| check_in_at / check_out_at | TIMESTAMPTZ NULL | |
| status | attendance_status NOT NULL | `present`, `absent`, `half_day`, `leave` |
| created_at / updated_at | TIMESTAMPTZ NOT NULL | |

One record per employee per calendar day: `UNIQUE (employee_id, attendance_date)`.
No multi-session check-in/out within a day for the MVP.
`CHECK (check_out_at > check_in_at)` when both are set.

## 4.4 leave_requests

| Column | Type | Notes |
|---|---|---|
| id | BIGSERIAL PK | |
| employee_id | UUID NOT NULL FK → employees ON DELETE CASCADE | requester |
| leave_type | leave_type NOT NULL | `paid`, `sick`, `unpaid` |
| start_date / end_date | DATE NOT NULL | `CHECK (start_date <= end_date)` |
| remarks | TEXT NULL | from employee |
| status | leave_status NOT NULL DEFAULT 'pending' | `pending`, `approved`, `rejected` |
| reviewed_by | UUID NULL FK → employees ON DELETE SET NULL | the admin/HR who reviewed |
| reviewer_comment | TEXT NULL | |
| reviewed_at | TIMESTAMPTZ NULL | |
| created_at / updated_at | TIMESTAMPTZ NOT NULL | |

## 4.5 employee_salary

Current salary snapshot only — **no history table, no payslip records** for
the MVP. Updating salary overwrites the row. Payslip generation is listed
under "Future Enhancements" in the requirements doc, not the MVP scope.

| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| employee_id | UUID UNIQUE NOT NULL FK → employees ON DELETE CASCADE | 1:1 |
| basic_pay / allowances / deductions | NUMERIC(12,2) NOT NULL DEFAULT 0 | all `>= 0` |
| currency | CHAR(3) NOT NULL DEFAULT 'INR' | ISO 4217, assumption — confirm if wrong |
| updated_by | UUID NULL FK → users ON DELETE SET NULL | admin/HR who last edited |
| created_at / updated_at | TIMESTAMPTZ NOT NULL | |

## 4.6 employee_documents

Files are stored on the backend's local filesystem (e.g. `backend/uploads/`);
only metadata + relative path lives in Postgres. Profile picture is a
separate single-value column on `employees`, not a row here.

| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| employee_id | UUID NOT NULL FK → employees ON DELETE CASCADE | |
| file_name | TEXT NOT NULL | |
| file_type | TEXT NOT NULL | MIME type |
| file_size_bytes | BIGINT NOT NULL | |
| storage_path | TEXT NOT NULL | relative path on disk |
| uploaded_by | UUID NULL FK → users ON DELETE SET NULL | |
| created_at | TIMESTAMPTZ NOT NULL | |

## 4.7 sessions

Cookie-backed server-side session store — the authentication mechanism
decided in `docs/DECISIONS.md` ("Cookie-Based Server-Side Sessions").

| Column | Type | Notes |
|---|---|---|
| token_hash | TEXT PK | SHA-256 of the session cookie's raw token — the raw token is never stored, same convention as `users.email_verification_token_hash` |
| user_id | UUID NOT NULL FK → users ON DELETE CASCADE | |
| expires_at | TIMESTAMPTZ NOT NULL | |
| created_at | TIMESTAMPTZ NOT NULL DEFAULT now() | |

No `updated_at` — a session row is never mutated, only created and deleted
(logout) or left to expire.

---

# 5. Relationships and Cascading

```text
users --1:1--> employees                 ON DELETE CASCADE
employees --1:N--> attendance            ON DELETE CASCADE
employees --1:N--> leave_requests        ON DELETE CASCADE (as requester)
employees --1:1--> employee_salary       ON DELETE CASCADE
employees --1:N--> employee_documents    ON DELETE CASCADE
employees --1:N--> leave_requests        ON DELETE SET NULL (as reviewer)
users     --1:N--> employee_documents    ON DELETE SET NULL (as uploader)
users     --1:N--> employee_salary       ON DELETE SET NULL (as last editor)
users     --1:N--> sessions              ON DELETE CASCADE
```

Deleting an employee's account cascades through their own attendance, leave
requests, salary, and documents. It does **not** delete leave requests they
reviewed as HR/Admin, or documents they uploaded for someone else — those
rows keep the record but null out the `reviewed_by`/`uploaded_by` reference.

---

# 6. Constraints

| Table | Constraint |
|---|---|
| users | `email` unique (case-insensitive), `role` restricted to ENUM |
| employees | `user_id` unique, `employee_code` unique |
| attendance | `(employee_id, attendance_date)` unique, checkout after checkin |
| leave_requests | `start_date <= end_date`, `status`/`leave_type` restricted to ENUM |
| employee_salary | `employee_id` unique, all monetary fields `>= 0` |

---

# 7. Indexing

| Index | Reason |
|---|---|
| `users.email` (from UNIQUE) | login lookup |
| `employees.user_id` (from UNIQUE) | profile lookup by account |
| `employees.employee_code` (from UNIQUE) | lookup by HR-facing ID |
| `attendance (employee_id, attendance_date)` (from UNIQUE) | own/admin attendance queries, upsert on check-in |
| `attendance.attendance_date` | admin "everyone's attendance today" dashboard query |
| `leave_requests.employee_id` | "my leave requests" |
| `leave_requests.status` | admin "pending approvals" queue |
| `employee_documents.employee_id` | "my documents" / admin document list |
| `sessions` (from PK) | cookie lookup on every authenticated request |
| `sessions.user_id` | logout-everywhere / account-deletion cleanup |
| `sessions.expires_at` | future expired-session sweep (not yet scheduled — see `docs/FRONTEND_HANDOFF.md` §11) |

No indexes added beyond what the API endpoints in `docs/API.md` actually
query by.

---

# 8. Database Migrations

```text
database/
├── migrations/
│   ├── 0001_enable_extensions.sql
│   ├── 0002_create_updated_at_function.sql
│   ├── 0003_create_enum_types.sql
│   ├── 0004_create_users_table.sql
│   ├── 0005_create_employees_table.sql
│   ├── 0006_create_attendance_table.sql
│   ├── 0007_create_leave_requests_table.sql
│   ├── 0008_create_employee_salary_table.sql
│   ├── 0009_create_employee_documents_table.sql
│   └── 0010_create_sessions_table.sql
├── queries/
│   └── common_queries.sql
└── seeds/
    └── 0001_seed_dev_data.sql
```

Apply migrations in filename order against a fresh database. Never edit an
already-applied migration — write a new one.

---

# 9. Local PostgreSQL Setup

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=dayflow
DB_USER=postgres
DB_PASSWORD=...
```

```bash
createdb dayflow
for f in database/migrations/*.sql; do psql "$DATABASE_URL" -f "$f"; done
```

Or, without `psql`/an existing PostgreSQL install: `cd backend && npm run
migrate` runs the same `database/migrations/*.sql` files in order via `pg`
(see `backend/scripts/migrate.js`) — idempotent, tracked in a
`schema_migrations` table.

If no PostgreSQL server is available at all, `npm run dev:db` inside
`backend/` starts a real local PostgreSQL 18 cluster (via the
`embedded-postgres` devDependency, downloaded binaries, no system install
required) — see `docs/FRONTEND_HANDOFF.md` §10.

Never commit real database credentials.

---

# 10. Seed Data

`database/seeds/0001_seed_dev_data.sql` is the original placeholder-hash
version, kept for reference — its password hashes are **not** valid
bcrypt hashes and cannot be used to log in.

`backend/scripts/seed.js` (`cd backend && npm run seed`) is the real,
idempotent seed to use now that auth is implemented: same accounts/UUIDs,
real bcrypt hashes of the documented demo password. Every insert is
guarded by `ON CONFLICT` / `NOT EXISTS`, so running it repeatedly is safe.
Seed data must never contain real user information.

---

# 11. Known Assumptions (confirm if wrong)

- Admin and HR Officer are two distinct `role` values (`admin`, `hr`) with
  the same schema-level access; any difference in what they're *allowed* to
  do is enforced in backend authorization logic, not the database.
- Salary `currency` defaults to `'INR'`.
- `employees.job_title` / `department` / `date_joined` are the "job
  details" the requirements doc mentions but doesn't enumerate — adjust if
  more fields are needed.

---

# 12. Current Database Status

- [x] PostgreSQL selected
- [x] Core domains identified
- [x] Entities finalized
- [x] ER / relationships finalized
- [x] Columns finalized
- [x] Primary keys finalized
- [x] Foreign keys finalized
- [x] Constraints finalized
- [x] Indexes finalized
- [x] Database access approach selected (raw SQL via `pg`, no ORM)
- [x] Initial migrations created
- [x] Seed data created
- [x] Database tested with backend (real PostgreSQL, `backend/tests/`, manual smoke tests, live frontend integration)
