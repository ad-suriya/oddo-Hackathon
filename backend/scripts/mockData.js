// Populates the live database with a realistic-looking mock dataset for
// demos: a proper department roster, attendance history, leave requests in
// varied states, payroll, and a couple of documents. Idempotent — safe to
// re-run.
//
// Also sweeps the junk accounts left behind by `npm test` runs and manual
// smoke-testing (identifiable by the @dayflow.test domain and one
// @dayflow.dev throwaway) — those aren't "mock data", they're test litter.
//
// Never run against production; this is dev/demo-only.
import pg from "pg";
import { config } from "../src/config/index.js";
import { hashPassword } from "../src/utils/password.js";

const DEMO_PASSWORD = "Password123";
const ADMIN_ID = "10000000-0000-0000-0000-000000000001"; // users.id — for updated_by/uploaded_by
const HR_ID = "10000000-0000-0000-0000-000000000002"; // users.id — for updated_by/uploaded_by
const ADMIN_EMPLOYEE_ID = "20000000-0000-0000-0000-000000000001"; // employees.id — for leave_requests.reviewed_by
const HR_EMPLOYEE_ID = "20000000-0000-0000-0000-000000000002"; // employees.id — for leave_requests.reviewed_by

const EMPLOYEES = [
  { id: "30000000-0000-0000-0000-000000000001", userId: "31000000-0000-0000-0000-000000000001", email: "rohan.verma@dayflow.dev", employeeCode: "EMP0006", fullName: "Rohan Verma", phone: "+91-9123450001", address: "Bengaluru, India", jobTitle: "Product Manager", department: "Product", dateJoined: "2024-05-12", basicPay: 82000, allowances: 9000, deductions: 4200 },
  { id: "30000000-0000-0000-0000-000000000002", userId: "31000000-0000-0000-0000-000000000002", email: "ananya.iyer@dayflow.dev", employeeCode: "EMP0007", fullName: "Ananya Iyer", phone: "+91-9123450002", address: "Bengaluru, India", jobTitle: "UI/UX Designer", department: "Design", dateJoined: "2024-06-03", basicPay: 61000, allowances: 5500, deductions: 3000 },
  { id: "30000000-0000-0000-0000-000000000003", userId: "31000000-0000-0000-0000-000000000003", email: "karan.mehta@dayflow.dev", employeeCode: "EMP0008", fullName: "Karan Mehta", phone: "+91-9123450003", address: "Chennai, India", jobTitle: "Backend Engineer", department: "Engineering", dateJoined: "2024-07-15", basicPay: 64000, allowances: 5000, deductions: 3200 },
  { id: "30000000-0000-0000-0000-000000000004", userId: "31000000-0000-0000-0000-000000000004", email: "sneha.reddy@dayflow.dev", employeeCode: "EMP0009", fullName: "Sneha Reddy", phone: "+91-9123450004", address: "Hyderabad, India", jobTitle: "Frontend Engineer", department: "Engineering", dateJoined: "2024-08-01", basicPay: 60000, allowances: 5000, deductions: 3000 },
  { id: "30000000-0000-0000-0000-000000000005", userId: "31000000-0000-0000-0000-000000000005", email: "arjun.nair@dayflow.dev", employeeCode: "EMP0010", fullName: "Arjun Nair", phone: "+91-9123450005", address: "Pune, India", jobTitle: "DevOps Engineer", department: "Engineering", dateJoined: "2024-03-22", basicPay: 70000, allowances: 6000, deductions: 3500 },
  { id: "30000000-0000-0000-0000-000000000006", userId: "31000000-0000-0000-0000-000000000006", email: "divya.krishnan@dayflow.dev", employeeCode: "EMP0011", fullName: "Divya Krishnan", phone: "+91-9123450006", address: "Chennai, India", jobTitle: "QA Engineer", department: "Engineering", dateJoined: "2024-09-10", basicPay: 55000, allowances: 4500, deductions: 2800 },
  { id: "30000000-0000-0000-0000-000000000007", userId: "31000000-0000-0000-0000-000000000007", email: "vikram.singh@dayflow.dev", employeeCode: "EMP0012", fullName: "Vikram Singh", phone: "+91-9123450007", address: "Mumbai, India", jobTitle: "Sales Executive", department: "Sales", dateJoined: "2024-02-18", basicPay: 52000, allowances: 8000, deductions: 2600 },
  { id: "30000000-0000-0000-0000-000000000008", userId: "31000000-0000-0000-0000-000000000008", email: "neha.gupta@dayflow.dev", employeeCode: "EMP0013", fullName: "Neha Gupta", phone: "+91-9123450008", address: "Bengaluru, India", jobTitle: "Marketing Manager", department: "Marketing", dateJoined: "2024-04-08", basicPay: 68000, allowances: 6000, deductions: 3400 },
  { id: "30000000-0000-0000-0000-000000000009", userId: "31000000-0000-0000-0000-000000000009", email: "aditya.rao@dayflow.dev", employeeCode: "EMP0014", fullName: "Aditya Rao", phone: "+91-9123450009", address: "Mumbai, India", jobTitle: "Finance Analyst", department: "Finance", dateJoined: "2024-01-29", basicPay: 58000, allowances: 5000, deductions: 2900 },
  { id: "30000000-0000-0000-0000-000000000010", userId: "31000000-0000-0000-0000-000000000010", email: "meera.pillai@dayflow.dev", employeeCode: "EMP0015", fullName: "Meera Pillai", phone: "+91-9123450010", address: "Bengaluru, India", jobTitle: "HR Executive", department: "Human Resources", dateJoined: "2024-05-27", basicPay: 50000, allowances: 4000, deductions: 2500 },
  { id: "30000000-0000-0000-0000-000000000011", userId: "31000000-0000-0000-0000-000000000011", email: "rahul.kapoor@dayflow.dev", employeeCode: "EMP0016", fullName: "Rahul Kapoor", phone: "+91-9123450011", address: "Delhi, India", jobTitle: "Customer Success Manager", department: "Customer Success", dateJoined: "2024-06-19", basicPay: 56000, allowances: 5000, deductions: 2800 },
  { id: "30000000-0000-0000-0000-000000000012", userId: "31000000-0000-0000-0000-000000000012", email: "ishita.bose@dayflow.dev", employeeCode: "EMP0017", fullName: "Ishita Bose", phone: "+91-9123450012", address: "Bengaluru, India", jobTitle: "Data Analyst", department: "Engineering", dateJoined: "2024-08-14", basicPay: 59000, allowances: 4800, deductions: 2900 },
];

const ATTENDANCE_STATUSES = ["present", "present", "present", "present", "half_day", "absent", "leave"];

function weekdaysAgo(n) {
  const dates = [];
  const d = new Date();
  while (dates.length < n) {
    d.setDate(d.getDate() - 1);
    const day = d.getDay();
    if (day !== 0 && day !== 6) dates.push(new Date(d));
  }
  return dates;
}

async function main() {
  const client = new pg.Client(config.db);
  await client.connect();
  try {
    console.log("Sweeping test-generated accounts (@dayflow.test, testuser@dayflow.dev)...");
    const { rowCount } = await client.query(
      `DELETE FROM users WHERE email LIKE '%@dayflow.test' OR email = 'testuser@dayflow.dev'`
    );
    console.log(`  removed ${rowCount} test account(s) (cascades to their employee/attendance/leave/salary/session rows).`);

    const passwordHash = await hashPassword(DEMO_PASSWORD);

    console.log(`Seeding ${EMPLOYEES.length} mock employees...`);
    for (const e of EMPLOYEES) {
      await client.query(
        `INSERT INTO users (id, email, password_hash, role, email_verified_at)
         VALUES ($1, $2, $3, 'employee', now())
         ON CONFLICT (id) DO NOTHING`,
        [e.userId, e.email, passwordHash]
      );
      await client.query(
        `INSERT INTO employees (id, user_id, employee_code, full_name, phone, address, job_title, department, date_joined)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         ON CONFLICT (id) DO NOTHING`,
        [e.id, e.userId, e.employeeCode, e.fullName, e.phone, e.address, e.jobTitle, e.department, e.dateJoined]
      );
      await client.query(
        `INSERT INTO employee_salary (employee_id, basic_pay, allowances, deductions, currency, updated_by)
         VALUES ($1, $2, $3, $4, 'INR', $5)
         ON CONFLICT (employee_id) DO UPDATE SET
           basic_pay = EXCLUDED.basic_pay, allowances = EXCLUDED.allowances, deductions = EXCLUDED.deductions`,
        [e.id, e.basicPay, e.allowances, e.deductions, ADMIN_ID]
      );
    }

    console.log("Giving the current test-drive account (Priya Sharma) a real profile...");
    await client.query(
      `UPDATE employees
       SET job_title = 'Product Designer', department = 'Design',
           phone = COALESCE(NULLIF(phone, ''), '+91-9123459999'),
           address = COALESCE(NULLIF(address, ''), 'Bengaluru, India')
       WHERE employee_code = 'EMPRESTYLE1'`
    );

    console.log("Backfilling 10 weekdays of attendance history...");
    const days = weekdaysAgo(10);
    const allEmployeeIds = [
      "20000000-0000-0000-0000-000000000003", // alice
      "20000000-0000-0000-0000-000000000004", // bob
      "20000000-0000-0000-0000-000000000005", // carol
      ...EMPLOYEES.map((e) => e.id),
    ];
    let attendanceCount = 0;
    for (const employeeId of allEmployeeIds) {
      for (const date of days) {
        const roll = Math.random();
        const status =
          roll < 0.72 ? "present" : roll < 0.84 ? "half_day" : roll < 0.93 ? "leave" : "absent";
        const dateStr = date.toISOString().slice(0, 10);
        const checkIn = status === "absent" || status === "leave" ? null : `${dateStr} ${8 + Math.floor(Math.random() * 2)}:${String(Math.floor(Math.random() * 60)).padStart(2, "0")}:00`;
        const checkOut =
          status === "absent" || status === "leave"
            ? null
            : status === "half_day"
              ? `${dateStr} 13:${String(Math.floor(Math.random() * 60)).padStart(2, "0")}:00`
              : `${dateStr} ${17 + Math.floor(Math.random() * 3)}:${String(Math.floor(Math.random() * 60)).padStart(2, "0")}:00`;
        const { rowCount: inserted } = await client.query(
          `INSERT INTO attendance (employee_id, attendance_date, check_in_at, check_out_at, status)
           VALUES ($1, $2, $3, $4, $5)
           ON CONFLICT (employee_id, attendance_date) DO NOTHING`,
          [employeeId, dateStr, checkIn, checkOut, status]
        );
        attendanceCount += inserted;
      }
    }
    console.log(`  inserted ${attendanceCount} attendance row(s) (existing days left untouched).`);

    console.log("Seeding a spread of leave requests...");
    const leaveSeeds = [
      { employeeId: "30000000-0000-0000-0000-000000000001", leaveType: "paid", start: "CURRENT_DATE + 3", end: "CURRENT_DATE + 5", remarks: "Family wedding", status: "pending", reviewedBy: null, comment: null },
      { employeeId: "30000000-0000-0000-0000-000000000002", leaveType: "sick", start: "CURRENT_DATE - 2", end: "CURRENT_DATE - 1", remarks: "Flu", status: "approved", reviewedBy: HR_EMPLOYEE_ID, comment: "Get well soon." },
      { employeeId: "30000000-0000-0000-0000-000000000003", leaveType: "unpaid", start: "CURRENT_DATE + 15", end: "CURRENT_DATE + 16", remarks: "Personal travel", status: "pending", reviewedBy: null, comment: null },
      { employeeId: "30000000-0000-0000-0000-000000000004", leaveType: "paid", start: "CURRENT_DATE - 10", end: "CURRENT_DATE - 8", remarks: "Vacation", status: "approved", reviewedBy: HR_EMPLOYEE_ID, comment: "Enjoy the trip." },
      { employeeId: "30000000-0000-0000-0000-000000000005", leaveType: "sick", start: "CURRENT_DATE - 5", end: "CURRENT_DATE - 5", remarks: "Medical appointment", status: "rejected", reviewedBy: HR_EMPLOYEE_ID, comment: "Please provide advance notice next time." },
      { employeeId: "30000000-0000-0000-0000-000000000006", leaveType: "paid", start: "CURRENT_DATE + 20", end: "CURRENT_DATE + 22", remarks: "Sister's wedding", status: "pending", reviewedBy: null, comment: null },
      { employeeId: "30000000-0000-0000-0000-000000000007", leaveType: "unpaid", start: "CURRENT_DATE + 1", end: "CURRENT_DATE + 1", remarks: "Bank work", status: "pending", reviewedBy: null, comment: null },
      { employeeId: "30000000-0000-0000-0000-000000000008", leaveType: "paid", start: "CURRENT_DATE - 20", end: "CURRENT_DATE - 18", remarks: "Diwali travel", status: "approved", reviewedBy: ADMIN_EMPLOYEE_ID, comment: "Approved." },
      { employeeId: "30000000-0000-0000-0000-000000000009", leaveType: "sick", start: "CURRENT_DATE + 2", end: "CURRENT_DATE + 3", remarks: "Dental surgery", status: "pending", reviewedBy: null, comment: null },
      { employeeId: "30000000-0000-0000-0000-000000000010", leaveType: "paid", start: "CURRENT_DATE + 8", end: "CURRENT_DATE + 9", remarks: "Cousin's engagement", status: "pending", reviewedBy: null, comment: null },
      { employeeId: "30000000-0000-0000-0000-000000000011", leaveType: "unpaid", start: "CURRENT_DATE - 15", end: "CURRENT_DATE - 15", remarks: "Moving apartments", status: "approved", reviewedBy: HR_EMPLOYEE_ID, comment: "Noted." },
      { employeeId: "30000000-0000-0000-0000-000000000012", leaveType: "sick", start: "CURRENT_DATE - 1", end: "CURRENT_DATE", remarks: "Migraine", status: "pending", reviewedBy: null, comment: null },
    ];
    let leaveCount = 0;
    for (const l of leaveSeeds) {
      const { rowCount: inserted } = await client.query(
        `INSERT INTO leave_requests (employee_id, leave_type, start_date, end_date, remarks, status, reviewed_by, reviewer_comment, reviewed_at)
         SELECT $1, $2::leave_type, ${l.start}, ${l.end}, $3, $4::leave_status, $5, $6, CASE WHEN $5::uuid IS NULL THEN NULL ELSE now() END
         WHERE NOT EXISTS (
           SELECT 1 FROM leave_requests
           WHERE employee_id = $1 AND leave_type = $2::leave_type AND start_date = ${l.start} AND end_date = ${l.end}
         )`,
        [l.employeeId, l.leaveType, l.remarks, l.status, l.reviewedBy, l.comment]
      );
      leaveCount += inserted;
    }
    console.log(`  inserted ${leaveCount} leave request(s).`);

    console.log("Seeding a couple of documents...");
    const docSeeds = [
      { employeeId: "30000000-0000-0000-0000-000000000001", fileName: "Offer Letter.pdf", fileType: "application/pdf", size: 184200, path: "/uploads/rohan/offer-letter.pdf" },
      { employeeId: "30000000-0000-0000-0000-000000000002", fileName: "Aadhaar Card.jpg", fileType: "image/jpeg", size: 102400, path: "/uploads/ananya/aadhaar.jpg" },
      { employeeId: "30000000-0000-0000-0000-000000000008", fileName: "Offer Letter.pdf", fileType: "application/pdf", size: 181900, path: "/uploads/neha/offer-letter.pdf" },
    ];
    let docCount = 0;
    for (const d of docSeeds) {
      const { rowCount: inserted } = await client.query(
        `INSERT INTO employee_documents (employee_id, file_name, file_type, file_size_bytes, storage_path, uploaded_by)
         SELECT $1, $2, $3, $4, $5, $6
         WHERE NOT EXISTS (SELECT 1 FROM employee_documents WHERE employee_id = $1 AND file_name = $2)`,
        [d.employeeId, d.fileName, d.fileType, d.size, d.path, HR_ID]
      );
      docCount += inserted;
    }
    console.log(`  inserted ${docCount} document(s).`);

    const { rows: countRows } = await client.query("SELECT count(*)::int AS n FROM employees");
    console.log(`\nDone. ${countRows[0].n} employees in the database.`);
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
