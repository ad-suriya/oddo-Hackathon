# Dayflow Database

## 1. Purpose

This document defines the database architecture and data model for Dayflow.

Dayflow will use PostgreSQL as its primary relational database.

The database must support:

- Authentication
- Employee profiles
- Employee management
- Attendance
- Leave management
- Payroll/salary information
- Employee documents

---

# 2. Database Principles

The database should follow these principles:

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

# 3. Core Domains

The initial domains are:

```text
Authentication
      |
      v
Employee
  /   |    \
 /    |     \
v     v      v
Attendance Leave Payroll
            |
            v
        Documents
```

These domains will be represented using PostgreSQL tables.

---

# 4. Core Entities

## 4.1 User

Represents an authenticated account.

Initial conceptual fields:

- ID
- Email
- Password hash
- Role
- Email verification status
- Created timestamp
- Updated timestamp

The exact columns and authentication implementation will be finalized before the first migration.

---

## 4.2 Employee

Represents an employee's HR profile.

Initial conceptual fields:

- ID
- User reference
- Name
- Contact information
- Address
- Job information
- Profile picture
- Created timestamp
- Updated timestamp

The exact fields will be finalized during schema design.

---

## 4.3 Attendance

Represents an employee attendance record.

Initial conceptual fields:

- ID
- Employee reference
- Date
- Check-in time
- Check-out time
- Status
- Created timestamp
- Updated timestamp

Valid attendance statuses:

```text
Present
Absent
Half-day
Leave
```

---

## 4.4 Leave Request

Represents a leave request submitted by an employee.

Initial conceptual fields:

- ID
- Employee reference
- Leave type
- Start date
- End date
- Remarks
- Status
- Admin/HR comment
- Created timestamp
- Updated timestamp

Valid leave types:

```text
Paid
Sick
Unpaid
```

Valid statuses:

```text
Pending
Approved
Rejected
```

---

## 4.5 Payroll / Salary

Represents employee salary/payroll information.

The exact model is still being designed.

The database must support:

- Employee salary information
- Admin/HR salary management
- Employee access to their own salary information

The team must decide whether the MVP requires:

- Current salary only
- Salary history
- Payslips
- Salary components
- Payroll records

Do not add unnecessary payroll complexity before the MVP requirements require it.

---

## 4.6 Employee Document

Represents a document associated with an employee.

The exact storage architecture is not finalized.

The database may store:

- Document ID
- Employee ID
- File name
- File type
- File size
- Storage reference
- Created timestamp

The actual file may be stored separately from PostgreSQL.

---

# 5. Initial Relationships

Conceptual relationship:

```text
User
 |
 | 1 : 1
 v
Employee
 |
 +------< Attendance
 |
 +------< Leave Request
 |
 +------< Payroll / Salary
 |
 +------< Employee Document
```

The exact cardinality must be reviewed before creating the migration.

---

# 6. Important Constraints

## Users

- Email should be unique.
- Role must be restricted to valid roles.
- Password must never be stored as plaintext.

## Employees

- Employee should reference a valid user where applicable.
- Required employee fields must not be nullable unnecessarily.

## Attendance

- Attendance must reference an existing employee.
- Attendance date must be valid.
- Duplicate records for the same employee/day must be considered.
- Check-out should not occur before check-in.

## Leave Requests

- Leave request must reference an existing employee.
- Start date must not be after end date.
- Leave type must be valid.
- Status must be valid.

## Payroll

- Payroll/salary records must reference the correct employee.
- Salary information must only be accessible to authorized users.

---

# 7. Indexing

Indexes should be based on actual query patterns.

Potential indexes include:

```text
users.email

employees.user_id

attendance.employee_id
attendance.date

leave_requests.employee_id
leave_requests.status

payroll.employee_id
```

Indexes must be reviewed after the final schema and API queries are known.

Do not add indexes blindly.

---

# 8. Database Migrations

All schema changes must use migrations.

Expected structure:

```text
database/
│
├── migrations/
│   ├── 0001_initial_schema.sql
│   ├── 0002_add_attendance.sql
│   └── ...
│
└── seeds/
    ├── README.md
    └── ...
```

Migration requirements:

- Ordered
- Reproducible
- Clearly named
- Reviewed before merging
- Safe to apply in a new environment

---

# 9. Local PostgreSQL Setup

Required database:

```text
PostgreSQL
```

Development database:

```text
dayflow
```

Example environment variable:

```env
DATABASE_URL=postgresql://USER:PASSWORD@localhost:5432/dayflow
```

Actual setup commands will be added after the database tooling is selected.

Never commit real database credentials.

---

# 10. Seed Data

Development seed data may contain:

- Test Admin/HR
- Test Employee
- Sample attendance
- Sample leave requests
- Sample salary data

Seed data must never contain real user information or production credentials.

---

# 11. Database Design Workflow

The database must be designed in this order:

```text
Requirements
     ↓
Identify Domains
     ↓
Identify Entities
     ↓
Define Relationships
     ↓
Define Columns
     ↓
Define Primary Keys
     ↓
Define Foreign Keys
     ↓
Define Constraints
     ↓
Review Normalization
     ↓
Identify Indexes
     ↓
ER Diagram
     ↓
Migration
```

Do not create the first migration before the schema has been reviewed.

---

# 12. Current Database Status

- [x] PostgreSQL selected
- [x] Core domains identified
- [x] Initial entities identified
- [ ] ER diagram finalized
- [ ] Exact columns finalized
- [ ] Relationships finalized
- [ ] Primary keys finalized
- [ ] Foreign keys finalized
- [ ] Constraints finalized
- [ ] Indexes finalized
- [ ] Database library / ORM selected
- [ ] Initial migration created
- [ ] Seed data created
- [ ] Database tested with backend
