# Dayflow API

## 1. Purpose

This document defines the REST API contract for Dayflow.

The React frontend communicates with the Node.js backend through these APIs.

All protected endpoints must enforce authentication and authorization.

---

# 2. API Principles

The API must:

- Use REST conventions.
- Use appropriate HTTP methods.
- Validate incoming data.
- Return consistent responses.
- Return appropriate HTTP status codes.
- Protect sensitive information.
- Enforce authorization.
- Handle errors consistently.

---

# 3. Base URL

Development:

```text
/api
```

Production:

```text
TBD
```

---

# 4. Existing Endpoints

Every endpoint in sections 5–10 below is implemented in `backend/src/routes/`
and verified against a real PostgreSQL database (manual smoke tests, an
automated `backend/tests/` suite, and the frontend itself with
`VITE_USE_MOCK_API=false`). See `docs/FRONTEND_HANDOFF.md` for exact request/
response DTOs, the error format, the role/permission matrix, and known gaps
(leave balance, payroll period/status, document upload, email verification).

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/api/health` | Backend liveness + database connectivity check | No |

---

# 5. Authentication

| Method | Endpoint             | Description                    | Auth | Role   |
| ------ | --------------------- | ------------------------------- | ---- | ------ |
| POST   | `/auth/signup`         | Create an account                | No   | Public |
| POST   | `/auth/login`          | Authenticate user                | No   | Public |
| POST   | `/auth/verify-email`   | Verify email                     | No   | Public |
| POST   | `/auth/logout`         | End authenticated session        | Yes  | All    |
| GET    | `/auth/me`             | Get current authenticated user   | Yes  | All    |

Cookie-based, server-side sessions (opaque token, hashed at rest in a new
`sessions` table) — see `docs/FRONTEND_HANDOFF.md` §1.

---

# 6. Employee

| Method | Endpoint         | Description          | Auth | Role     |
| ------ | ----------------- | ---------------------- | ---- | -------- |
| GET    | `/employees/me`   | Get own profile         | Yes  | Employee |
| PATCH  | `/employees/me`   | Update own profile      | Yes  | Employee |
| GET    | `/employees`      | Get employees           | Yes  | Admin/HR |
| GET    | `/employees/:id`  | Get employee details    | Yes  | Admin/HR |
| PATCH  | `/employees/:id`  | Update employee         | Yes  | Admin/HR |

---

# 7. Attendance

| Method | Endpoint                   | Description                   | Auth | Role     |
| ------ | --------------------------- | -------------------------------- | ---- | -------- |
| POST   | `/attendance/check-in`      | Check in                        | Yes  | Employee |
| POST   | `/attendance/check-out`     | Check out                       | Yes  | Employee |
| GET    | `/attendance/me`            | Get own attendance              | Yes  | Employee |
| GET    | `/attendance`               | Get employee attendance         | Yes  | Admin/HR |
| GET    | `/attendance/:employeeId`   | Get attendance for employee     | Yes  | Admin/HR |

---

# 8. Leave

| Method | Endpoint                       | Description             | Auth | Role     |
| ------ | -------------------------------- | -------------------------- | ---- | -------- |
| POST   | `/leave-requests`                 | Create leave request        | Yes  | Employee |
| GET    | `/leave-requests/me`              | Get own leave requests      | Yes  | Employee |
| GET    | `/leave-requests`                 | Get leave requests          | Yes  | Admin/HR |
| PATCH  | `/leave-requests/:id/approve`     | Approve request             | Yes  | Admin/HR |
| PATCH  | `/leave-requests/:id/reject`      | Reject request              | Yes  | Admin/HR |

---

# 9. Payroll

| Method | Endpoint                | Description                          | Auth | Role     |
| ------ | ------------------------- | --------------------------------------- | ---- | -------- |
| GET    | `/payroll/me`              | Get own salary/payroll information       | Yes  | Employee |
| GET    | `/payroll`                 | Get payroll information                 | Yes  | Admin/HR |
| PATCH  | `/payroll/:employeeId`     | Update salary information               | Yes  | Admin/HR |

`netPay`, `payPeriod`, and `paymentStatus` are computed at read time, not
stored columns — see `docs/FRONTEND_HANDOFF.md` §11 for the `payPeriod`/
`paymentStatus` gap.

---

# 10. Documents

| Method | Endpoint                     | Description              | Auth | Role     |
| ------ | ------------------------------ | --------------------------- | ---- | -------- |
| GET    | `/employees/me/documents`       | Get own documents            | Yes  | Employee |
| GET    | `/employees/:id/documents`      | Get employee documents       | Yes  | Admin/HR |

Read-only, implemented. Upload and delete endpoints are still not built —
see `docs/FRONTEND_HANDOFF.md` §11 ("Documents" gap).

---

# 11. HTTP Status Codes

| Status | Meaning                         |
| -----: | -------------------------------- |
|    200 | Successful request                |
|    201 | Resource created                  |
|    204 | Successful request with no body   |
|    400 | Invalid request                   |
|    401 | Authentication required/failed    |
|    403 | Insufficient permissions          |
|    404 | Resource not found                |
|    409 | Resource conflict                 |
|    422 | Validation error                  |
|    500 | Unexpected server error           |

---

# 12. Error Response

The API should use a consistent error format.

Example:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid email address",
    "details": {}
  }
}
```

This is the final, implemented error shape (`backend/src/utils/errors.js`,
`backend/src/middleware/errorHandler.js`). `/api/health`'s 503 body
(`{ status, database }`) is intentionally not wrapped in this shape — it's a
liveness probe response, not an error being thrown through the request
pipeline.

---

# 13. Validation

Backend validation must cover:

- Required fields
- Data types
- Email format
- Password requirements
- Dates
- Leave types
- Leave status transitions
- Attendance actions
- Salary values
- Resource IDs
- Resource existence

Frontend validation is for user experience.

Backend validation is mandatory.

---

# 14. Authorization

## Employee

Employees can access:

- Their own profile
- Their own attendance
- Their own leave requests
- Their own payroll/salary information
- Their own documents

## Admin / HR

Admin/HR users can access:

- Employee information
- Employee attendance
- Leave requests
- Leave approval/rejection
- Payroll/salary information
- Employee documents

The backend must verify permissions for every protected operation.

---

# 15. API Design Rules

## GET

Used for retrieving resources.

## POST

Used for creating resources or triggering operations such as check-in.

## PATCH

Used for partially updating resources.

## DELETE

Will be used when a resource actually needs to be deleted.

---

# 16. API Development Workflow

```text
Requirement
    ↓
Database Model
    ↓
API Contract
    ↓
Backend Implementation
    ↓
Validation
    ↓
Authorization
    ↓
Testing
    ↓
Frontend Integration
```

API endpoints should not be implemented without understanding the underlying data model.

---

# 17. Current API Status

- [x] REST API selected
- [x] Health check endpoint implemented
- [x] Authentication routes identified
- [x] Employee routes identified
- [x] Attendance routes identified
- [x] Leave routes identified
- [x] Payroll routes identified
- [x] Exact request schemas finalized
- [x] Exact response schemas finalized
- [x] Authentication implementation finalized (cookie-based sessions)
- [x] Authorization middleware finalized
- [x] Error format finalized
- [x] API validation finalized
- [x] API tests written (`backend/tests/`, 37 passing)
- [x] Frontend integration completed (`VITE_USE_MOCK_API=false` verified end-to-end)
