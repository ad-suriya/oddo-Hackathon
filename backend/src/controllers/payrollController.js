import { asyncHandler } from "../utils/asyncHandler.js";
import { NotFoundError } from "../utils/errors.js";
import { validateSalaryPayload } from "../validation/payrollValidation.js";
import { serializePayroll } from "../serializers/payrollSerializer.js";
import { findSalaryByEmployeeId, listAllSalaries, upsertSalary } from "../repositories/payrollRepo.js";
import { findEmployeeById } from "../repositories/employeesRepo.js";

export const getMine = asyncHandler(async function getMine(req, res) {
  const salary = await findSalaryByEmployeeId(req.currentEmployee.id);
  if (!salary) throw new NotFoundError("Payroll information not found.");
  res.json(serializePayroll(salary));
});

export const list = asyncHandler(async function list(req, res) {
  const rows = await listAllSalaries();
  res.json(rows.map(serializePayroll));
});

export const update = asyncHandler(async function update(req, res) {
  const { employeeId } = req.params;
  const employee = await findEmployeeById(employeeId);
  if (!employee) throw new NotFoundError("Employee not found.");

  const payload = req.body || {};
  validateSalaryPayload(payload);

  const existing = await findSalaryByEmployeeId(employeeId);
  const merged = {
    basicPay: payload.basicPay !== undefined ? Number(payload.basicPay) : Number(existing?.basic_pay ?? 0),
    allowances: payload.allowances !== undefined ? Number(payload.allowances) : Number(existing?.allowances ?? 0),
    deductions: payload.deductions !== undefined ? Number(payload.deductions) : Number(existing?.deductions ?? 0),
    currency: existing?.currency ?? "INR",
    updatedBy: req.currentUser.id,
  };

  const updated = await upsertSalary(employeeId, merged);
  res.json(serializePayroll(updated));
});
