# Dayflow - Project Context

## 1. Project Overview

### Project Name

Dayflow

### Project Type

Human Resource Management System (HRMS)

### Problem Statement

Dayflow is an HRMS designed to digitize and streamline employee and HR workflows in a single platform.

The system centralizes employee information, attendance, leave management, payroll/salary information, and related HR operations while providing different access levels for Employees and Admin/HR users.

The goal is to reduce manual HR processes and provide a clear, secure, and easy-to-use system for managing employee information and day-to-day HR activities.

---

## 2. Target Users

| User | Description | Main Responsibilities |
|---|---|---|
| Employee | Employee using the HRMS | Manage/view profile, attendance, leave requests, and payroll/salary information |
| Admin / HR Officer | HR or administrative user | Manage employees, view attendance, manage leave requests, and manage payroll/salary information |

---

## 3. Core Features

### Authentication
- Sign Up
- Sign In
- Email verification
- Password validation
- Role-based access
- Secure password handling

### Employee Profile
- Personal information
- Contact information
- Address
- Job information
- Salary information
- Profile picture
- Employee documents

### Employee Management
- View employees
- View employee details
- Manage employee information

### Attendance
- Check in
- Check out
- Daily attendance
- Weekly attendance
- Attendance history
- Present
- Absent
- Half-day
- Leave

### Leave Management
- Create leave request
- Paid leave
- Sick leave
- Unpaid leave
- Pending
- Approved
- Rejected
- Admin/HR approval and rejection

### Payroll
- Employee salary/payroll visibility
- Admin/HR payroll access
- Salary structure management

---

## 4. User Flows

### Employee

Sign Up
→ Email Verification
→ Sign In
→ Employee Dashboard
→ Profile / Attendance / Leave / Payroll

### Admin / HR

Sign In
→ Admin/HR Dashboard
→ Employees / Attendance / Leave / Payroll

---

## 5. Roles & Permissions

| Capability | Employee | Admin / HR |
|---|---:|---:|
| Sign In | Yes | Yes |
| View own profile | Yes | Yes |
| Manage own profile | Yes | Yes |
| Check in/out | Yes | Not specified |
| View own attendance | Yes | Yes |
| View all attendance | No | Yes |
| Submit leave | Yes | Not specified |
| Approve/reject leave | No | Yes |
| View own payroll | Yes | Yes |
| Manage salary structure | No | Yes |
| View employees | No | Yes |
| Manage employee information | Limited | Yes |

---

## 6. Team Members

| Name | Contact | Primary Role |
|---|---|---|
| A. D. Suriya | TODO | Database + Backend |
| Pratyush | TODO | Full Stack |
| Vikass | TODO | Presenter, Error Finder |
| Gokul | TODO | Frontend |

---

## 7. Feature Ownership

| Feature / Area | Primary Owner | Backup | Status |
|---|---|---|---|
| Database Architecture | A. D. Suriya | Pratyush | Not started |
| PostgreSQL Schema | A. D. Suriya | Pratyush | Not started |
| Database Migrations | A. D. Suriya | Pratyush | Not started |
| Backend Architecture | A. D. Suriya | Pratyush | Not started |
| Backend APIs | A. D. Suriya | Pratyush | Not started |
| Business Logic | A. D. Suriya | Pratyush | Not started |
| Frontend Architecture | Gokul | Pratyush | Not started |
| UI/UX | Gokul | Pratyush | Not started |
| Frontend/API Integration | Pratyush | Gokul | Not started |
| Full-Stack Integration | Pratyush | A. D. Suriya | Not started |
| Input Validation | Vikass | A. D. Suriya | Not started |
| Error Handling | Vikass | Pratyush | Not started |
| Testing & Debugging | Vikass | Entire Team | Not started |

---

## 8. Current Status

### Planning

- [x] Requirements reviewed
- [x] Problem identified
- [x] Target users identified
- [x] Core features identified
- [x] Team responsibilities assigned
- [ ] MVP finalized
- [ ] Architecture finalized
- [ ] Database designed
- [ ] API designed

### Development

- [ ] Backend initialized
- [ ] Database initialized
- [ ] Frontend initialized
- [ ] Authentication
- [ ] Employee management
- [ ] Attendance
- [ ] Leave management
- [ ] Payroll
- [ ] Integration
- [ ] Testing
- [ ] Deployment

---

## 9. Known Issues

No known issues yet.

Issues should be added here as they are discovered.

Format:

### [YYYY-MM-DD] Issue Title

**Problem:**
Describe the issue.

**Impact:**
Describe what is affected.

**Owner:**
Team member responsible.

**Status:**
Open / In Progress / Resolved

---

## 10. Project Principles

- Build according to the actual problem.
- Keep the architecture simple and understandable.
- Use PostgreSQL for relational data.
- Validate input on the backend.
- Enforce authorization on the backend.
- Protect employee and salary information.
- Handle errors gracefully.
- Use Git collaboratively.
- Understand AI-generated code before merging it.
- Avoid unnecessary third-party dependencies.
- Prioritize a reliable MVP over unnecessary features.
- Document significant technical decisions.

---

## 11. Related Documentation

| Document | Purpose |
|---|---|
| `docs/ARCHITECTURE.md` | System architecture and technical structure |
| `docs/DATABASE.md` | Database design, schema and relationships |
| `docs/API.md` | Backend API endpoints |
| `docs/DECISIONS.md` | Significant technical decisions |