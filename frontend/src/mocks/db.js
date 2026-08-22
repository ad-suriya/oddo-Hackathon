// In-memory mock database. Mirrors the Postgres schema in docs/DATABASE.md
// (camelCase instead of snake_case) so swapping the mock layer for real API
// calls later requires no shape changes elsewhere in the app.
//
// State persists to localStorage purely so a demo survives a page refresh —
// this is a convenience for the mock, not an architectural dependency; every
// read/write still goes through mocks/*.js behind the services/ abstraction.
import { isoDaysAgo, isoDaysFromNow, makeId } from "./utils.js";

const STORAGE_KEY = "dayflow_mock_db_v1";
const DEMO_PASSWORD = "Password123";

function seedUsers() {
  return [
    { id: "u-admin", email: "admin@dayflow.dev", password: DEMO_PASSWORD, role: "admin", emailVerifiedAt: iso(0) },
    { id: "u-hr", email: "hr@dayflow.dev", password: DEMO_PASSWORD, role: "hr", emailVerifiedAt: iso(0) },
    { id: "u-alice", email: "alice@dayflow.dev", password: DEMO_PASSWORD, role: "employee", emailVerifiedAt: iso(0) },
    { id: "u-bob", email: "bob@dayflow.dev", password: DEMO_PASSWORD, role: "employee", emailVerifiedAt: iso(0) },
    { id: "u-carol", email: "carol@dayflow.dev", password: DEMO_PASSWORD, role: "employee", emailVerifiedAt: iso(0) },
  ];
}

function seedEmployees() {
  return [
    {
      id: "e-admin",
      userId: "u-admin",
      employeeCode: "EMP0001",
      fullName: "Ada Admin",
      phone: "+91-9000000001",
      address: "Bengaluru, India",
      jobTitle: "Administrator",
      department: "Operations",
      dateJoined: "2024-01-10",
      profilePictureUrl: null,
    },
    {
      id: "e-hr",
      userId: "u-hr",
      employeeCode: "EMP0002",
      fullName: "Helen Ross",
      phone: "+91-9000000002",
      address: "Bengaluru, India",
      jobTitle: "HR Officer",
      department: "Human Resources",
      dateJoined: "2024-02-15",
      profilePictureUrl: null,
    },
    {
      id: "e-alice",
      userId: "u-alice",
      employeeCode: "EMP0003",
      fullName: "Alice Kumar",
      phone: "+91-9000000003",
      address: "Chennai, India",
      jobTitle: "Software Engineer",
      department: "Engineering",
      dateJoined: "2024-03-01",
      profilePictureUrl: null,
    },
    {
      id: "e-bob",
      userId: "u-bob",
      employeeCode: "EMP0004",
      fullName: "Bob Nair",
      phone: "+91-9000000004",
      address: "Chennai, India",
      jobTitle: "Software Engineer",
      department: "Engineering",
      dateJoined: "2024-04-20",
      profilePictureUrl: null,
    },
    {
      id: "e-carol",
      userId: "u-carol",
      employeeCode: "EMP0005",
      fullName: "Carol D'Souza",
      phone: "+91-9000000005",
      address: "Pune, India",
      jobTitle: "QA Engineer",
      department: "Engineering",
      dateJoined: "2024-06-05",
      profilePictureUrl: null,
    },
  ];
}

function iso(daysAgo) {
  return new Date(Date.now() - daysAgo * 86400000).toISOString();
}

function seedAttendance() {
  const rows = [];
  const employeeIds = ["e-alice", "e-bob", "e-carol", "e-hr", "e-admin"];
  for (const employeeId of employeeIds) {
    for (let daysAgo = 9; daysAgo >= 1; daysAgo -= 1) {
      const date = isoDaysAgo(daysAgo);
      const roll = Math.random();
      let status = "present";
      let checkInAt = `${date}T09:${String(Math.floor(Math.random() * 20)).padStart(2, "0")}:00.000Z`;
      let checkOutAt = `${date}T18:${String(Math.floor(Math.random() * 30)).padStart(2, "0")}:00.000Z`;
      if (roll < 0.08) {
        status = "absent";
        checkInAt = null;
        checkOutAt = null;
      } else if (roll < 0.16) {
        status = "half_day";
        checkOutAt = `${date}T13:15:00.000Z`;
      } else if (roll < 0.22) {
        status = "leave";
        checkInAt = null;
        checkOutAt = null;
      }
      rows.push({
        id: makeId(),
        employeeId,
        attendanceDate: date,
        checkInAt,
        checkOutAt,
        status,
      });
    }
  }
  // Today: Alice already checked in, everyone else not yet marked.
  rows.push({
    id: makeId(),
    employeeId: "e-alice",
    attendanceDate: isoDaysAgo(0),
    checkInAt: `${isoDaysAgo(0)}T09:07:00.000Z`,
    checkOutAt: null,
    status: "present",
  });
  return rows;
}

function seedLeaveRequests() {
  return [
    {
      id: makeId(),
      employeeId: "e-carol",
      leaveType: "sick",
      startDate: isoDaysAgo(6),
      endDate: isoDaysAgo(6),
      remarks: "Fever",
      status: "approved",
      reviewedBy: "e-hr",
      reviewerComment: "Approved, get well soon.",
      reviewedAt: iso(5),
      createdAt: iso(6),
    },
    {
      id: makeId(),
      employeeId: "e-bob",
      leaveType: "paid",
      startDate: isoDaysFromNow(5),
      endDate: isoDaysFromNow(7),
      remarks: "Family function",
      status: "pending",
      reviewedBy: null,
      reviewerComment: null,
      reviewedAt: null,
      createdAt: iso(1),
    },
    {
      id: makeId(),
      employeeId: "e-alice",
      leaveType: "unpaid",
      startDate: isoDaysFromNow(10),
      endDate: isoDaysFromNow(10),
      remarks: "Personal",
      status: "rejected",
      reviewedBy: "e-hr",
      reviewerComment: "Insufficient notice period.",
      reviewedAt: iso(0),
      createdAt: iso(2),
    },
    {
      id: makeId(),
      employeeId: "e-alice",
      leaveType: "paid",
      startDate: isoDaysFromNow(20),
      endDate: isoDaysFromNow(22),
      remarks: "Sister's wedding",
      status: "pending",
      reviewedBy: null,
      reviewerComment: null,
      reviewedAt: null,
      createdAt: iso(0),
    },
  ];
}

function seedSalaries() {
  return [
    { id: makeId(), employeeId: "e-admin", basicPay: 90000, allowances: 10000, deductions: 5000, currency: "INR", updatedBy: "u-admin", updatedAt: iso(30) },
    { id: makeId(), employeeId: "e-hr", basicPay: 70000, allowances: 8000, deductions: 4000, currency: "INR", updatedBy: "u-admin", updatedAt: iso(30) },
    { id: makeId(), employeeId: "e-alice", basicPay: 60000, allowances: 5000, deductions: 3000, currency: "INR", updatedBy: "u-hr", updatedAt: iso(20) },
    { id: makeId(), employeeId: "e-bob", basicPay: 58000, allowances: 5000, deductions: 3000, currency: "INR", updatedBy: "u-hr", updatedAt: iso(20) },
    { id: makeId(), employeeId: "e-carol", basicPay: 52000, allowances: 4000, deductions: 2500, currency: "INR", updatedBy: "u-hr", updatedAt: iso(20) },
  ];
}

function seedDocuments() {
  return [
    { id: makeId(), employeeId: "e-alice", fileName: "Offer Letter.pdf", fileType: "application/pdf", fileSizeBytes: 182_400, storagePath: "/uploads/e-alice/offer-letter.pdf", uploadedBy: "u-hr", createdAt: iso(150) },
    { id: makeId(), employeeId: "e-alice", fileName: "PAN Card.jpg", fileType: "image/jpeg", fileSizeBytes: 94_200, storagePath: "/uploads/e-alice/pan-card.jpg", uploadedBy: "u-alice", createdAt: iso(140) },
    { id: makeId(), employeeId: "e-bob", fileName: "Offer Letter.pdf", fileType: "application/pdf", fileSizeBytes: 179_800, storagePath: "/uploads/e-bob/offer-letter.pdf", uploadedBy: "u-hr", createdAt: iso(110) },
    { id: makeId(), employeeId: "e-carol", fileName: "Offer Letter.pdf", fileType: "application/pdf", fileSizeBytes: 180_900, storagePath: "/uploads/e-carol/offer-letter.pdf", uploadedBy: "u-hr", createdAt: iso(75) },
    { id: makeId(), employeeId: "e-carol", fileName: "Relieving Letter - Previous Employer.pdf", fileType: "application/pdf", fileSizeBytes: 211_050, storagePath: "/uploads/e-carol/relieving-letter.pdf", uploadedBy: "u-carol", createdAt: iso(70) },
  ];
}

function freshState() {
  return {
    users: seedUsers(),
    employees: seedEmployees(),
    attendance: seedAttendance(),
    leaveRequests: seedLeaveRequests(),
    salaries: seedSalaries(),
    documents: seedDocuments(),
    sessionUserId: null,
  };
}

function loadState() {
  if (typeof window === "undefined") return freshState();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return freshState();
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.users)) return freshState();
    return parsed;
  } catch {
    return freshState();
  }
}

const state = loadState();

export function persist() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // storage unavailable (private mode, quota) — mock still works in-memory
  }
}

export function resetMockDb() {
  Object.assign(state, freshState());
  persist();
}

export const db = state;
export { DEMO_PASSWORD };
