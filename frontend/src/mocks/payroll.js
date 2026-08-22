import { db, persist } from "./db.js";
import { badRequest, delay, forbidden, notFound, paginate, unauthorized } from "./utils.js";
import { isAdminRole } from "../utils/constants.js";

function currentSession() {
  const userId = db.sessionUserId;
  if (!userId) throw unauthorized("You are not signed in.");
  const user = db.users.find((u) => u.id === userId);
  const employee = db.employees.find((e) => e.userId === userId);
  if (!user || !employee) throw unauthorized("You are not signed in.");
  return { user, employee };
}

function toDto(salary) {
  const employee = db.employees.find((e) => e.id === salary.employeeId);
  const net = Number(salary.basicPay) + Number(salary.allowances) - Number(salary.deductions);
  return {
    id: salary.id,
    employeeId: salary.employeeId,
    employee: employee
      ? { id: employee.id, fullName: employee.fullName, employeeCode: employee.employeeCode, department: employee.department }
      : null,
    basicPay: Number(salary.basicPay),
    allowances: Number(salary.allowances),
    deductions: Number(salary.deductions),
    netPay: net,
    currency: salary.currency,
    updatedAt: salary.updatedAt,
    // No payslip history exists in the schema (see docs/DECISIONS.md) — this
    // is always "the current period" rather than a specific past period.
    payPeriod: currentPayPeriodLabel(),
    paymentStatus: net > 0 ? "paid" : "pending",
  };
}

function currentPayPeriodLabel() {
  return new Intl.DateTimeFormat("en-IN", { month: "long", year: "numeric" }).format(new Date());
}

export const mockPayrollApi = {
  async getMine() {
    await delay();
    const { employee } = currentSession();
    const salary = db.salaries.find((s) => s.employeeId === employee.id);
    if (!salary) throw notFound("Payroll information not found.");
    return toDto(salary);
  },

  async list({ page, limit } = {}) {
    await delay();
    const { user } = currentSession();
    if (!isAdminRole(user.role)) throw forbidden("Only Admin/HR can view payroll for all employees.");
    const results = db.salaries
      .map(toDto)
      .sort((a, b) => (a.employee?.fullName || "").localeCompare(b.employee?.fullName || ""));
    return paginate(results, { page, limit });
  },

  async getById(employeeId) {
    await delay();
    const { user } = currentSession();
    if (!isAdminRole(user.role)) throw forbidden("Only Admin/HR can view payroll for other employees.");
    const salary = db.salaries.find((s) => s.employeeId === employeeId);
    if (!salary) throw notFound("Payroll information not found.");
    return toDto(salary);
  },

  async update(employeeId, payload) {
    await delay();
    const { user } = currentSession();
    if (!isAdminRole(user.role)) throw forbidden("Only Admin/HR can update payroll.");
    const salary = db.salaries.find((s) => s.employeeId === employeeId);
    if (!salary) throw notFound("Payroll record not found.");
    for (const field of ["basicPay", "allowances", "deductions"]) {
      if (payload[field] !== undefined && (Number.isNaN(Number(payload[field])) || Number(payload[field]) < 0)) {
        throw badRequest("Salary values must be zero or greater.", { [field]: "Must be zero or greater." });
      }
    }
    Object.assign(salary, payload, { updatedBy: user.id, updatedAt: new Date().toISOString() });
    persist();
    return toDto(salary);
  },
};
