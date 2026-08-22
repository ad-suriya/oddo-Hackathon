# Dayflow Frontend Handoff

This document describes the now-implemented backend (`backend/src/`) for
whoever wires the frontend to it, or maintains either side afterwards. It
supersedes the "planned contract, not yet built" framing in `docs/API.md` —
every endpoint listed there under sections 5–10 is implemented.

To switch the frontend from the mock layer to this backend:

```env
# frontend/.env
VITE_API_BASE_URL=http://localhost:4000/api
VITE_USE_MOCK_API=false
```

No frontend code changes are required — every response shape below matches
`frontend/src/mocks/*.js` exactly.

---

## 1. Authentication / session mechanism

Cookie-based, server-side sessions — no JWT, no `Authorization` header,
matching `frontend/src/api/client.js`'s `credentials: "include"`.

- Login/signup: the backend generates a random 32-byte token, stores its
  SHA-256 hash + expiry in a new `sessions` table, and sets it as an
  `httpOnly`, signed cookie (`dayflow_session`).
- Every protected request: `middleware/auth.js` reads the cookie, hashes
  it, looks up the session row, and attaches `req.currentUser` /
  `req.currentEmployee`.
- `rememberMe: true` → persistent cookie (`Max-Age`, 30 days) and a
  30-day-lived session row. `rememberMe: false` → browser-session cookie
  (no `Max-Age`, cleared when the browser closes) backed by a 1-day session
  row as a safety net.
- Logout deletes the session row and clears the cookie.
- The cookie value is additionally signed (via `cookie-parser`'s
  `SESSION_SECRET`) as defense-in-depth against tampering — the session
  itself is still the opaque DB-backed token, not a JWT, so a leaked
  `SESSION_SECRET` alone does not forge a session.
- CORS: `cors({ origin: FRONTEND_ORIGIN, credentials: true })` — never a
  wildcard, since wildcard origins are incompatible with credentialed
  requests.
- Cookie flags: `sameSite: "lax"`, `secure: false` in development;
  `sameSite: "none"`, `secure: true` in production (`NODE_ENV=production`).
  A cross-domain production deployment (frontend and backend on different
  registrable domains) needs both sides served over HTTPS for `secure`
  cookies to work.

---

## 2. Endpoint table

All routes are mounted under `/api` (`backend/src/app.js`).

| Method | Endpoint | Auth | Role |
|---|---|---|---|
| GET | `/health` | No | — |
| POST | `/auth/signup` | No | Public |
| POST | `/auth/login` | No | Public |
| POST | `/auth/verify-email` | No | Public |
| POST | `/auth/logout` | Yes | All |
| GET | `/auth/me` | Yes | All |
| GET | `/employees/me` | Yes | Employee |
| PATCH | `/employees/me` | Yes | Employee |
| GET | `/employees/me/documents` | Yes | Employee |
| GET | `/employees` | Yes | Admin/HR |
| GET | `/employees/:id` | Yes | Admin/HR |
| PATCH | `/employees/:id` | Yes | Admin/HR |
| GET | `/employees/:id/documents` | Yes | Admin/HR |
| POST | `/attendance/check-in` | Yes | Employee |
| POST | `/attendance/check-out` | Yes | Employee |
| GET | `/attendance/me` | Yes | Employee |
| GET | `/attendance` | Yes | Admin/HR |
| GET | `/attendance/:employeeId` | Yes | Admin/HR |
| POST | `/leave-requests` | Yes | Employee |
| GET | `/leave-requests/me` | Yes | Employee |
| GET | `/leave-requests` | Yes | Admin/HR |
| PATCH | `/leave-requests/:id/approve` | Yes | Admin/HR |
| PATCH | `/leave-requests/:id/reject` | Yes | Admin/HR |
| GET | `/payroll/me` | Yes | Employee |
| GET | `/payroll` | Yes | Admin/HR |
| PATCH | `/payroll/:employeeId` | Yes | Admin/HR |

`admin` and `hr` are treated identically by authorization middleware
(`requireRole("admin", "hr")`), per `docs/DECISIONS.md`.

---

## 3. Request / response DTOs

All JSON is camelCase. See `backend/src/serializers/*.js` for the exact
mapping from snake_case DB columns.

### Auth user (`/auth/signup`, `/auth/login`, `/auth/me`)

```json
{
  "id": "uuid",
  "email": "alice@dayflow.dev",
  "role": "employee",
  "emailVerifiedAt": "2026-08-22T07:01:15.644Z",
  "employee": {
    "id": "uuid",
    "employeeCode": "EMP0003",
    "fullName": "Alice Kumar",
    "jobTitle": "Software Engineer",
    "department": "Engineering",
    "profilePictureUrl": null
  }
}
```

`POST /auth/signup` body: `{ fullName, employeeCode, email, password }`.
Public signup always creates `role: "employee"` — any `role` field in the
request body is ignored (see `docs/DECISIONS.md`, "Public Signup Cannot
Choose Admin/HR Role"). `POST /auth/login` body: `{ email, password,
rememberMe? }`.

### Employee (`/employees/me`, `/employees/:id`)

```json
{
  "id": "uuid",
  "employeeCode": "EMP0003",
  "fullName": "Alice Kumar",
  "email": "alice@dayflow.dev",
  "role": "employee",
  "phone": "+91-9000000003",
  "address": "Chennai, India",
  "jobTitle": "Software Engineer",
  "department": "Engineering",
  "dateJoined": "2024-03-01",
  "profilePictureUrl": null
}
```

`PATCH /employees/me` accepts only `phone`, `address`,
`profilePictureUrl` — any other field returns `403 FORBIDDEN`. `PATCH
/employees/:id` (admin/HR) additionally accepts `fullName`, `jobTitle`,
`department`, `dateJoined`.

`GET /employees?search=&department=` — `search` matches full name,
employee code, or email (case-insensitive substring).

### Attendance

```json
{
  "id": "3",
  "employeeId": "uuid",
  "attendanceDate": "2026-08-22",
  "checkInAt": "2026-08-22T03:40:00.000Z",
  "checkOutAt": "2026-08-22T07:06:30.662Z",
  "status": "present"
}
```

`GET /attendance` and `GET /attendance/:employeeId` (admin/HR) add an
`employee` summary object (`{ id, fullName, employeeCode, department }`).
`status` is one of `present`, `absent`, `half_day`, `leave` — the DB enum
values, unchanged from the mock/requirements doc.

### Leave request

```json
{
  "id": "4",
  "employeeId": "uuid",
  "leaveType": "paid",
  "startDate": "2026-09-01",
  "endDate": "2026-09-03",
  "remarks": "Trip",
  "status": "pending",
  "reviewedBy": null,
  "reviewerComment": null,
  "reviewedAt": null,
  "createdAt": "2026-08-22T07:06:49.116Z",
  "employee": { "id": "uuid", "fullName": "Alice Kumar", "employeeCode": "EMP0003", "department": "Engineering" },
  "reviewer": null
}
```

`leaveType`: `paid` | `sick` | `unpaid`. `status`: `pending` | `approved` |
`rejected`. `reviewer` is `null` until approved/rejected, then `{ id,
fullName }`.

### Payroll

```json
{
  "id": "uuid",
  "employeeId": "uuid",
  "employee": { "id": "uuid", "fullName": "Alice Kumar", "employeeCode": "EMP0003", "department": "Engineering" },
  "basicPay": 65000,
  "allowances": 6000,
  "deductions": 3000,
  "netPay": 68000,
  "currency": "INR",
  "updatedAt": "2026-08-22T07:09:45.693Z",
  "payPeriod": "August 2026",
  "paymentStatus": "paid"
}
```

`netPay = basicPay + allowances - deductions`, computed server-side on
every read — never stored. `payPeriod` / `paymentStatus` are also computed,
not stored — see "Known gaps" below.

### Document

```json
{
  "id": "uuid",
  "employeeId": "uuid",
  "fileName": "Offer Letter.pdf",
  "fileType": "application/pdf",
  "fileSizeBytes": 182400,
  "uploadedByName": "Helen Ross",
  "createdAt": "2026-08-22T07:10:21.496Z"
}
```

Read-only — see "Known gaps".

---

## 4. Error format

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Please fix the highlighted fields.",
    "details": { "email": "Email is required." }
  }
}
```

`details` is `{}` when there's nothing field-specific. Codes in use:
`VALIDATION_ERROR` (422), `UNAUTHENTICATED` (401), `FORBIDDEN` (403),
`NOT_FOUND` (404), `CONFLICT` (409), `INTERNAL_ERROR` (500). A raw
Postgres unique-violation (23505) that slips past application-level
checks — e.g. a race between two simultaneous check-ins — is caught by
`middleware/errorHandler.js` and mapped to `409 CONFLICT` rather than
leaking a 500.

---

## 5. Role / permission matrix

| Action | Employee | Admin/HR |
|---|---|---|
| View/edit own profile (limited fields) | Yes | Yes |
| View/edit any employee | No | Yes |
| Check in/out, view own attendance | Yes | Yes |
| View all attendance | No | Yes |
| Create/view own leave requests | Yes | Yes |
| View/approve/reject any leave request | No | Yes |
| View own payroll | Yes | Yes |
| View/edit any payroll | No | Yes |
| View own documents | Yes | Yes |
| View any employee's documents | No | Yes |

Enforced in `backend/src/middleware/auth.js` (`requireAuth`,
`requireRole`) plus per-route ownership checks in the controllers — never
by the frontend alone.

---

## 6. Business rules implemented

- **Attendance**: one row per `(employee_id, attendance_date)` — unique
  DB constraint (`database/migrations/0006_create_attendance_table.sql`).
  A second check-in the same day → `409 CONFLICT`. Check-out with no
  check-in yet → `422 VALIDATION_ERROR`. Check-out after already checking
  out → `409 CONFLICT`.
- **Leave**: approve/reject only valid on a `pending` request — an
  already-approved/rejected request returns `422 VALIDATION_ERROR` on a
  second approve/reject attempt (checked at the application level, and
  the `UPDATE ... WHERE status = 'pending'` in
  `leaveRequestsRepo.reviewLeaveRequest` is itself race-safe).
- **Payroll**: `basicPay`, `allowances`, `deductions` must all be `>= 0`
  (checked in `validation/payrollValidation.js`, backed by the DB
  `employee_salary_non_negative` CHECK constraint). `netPay` is always
  computed, never stored.
- **Signup**: always creates `role = "employee"`; the client cannot
  request `admin`/`hr`. Employee code and email must be unique
  (`409 CONFLICT` on either).

---

## 7. Query parameters

| Endpoint | Params |
|---|---|
| `GET /employees` | `search`, `department` |
| `GET /attendance/me`, `GET /attendance/:employeeId` | `from`, `to` (inclusive date range) |
| `GET /attendance` | `date` (defaults to today) |
| `GET /leave-requests` | `status` |

---

## 8. Database entities

Unchanged from `docs/DATABASE.md` plus one new table:

### `sessions` (new — migration `0010_create_sessions_table.sql`)

| Column | Type | Notes |
|---|---|---|
| token_hash | TEXT PK | SHA-256 of the cookie's raw token |
| user_id | UUID FK → users ON DELETE CASCADE | |
| expires_at | TIMESTAMPTZ NOT NULL | |
| created_at | TIMESTAMPTZ NOT NULL DEFAULT now() | |

Indexed on `user_id` (logout-everywhere / account deletion) and
`expires_at` (future expired-session sweep — no cron exists yet; expired
rows are simply excluded from lookups by `WHERE expires_at > now()`, so an
unbounded `sessions` table is a known low-priority cleanup gap).

All other tables (`users`, `employees`, `attendance`, `leave_requests`,
`employee_salary`, `employee_documents`) are unchanged from
`docs/DATABASE.md`.

---

## 9. Environment variables

Backend (`.env` in `backend/`, see `.env.example` at the repo root):

| Variable | Purpose |
|---|---|
| `PORT` | Backend HTTP port (default `4000`) |
| `NODE_ENV` | `development` \| `production` — affects cookie `secure`/`sameSite` |
| `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` | PostgreSQL connection |
| `FRONTEND_ORIGIN` | Exact frontend origin for CORS (default `http://localhost:5173`) |
| `SESSION_SECRET` | Signs the session cookie; set a real random value outside local dev |

Frontend (`frontend/.env`, see `frontend/.env.example`):

| Variable | Purpose |
|---|---|
| `VITE_API_BASE_URL` | Backend base URL, e.g. `http://localhost:4000/api` |
| `VITE_USE_MOCK_API` | `false` to use this backend instead of `src/mocks/` |

---

## 10. Local development

No PostgreSQL is required to be pre-installed. `embedded-postgres` (a
backend devDependency) downloads and runs a real PostgreSQL binary from
`node_modules` — same wire protocol and SQL as any Postgres install; it
exists purely for convenience and is **not** part of the production
runtime path (production still points `DB_*` at whatever real Postgres
instance you deploy).

```bash
cd backend
npm install

# Terminal 1 — starts and keeps running a local PostgreSQL 18 cluster
# at backend/.pgdata (gitignored), listening on 127.0.0.1:5433
npm run dev:db

# Terminal 2
npm run migrate   # applies database/migrations/*.sql, idempotent
npm run seed       # idempotent demo data, real bcrypt password hashes
npm run dev         # starts the Express server on :4000
npm test             # 37 passing tests (node:test + supertest)
```

If you already have a real PostgreSQL instance, skip `dev:db` and point
`DB_HOST`/`DB_PORT`/etc. at it instead — `migrate`/`seed`/`dev` don't care
which one they're talking to.

### Seed accounts (password: `Password123`)

| Email | Role |
|---|---|
| admin@dayflow.dev | admin |
| hr@dayflow.dev | hr |
| alice@dayflow.dev | employee |
| bob@dayflow.dev | employee |
| carol@dayflow.dev | employee |

Never expose these credentials or run the seed script against production.

---

## 11. Known gaps / TODOs

These were deliberately **not** solved here — flagging them rather than
inventing unspecified behavior, per the implementation brief.

### Leave balance

No entitlement/balance table exists in the schema. The "24 days/year" (or
similar) figure the frontend may display is a frontend-only placeholder,
not backend-computed. Open questions for a future decision: should leave
balance become backend-owned? What table (`leave_entitlements`? per
`leave_type`, per year?) and accrual rule? How do `paid`/`sick`/`unpaid`
balances differ? Until decided, do not infer or synthesize a balance
figure from `leave_requests` history in either frontend or backend.

### Payroll `payPeriod` / `paymentStatus`

Both are computed at serialization time (`payPeriod` = current
month/year label; `paymentStatus` = `"paid"` if `netPay > 0` else
`"pending"`), replicated verbatim from `frontend/src/mocks/payroll.js`.
Neither has a backing column — `employee_salary` is a current-snapshot
table with no payslip/period history
(`docs/DECISIONS.md`, "Payroll Is a Current Snapshot, No History Table").
A real payroll-period concept (monthly payslips, a `paymentStatus` that
reflects an actual payment event rather than a sign-of-netPay heuristic)
needs a new table and is out of scope here.

### Documents

`GET /employees/me/documents` and `GET /employees/:id/documents` are
implemented and read from `employee_documents`, but **no upload endpoint
exists** — `docs/API.md` §10 says as much ("Upload and delete endpoints
will be added after the document storage approach is selected"). The
`storage_path` column and `docs/DECISIONS.md`'s "local filesystem"
decision describe where files would go, but no route writes to
`backend/uploads/` yet. Do not add an upload endpoint without also
deciding: max file size, allowed MIME types, and whether
`profile_picture_url` (a plain URL string employees can already set via
`PATCH /employees/me`) should eventually go through the same storage
path instead.

### Email verification

`POST /auth/verify-email` exists for API-contract parity with
`docs/API.md`, but signup auto-verifies (`email_verified_at = now()` at
insert time) — same as `frontend/src/mocks/auth.js`. There is no pending
"unverified" state, no verification email is sent, and the frontend has
no dedicated verification page. If real email verification becomes a
requirement, this needs: an email-sending mechanism, a token generation
step at signup (populating the already-present
`email_verification_token_hash` / `_expires_at` columns on `users`), a
frontend page to consume `POST /auth/verify-email`, and a decision on
whether an unverified account can sign in at all in the meantime.

### Session table cleanup

`sessions` rows are never deleted on expiry, only excluded from lookups
(`WHERE expires_at > now()`). Fine at hackathon scale; a real deployment
would want a periodic sweep (`DELETE FROM sessions WHERE expires_at <
now()`) or `pg_cron`/an external scheduler.
