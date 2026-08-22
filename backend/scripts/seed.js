// Idempotent development seed. Replaces the placeholder password hashes in
// database/seeds/0001_seed_dev_data.sql (see the comment at the top of that
// file) with real bcrypt hashes of the documented demo password, using the
// same fixed UUIDs so this can be re-run safely — every INSERT here is
// guarded by ON CONFLICT / NOT EXISTS.
//
// Never run against production; this is dev-only seed data.
import pg from "pg";
import { config } from "../src/config/index.js";
import { hashPassword } from "../src/utils/password.js";

const DEMO_PASSWORD = "Password123";

const USERS = [
  { id: "10000000-0000-0000-0000-000000000001", email: "admin@dayflow.dev", role: "admin" },
  { id: "10000000-0000-0000-0000-000000000002", email: "hr@dayflow.dev", role: "hr" },
  { id: "10000000-0000-0000-0000-000000000003", email: "alice@dayflow.dev", role: "employee" },
  { id: "10000000-0000-0000-0000-000000000004", email: "bob@dayflow.dev", role: "employee" },
  { id: "10000000-0000-0000-0000-000000000005", email: "carol@dayflow.dev", role: "employee" },
];

const EMPLOYEES = [
  {
    id: "20000000-0000-0000-0000-000000000001",
    userId: "10000000-0000-0000-0000-000000000001",
    employeeCode: "EMP0001",
    fullName: "Ada Admin",
    phone: "+91-9000000001",
    address: "Bengaluru, India",
    jobTitle: "Administrator",
    department: "Operations",
    dateJoined: "2024-01-10",
  },
  {
    id: "20000000-0000-0000-0000-000000000002",
    userId: "10000000-0000-0000-0000-000000000002",
    employeeCode: "EMP0002",
    fullName: "Helen Ross",
    phone: "+91-9000000002",
    address: "Bengaluru, India",
    jobTitle: "HR Officer",
    department: "Human Resources",
    dateJoined: "2024-02-15",
  },
  {
    id: "20000000-0000-0000-0000-000000000003",
    userId: "10000000-0000-0000-0000-000000000003",
    employeeCode: "EMP0003",
    fullName: "Alice Kumar",
    phone: "+91-9000000003",
    address: "Chennai, India",
    jobTitle: "Software Engineer",
    department: "Engineering",
    dateJoined: "2024-03-01",
  },
  {
    id: "20000000-0000-0000-0000-000000000004",
    userId: "10000000-0000-0000-0000-000000000004",
    employeeCode: "EMP0004",
    fullName: "Bob Nair",
    phone: "+91-9000000004",
    address: "Chennai, India",
    jobTitle: "Software Engineer",
    department: "Engineering",
    dateJoined: "2024-04-20",
  },
  {
    id: "20000000-0000-0000-0000-000000000005",
    userId: "10000000-0000-0000-0000-000000000005",
    employeeCode: "EMP0005",
    fullName: "Carol D'Souza",
    phone: "+91-9000000005",
    address: "Pune, India",
    jobTitle: "QA Engineer",
    department: "Engineering",
    dateJoined: "2024-06-05",
  },
];

const SALARIES = [
  { employeeId: "20000000-0000-0000-0000-000000000001", basicPay: 90000, allowances: 10000, deductions: 5000 },
  { employeeId: "20000000-0000-0000-0000-000000000002", basicPay: 70000, allowances: 8000, deductions: 4000 },
  { employeeId: "20000000-0000-0000-0000-000000000003", basicPay: 60000, allowances: 5000, deductions: 3000 },
  { employeeId: "20000000-0000-0000-0000-000000000004", basicPay: 58000, allowances: 5000, deductions: 3000 },
  { employeeId: "20000000-0000-0000-0000-000000000005", basicPay: 52000, allowances: 4000, deductions: 2500 },
];

async function main() {
  const client = new pg.Client(config.db);
  await client.connect();
  try {
    const passwordHash = await hashPassword(DEMO_PASSWORD);

    for (const u of USERS) {
      await client.query(
        `INSERT INTO users (id, email, password_hash, role, email_verified_at)
         VALUES ($1, $2, $3, $4, now())
         ON CONFLICT (id) DO NOTHING`,
        [u.id, u.email, passwordHash, u.role]
      );
    }

    for (const e of EMPLOYEES) {
      await client.query(
        `INSERT INTO employees (id, user_id, employee_code, full_name, phone, address, job_title, department, date_joined)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         ON CONFLICT (id) DO NOTHING`,
        [e.id, e.userId, e.employeeCode, e.fullName, e.phone, e.address, e.jobTitle, e.department, e.dateJoined]
      );
    }

    for (const s of SALARIES) {
      await client.query(
        `INSERT INTO employee_salary (employee_id, basic_pay, allowances, deductions, currency, updated_by)
         VALUES ($1, $2, $3, $4, 'INR', $5)
         ON CONFLICT (employee_id) DO NOTHING`,
        [s.employeeId, s.basicPay, s.allowances, s.deductions, "10000000-0000-0000-0000-000000000001"]
      );
    }

    const ALICE = "20000000-0000-0000-0000-000000000003";
    const BOB = "20000000-0000-0000-0000-000000000004";
    const CAROL = "20000000-0000-0000-0000-000000000005";

    await client.query(
      `INSERT INTO attendance (employee_id, attendance_date, check_in_at, check_out_at, status) VALUES
         ($1, CURRENT_DATE - 1, (CURRENT_DATE - 1) + TIME '09:02', (CURRENT_DATE - 1) + TIME '18:05', 'present'),
         ($1, CURRENT_DATE, CURRENT_DATE + TIME '09:10', NULL, 'present'),
         ($2, CURRENT_DATE - 1, (CURRENT_DATE - 1) + TIME '09:00', (CURRENT_DATE - 1) + TIME '13:00', 'half_day'),
         ($2, CURRENT_DATE, NULL, NULL, 'absent'),
         ($3, CURRENT_DATE - 1, NULL, NULL, 'leave')
       ON CONFLICT (employee_id, attendance_date) DO NOTHING`,
      [ALICE, BOB, CAROL]
    );

    const HR = "20000000-0000-0000-0000-000000000002";

    await client.query(
      `INSERT INTO employee_documents (employee_id, file_name, file_type, file_size_bytes, storage_path, uploaded_by)
       SELECT $1, $2, $3, $4, $5, $6
       WHERE NOT EXISTS (
         SELECT 1 FROM employee_documents WHERE employee_id = $1 AND file_name = $2
       )`,
      [ALICE, "Offer Letter.pdf", "application/pdf", 182400, "/uploads/alice/offer-letter.pdf", "10000000-0000-0000-0000-000000000002"]
    );

    const leaveSeeds = [
      { employeeId: CAROL, leaveType: "sick", start: "CURRENT_DATE - 1", end: "CURRENT_DATE - 1", remarks: "Fever", status: "approved", reviewedBy: HR, comment: "Approved, get well soon" },
      { employeeId: BOB, leaveType: "paid", start: "CURRENT_DATE + 5", end: "CURRENT_DATE + 7", remarks: "Family function", status: "pending", reviewedBy: null, comment: null },
      { employeeId: ALICE, leaveType: "unpaid", start: "CURRENT_DATE + 10", end: "CURRENT_DATE + 10", remarks: "Personal", status: "rejected", reviewedBy: HR, comment: "Insufficient notice period" },
    ];
    for (const l of leaveSeeds) {
      await client.query(
        `INSERT INTO leave_requests (employee_id, leave_type, start_date, end_date, remarks, status, reviewed_by, reviewer_comment, reviewed_at)
         SELECT $1, $2::leave_type, ${l.start}, ${l.end}, $3, $4::leave_status, $5, $6, CASE WHEN $5::uuid IS NULL THEN NULL ELSE now() END
         WHERE NOT EXISTS (
           SELECT 1 FROM leave_requests
           WHERE employee_id = $1 AND leave_type = $2::leave_type AND start_date = ${l.start} AND end_date = ${l.end}
         )`,
        [l.employeeId, l.leaveType, l.remarks, l.status, l.reviewedBy, l.comment]
      );
    }

    console.log("Seed complete. Demo accounts (password: Password123):");
    for (const u of USERS) console.log(`  ${u.email} (${u.role})`);
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
