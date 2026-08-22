# Dayflow Architecture

## 1. Purpose

This document describes the technical architecture of Dayflow.

The architecture should remain simple, modular, maintainable, and understandable by the entire team.

Dayflow is divided into three primary layers:

- Frontend
- Backend
- Database

---

# 2. High-Level Architecture

```text
                    DAYFLOW
                       |
          +------------+------------+
          |                         |
      Frontend                  Backend
      React                    Node.js
          |                         |
          |                    REST API
          |                         |
          +------------HTTP----------+
                                    |
                              PostgreSQL
                               Database
```

The React frontend communicates with the Node.js backend through REST APIs.

The backend communicates with PostgreSQL.

The frontend must not communicate directly with the database.

---

# 3. Application Layers

## 3.1 Frontend

The frontend will be built using React.

The frontend is responsible for:

- User interface
- Pages
- Dashboards
- Forms
- Navigation
- Client-side validation
- API integration
- Loading states
- Error states
- Responsive design

The frontend must not be treated as a security boundary.

Authorization must always be enforced by the backend.

---

## 3.2 Backend

The backend will run on Node.js.

The backend is responsible for:

- REST API
- Authentication
- Authorization
- Input validation
- Business logic
- Database operations
- Error handling
- Security-sensitive operations

The backend should be organized into modular feature areas.

Initial feature modules:

```text
Authentication
Employees
Attendance
Leave
Payroll
Documents
```

The exact backend folder structure per feature module is still to be finalized.

---

## 3.3 Database

Dayflow will use PostgreSQL as the primary database.

PostgreSQL is responsible for persistent application data including:

- Users
- Employees
- Attendance
- Leave requests
- Payroll/salary information
- Employee documents/metadata

The detailed database design is documented in:

`docs/DATABASE.md`

---

# 4. User Roles

Dayflow currently has two primary roles.

## Employee

Employees can access:

- Their own profile
- Their own attendance
- Check-in/check-out
- Their own leave requests
- Their own payroll/salary information

## Admin / HR

Admin/HR users can access:

- Employee management
- Employee attendance
- Leave requests
- Leave approval/rejection
- Payroll/salary management

The backend must enforce role-based authorization.

---

# 5. Request Flow

A typical request follows:

```text
User
  |
  v
React Frontend
  |
  | HTTP Request
  v
Node.js Backend
  |
  v
Authentication
  |
  v
Authorization
  |
  v
Input Validation
  |
  v
Business Logic
  |
  v
PostgreSQL
  |
  v
Backend Response
  |
  v
React Frontend
  |
  v
User
```

---

# 6. Backend Design Principles

## Separation of Concerns

Authentication, validation, business logic, and database access should be separated into appropriate modules.

## Validation

All important user input must be validated on the backend.

Frontend validation is for user experience and cannot replace backend validation.

## Authorization

Every protected operation must verify that the authenticated user has permission to perform it.

## Error Handling

Errors should be handled consistently and return useful API responses.

## Modularity

Features should be separated into logical modules instead of creating one large backend file.

## Security

Sensitive information such as passwords and salary information must be protected.

---

# 7. Frontend Design Principles

The frontend should provide:

- Clean UI
- Consistent layout
- Consistent color scheme
- Intuitive navigation
- Responsive design
- Loading states
- Empty states
- Error states
- Form validation feedback
- Clear user feedback

The UI should clearly distinguish Employee and Admin/HR functionality.

---

# 8. API Communication

The frontend communicates with the backend using REST APIs.

Example:

```text
React
   |
   | GET /api/employees/me
   v
Node.js
   |
   | Query
   v
PostgreSQL
   |
   | Result
   v
Node.js
   |
   | JSON Response
   v
React
```

The API contract is documented in:

`docs/API.md`

---

# 9. Security Principles

The system must follow these principles:

- Passwords must never be stored as plaintext.
- Protected endpoints must require authentication.
- Authorization must be checked on the backend.
- Employees must not access other employees' private information.
- Salary information must be protected.
- User input must be validated.
- Database queries must use safe parameterization.
- Sensitive configuration must be stored using environment variables.
- Secrets must never be committed to Git.
- The frontend must not be trusted for authorization.

---

# 10. Technology Stack

## Frontend

**React**

Status: Selected

---

## Backend Runtime

**Node.js**

Status: Selected

---

## API Style

**REST API**

Status: Selected

---

## Database

**PostgreSQL**

Status: Selected

---

## Backend Framework

**Express**

Status: Selected

Already scaffolded in `backend/src/` (see `docs/DECISIONS.md`). Chosen for
its minimal footprint and the team's existing JavaScript familiarity.

---

## Database Library / ORM

**TBD**

The team will select the database access approach after the PostgreSQL schema is designed.

---

## Authentication

**TBD**

The authentication mechanism has not yet been finalized.

---

## Document Storage

**TBD**

The approach for storing employee documents has not yet been finalized.

---

## Deployment

**TBD**

The deployment platform has not yet been finalized.

---

# 11. Scalability

The initial architecture prioritizes:

1. Correctness
2. Maintainability
3. Simplicity
4. Security
5. Clear separation of responsibilities

The project should avoid premature optimization.

The architecture should still allow:

- Additional HR modules
- More employees
- More API endpoints
- Additional frontend pages
- Database query optimization
- Additional roles and permissions

---

# 12. Project Structure

The high-level repository structure is:

```text
dayflow/
│
├── frontend/
│   └── React application
│
├── backend/
│   └── Node.js application
│
├── database/
│   ├── migrations/
│   └── seeds/
│
├── docs/
│   ├── API.md
│   ├── ARCHITECTURE.md
│   ├── DATABASE.md
│   └── DECISIONS.md
│
├── PROJECT_CONTEXT.md
├── README.md
└── .gitignore
```

The exact internal folder structure of `frontend/` and `backend/` will be decided during implementation.

---

# 13. Current Architecture Status

- [x] High-level architecture defined
- [x] Frontend/backend/database separation defined
- [x] User roles identified
- [x] React selected
- [x] Node.js selected
- [x] REST API selected
- [x] PostgreSQL selected
- [x] Backend framework selected (Express)
- [ ] Authentication approach selected
- [ ] Database library / ORM selected
- [ ] Document storage selected
- [ ] Deployment strategy selected
- [ ] Detailed backend module structure finalized
- [ ] Detailed frontend structure finalized
