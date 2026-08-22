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

# Pending Technical Decisions

The following have intentionally not been finalized:

- Database library / ORM
- Authentication implementation
- Session/token strategy
- Document storage
- Deployment platform
