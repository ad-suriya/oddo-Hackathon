# Dayflow Technical Decisions

This document records significant technical decisions made by the team.

A decision should be added when it has a meaningful impact on:

- Architecture
- Database
- Backend
- Frontend
- Security
- Development workflow
- Deployment

Do not record trivial implementation details.

---

# Decision Format

```md
## YYYY-MM-DD - Decision Title

### Decision

What was decided.

### Reason

Why it was decided.

### Alternatives Considered

- Alternative 1
- Alternative 2

### Impact

What this decision changes.
```

---

# Decisions

## 2026-08-22 - Use React for Frontend

### Decision

Dayflow will use React for the frontend.

### Reason

React provides a component-based architecture suitable for building reusable HR dashboards, forms, navigation, and UI components.

### Alternatives Considered

- Other frontend frameworks
- Plain JavaScript

### Impact

The frontend will be implemented using React.

The frontend communicates with the backend through REST APIs.

---

## 2026-08-22 - Use Node.js for Backend

### Decision

Dayflow will use Node.js as the backend runtime.

### Reason

Node.js provides the runtime required for building the backend API and allows the team to work with JavaScript across the application stack.

### Alternatives Considered

- Other backend runtimes

### Impact

The backend will run on Node.js.

---

## 2026-08-22 - Use Express as Backend Framework

### Decision

Dayflow will use Express as the Node.js backend framework.

### Reason

Minimal, well-understood, huge ecosystem, and pairs naturally with a team
that's already committed to JavaScript on both ends. The team is new to
relational databases, so a lightweight framework keeps the learning curve
focused on the database/API concepts rather than framework conventions.

### Alternatives Considered

- Fastify
- NestJS (more structure, more to learn up front)

### Impact

The backend (`backend/src/`) is already scaffolded on Express
(`app.js`, `routes/`, `controllers/`, `middleware/`), with a working
`GET /api/health` endpoint verifying the frontend → backend → database
chain.

---

## 2026-08-22 - Use REST API

### Decision

The frontend and backend will communicate through a REST API.

### Reason

REST provides a simple and well-understood communication model between the React frontend and Node.js backend.

### Alternatives Considered

- GraphQL
- Direct database access from frontend

### Impact

The React frontend will not directly access PostgreSQL.

Backend functionality will be exposed through documented HTTP endpoints.

---

## 2026-08-22 - Use PostgreSQL

### Decision

Dayflow will use PostgreSQL as its primary database.

### Reason

The project requirements emphasize proper relational database design and specifically encourage solutions using local databases such as MySQL and PostgreSQL rather than relying entirely on Backend-as-a-Service platforms.

PostgreSQL provides:

- Relational data modeling
- Foreign keys
- Constraints
- Transactions
- Indexing
- Strong data integrity

### Alternatives Considered

- Firebase
- Supabase
- MongoDB
- MySQL

### Impact

The team is responsible for:

- Designing the relational schema
- Managing migrations
- Defining relationships
- Defining constraints
- Managing the local PostgreSQL database
- Connecting the backend to PostgreSQL

---

## 2026-08-22 - Separate Frontend, Backend and Database

### Decision

Dayflow will use a separated frontend/backend/database architecture.

```text
React
  ↓
Node.js REST API
  ↓
PostgreSQL
```

### Reason

This provides clear separation of responsibilities and allows each part of the system to be developed and maintained independently.

### Impact

The frontend will not directly access the database.

The backend will own database access and business logic.

---

## 2026-08-22 - Backend Owns Authorization

### Decision

Authorization will be enforced by the backend.

### Reason

Frontend restrictions can be bypassed.

Employee and salary information is sensitive and requires server-side access control.

### Impact

Every protected backend operation must verify:

1. Authentication
2. User role
3. Resource permissions

---

## 2026-08-22 - Validate Input on the Backend

### Decision

Important user input must be validated by the backend.

### Reason

Frontend validation improves user experience but cannot be trusted as a security mechanism.

### Impact

Backend APIs must validate:

- Required fields
- Data types
- Email addresses
- Password requirements
- Dates
- Leave information
- Attendance operations
- Salary values

---

## 2026-08-22 - Use Database Migrations

### Decision

Database schema changes will be managed through migration files.

### Reason

Migrations make schema changes reproducible and keep team development environments synchronized.

### Impact

Database changes must be represented by migration files.

Example:

```text
database/
└── migrations/
    ├── 0001_initial_schema.sql
    ├── 0002_add_attendance.sql
    └── ...
```

---

## 2026-08-22 - Public Signup Cannot Choose Admin/HR Role

### Decision

Public self-registration always creates a user with `role = 'employee'`,
regardless of the "Role (Employee/HR)" field shown on the signup form in
the requirements doc. Admin/HR accounts are created out-of-band (seed data,
or an internal invite endpoint restricted to existing admins).

### Reason

Letting an unauthenticated signup form grant `admin`/`hr` on request is a
privilege-escalation vulnerability — anyone could self-promote to an HR
role with access to all employee salary and personal data.

### Alternatives Considered

- Implement literally as written in the requirements doc.

### Impact

`users.role` ENUM has three values (`employee`, `admin`, `hr`), but the
signup API must hardcode `employee` and ignore/reject any role provided by
the client. Backend implementers must not "complete" this by wiring the
signup form's role selector through to the database.

---

## 2026-08-22 - Admin and HR Officer Are Two Distinct Roles

### Decision

`users.role` has separate `admin` and `hr` values rather than merging them
into one role.

### Reason

Keeps the door open for different permission sets between platform
administration and HR operations later, at negligible schema cost (one
extra ENUM value).

### Impact

The requirements doc doesn't specify different permissions between the two
today, so backend authorization may treat them identically for the MVP.
Splitting them later at the authorization layer (not the schema) is safe.

---

## 2026-08-22 - Payroll Is a Current Snapshot, No History Table

### Decision

`employee_salary` is a 1:1 table with `employees` holding only the current
salary structure. Updating salary overwrites the row. No `salary_history`
or payslip table exists yet.

### Reason

The requirements doc's MVP scope is "payroll visibility" and "salary
structure management"; payslip generation is explicitly listed under
"Future Enhancements", not MVP. Adding history/audit tables now would be
speculative complexity.

### Impact

Past salary changes are not recoverable from the database. If payslip
history becomes a requirement, it needs a new append-only table and a
migration — flagged here so it isn't silently assumed to already exist.

---

## 2026-08-22 - Employee Documents Stored on Local Filesystem

### Decision

Uploaded documents and profile pictures are written to the backend's local
filesystem (e.g. `backend/uploads/`). PostgreSQL stores only metadata and
the relative `storage_path`, via the `employee_documents` table.

### Reason

Simplest option for a hackathon timeline; avoids adding an external object
storage dependency (S3-compatible bucket, credentials, SDK) before it's
needed.

### Impact

Not suitable for a real multi-instance production deployment (files aren't
shared across backend instances/deploys). If that becomes necessary, swap
to object storage by changing `storage_path` semantics and the backend's
file-handling code — the `employee_documents` table itself doesn't need to
change.

---

## 2026-08-22 - No ORM: Raw SQL via node-postgres (pg)

### Decision

The backend accesses PostgreSQL directly through the `pg` driver, writing
parameterized SQL, rather than adopting an ORM (Prisma, Sequelize, etc.).

### Reason

`pg` is already a backend dependency (see `backend/package.json`). The
schema is six tables with no complex query patterns that would justify ORM
overhead — plain SQL keeps the mapping between `docs/DATABASE.md` and
actual queries direct and auditable, and matches the Express decision's
theme of keeping the framework/tooling learning curve low.

### Alternatives Considered

- Prisma
- Sequelize
- Knex (query builder, not full ORM)

### Impact

All queries are hand-written SQL (see `database/queries/common_queries.sql`
for reference queries). No schema-migration codegen — migrations stay
plain, ordered `.sql` files per the existing convention.

---

## 2026-08-22 - Cookie-Based Server-Side Sessions

### Decision

Authentication uses an opaque, random session token stored in an
`httpOnly` cookie. The token itself is never persisted — only its SHA-256
hash, in a new `sessions` table (`token_hash`, `user_id`, `expires_at`).
The cookie is additionally signed (`cookie-parser` + `SESSION_SECRET`) as
defense-in-depth against tampering.

### Reason

The frontend already calls `fetch(url, { credentials: "include" })` with
no `Authorization` header (`frontend/src/api/client.js`), so cookies were
the only fit without a frontend change. A DB-backed opaque token (rather
than a JWT) means sessions can be invalidated server-side on logout —
a stateless JWT can't be revoked without an extra denylist mechanism,
which is more moving parts than a hackathon-scope session store needs.

### Alternatives Considered

- JWT in an `httpOnly` cookie (stateless, but revocation requires a
  denylist table anyway — no simpler than just storing the session).
- `express-session` + `connect-pg-simple` (a well-known combination, but
  pulls in a second table-management convention on top of the project's
  existing hand-written-migrations approach for no real benefit here).

### Impact

New `sessions` table (`database/migrations/0010_create_sessions_table.sql`).
`SESSION_SECRET` added to backend env vars. See
`docs/FRONTEND_HANDOFF.md` §1 for full mechanics (remember-me handling,
cookie flags per environment, CORS requirements).

---

## 2026-08-22 - Password Hashing via bcryptjs

### Decision

Passwords are hashed with `bcryptjs` (pure-JS bcrypt, 10 salt rounds)
rather than the native `bcrypt` package.

### Reason

`bcryptjs` has no native-addon build step — one less thing to break across
teammates' machines/OSes on a hackathon timeline. Hashing cost is not a
bottleneck at this scale.

### Impact

`backend/src/utils/password.js` wraps `hashPassword`/`verifyPassword`.
Seed accounts (`backend/scripts/seed.js`) use the same function, so seeded
and self-registered accounts are hashed identically.

---

## 2026-08-22 - embedded-postgres for Local Development

### Decision

`backend/scripts/dev-db.js` (via the `embedded-postgres` devDependency)
can start a real, local PostgreSQL server from downloaded binaries — no
system-wide PostgreSQL install, Docker, or admin rights required.

### Reason

Not every teammate's (or grader's) machine has PostgreSQL installed, and
requiring it is friction the app itself doesn't need — `embedded-postgres`
runs the actual PostgreSQL binary (same wire protocol, same SQL), just
without a system install. `backend/src/repositories/db.js` and every query
in the app are unaware of the difference; production deployments simply
point `DB_HOST`/`DB_PORT`/etc. at a real managed or self-hosted instance
and never touch this script.

### Alternatives Considered

- Requiring a system PostgreSQL install or Docker Compose (real friction
  when neither is available in an environment — which is exactly the
  situation this decision solves for).
- An in-memory JS reimplementation of Postgres (e.g. `pg-mem`) for
  dev/test — rejected because it isn't actually PostgreSQL: subtly
  different SQL support/behavior would undermine the "no ORM, plain SQL
  against real Postgres" approach the rest of the backend commits to.

### Impact

`backend/.pgdata/` (gitignored) holds the local cluster's data directory.
`npm run dev:db` / `npm run migrate` / `npm run seed` in
`docs/FRONTEND_HANDOFF.md` §10 describe the local workflow. Nothing in
`backend/src/` (the actual runtime code) depends on `embedded-postgres` —
only the dev-convenience scripts do.

---

# Pending Technical Decisions

The following have intentionally not been finalized:

- Deployment platform
- Leave balance/entitlement model (see `docs/FRONTEND_HANDOFF.md` §11)
- Payroll period/payslip history (see `docs/FRONTEND_HANDOFF.md` §11)
- Document upload endpoint and storage wiring (see `docs/FRONTEND_HANDOFF.md` §11)
- Real email verification flow (see `docs/FRONTEND_HANDOFF.md` §11)
