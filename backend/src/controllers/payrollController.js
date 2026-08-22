import { asyncHandler } from "../utils/asyncHandler.js";
import { NotFoundError } from "../utils/errors.js";
import { validateSalaryPayload, assertNonNegativeNetPay } from "../validation/payrollValidation.js";
import { serializePayroll } from "../serializers/payrollSerializer.js";
import { parsePagination, paginatedResponse } from "../utils/pagination.js";
import { countSalaries, findSalaryByEmployeeId, listAllSalaries, upsertSalary } from "../repositories/payrollRepo.js";
import { findEmployeeById } from "../repositories/employeesRepo.js";

export const getMine = asyncHandler(async function getMine(req, res) {
  const salary = await findSalaryByEmployeeId(req.currentEmployee.id);
  if (!salary) throw new NotFoundError("Payroll information not found.");
  res.json(serializePayroll(salary));
});

export const list = asyncHandler(async function list(req, res) {
  const pagination = parsePagination(req.query);
  const [rows, total] = await Promise.all([
    listAllSalaries({ limit: pagination.limit, offset: pagination.offset }),
    countSalaries(),
  ]);
  res.json(paginatedResponse(rows.map(serializePayroll), pagination, total));
});

export const getById = asyncHandler(async function getById(req, res) {
  const salary = await findSalaryByEmployeeId(req.params.employeeId);
  if (!salary) throw new NotFoundError("Payroll information not found.");
  res.json(serializePayroll(salary));
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
  assertNonNegativeNetPay(merged);

  const updated = await upsertSalary(employeeId, merged);
  res.json(serializePayroll(updated));
});
