import { toIsoString } from "./dateHelpers.js";

// payPeriod / paymentStatus are frontend-contract fields with no backing
// column (see docs/DECISIONS.md and docs/FRONTEND_HANDOFF.md "Known gaps").
// employee_salary is a current-snapshot-only table (no payslip history), so
// this always describes "the current period" rather than a specific past
// one — replicated from the mock's mocks/payroll.js on purpose.
function currentPayPeriodLabel() {
  return new Intl.DateTimeFormat("en-IN", { month: "long", year: "numeric" }).format(new Date());
}

export function serializePayroll(row) {
  const basicPay = Number(row.basic_pay);
  const allowances = Number(row.allowances);
  const deductions = Number(row.deductions);
  const netPay = basicPay + allowances - deductions;

  return {
    id: row.id,
    employeeId: row.employee_id,
    employee: row.emp_id
      ? {
          id: row.emp_id,
          fullName: row.emp_full_name,
          employeeCode: row.emp_employee_code,
          department: row.emp_department,
        }
      : null,
    basicPay,
    allowances,
    deductions,
    netPay,
    currency: row.currency,
    updatedAt: toIsoString(row.updated_at),
    payPeriod: currentPayPeriodLabel(),
    paymentStatus: netPay > 0 ? "paid" : "pending",
  };
}
