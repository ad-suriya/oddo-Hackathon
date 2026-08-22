import { asyncHandler } from "../utils/asyncHandler.js";
import { NotFoundError } from "../utils/errors.js";
import { serializeEmployee } from "../serializers/employeeSerializer.js";
import {
  assertOnlyAllowedFields,
  validatePhone,
  EMPLOYEE_SELF_EDITABLE_FIELDS,
  ADMIN_EDITABLE_FIELDS,
} from "../validation/employeeValidation.js";
import {
  findEmployeeById,
  listEmployees,
  updateEmployee,
} from "../repositories/employeesRepo.js";

export const getMe = asyncHandler(async function getMe(req, res) {
  if (!req.currentEmployee) throw new NotFoundError("Employee profile not found.");
  res.json(serializeEmployee(req.currentEmployee));
});

export const updateMe = asyncHandler(async function updateMe(req, res) {
  if (!req.currentEmployee) throw new NotFoundError("Employee profile not found.");
  const payload = req.body || {};
  assertOnlyAllowedFields(payload, EMPLOYEE_SELF_EDITABLE_FIELDS);
  validatePhone(payload);

  const updated = await updateEmployee(req.currentEmployee.id, payload);
  res.json(serializeEmployee(updated));
});

export const list = asyncHandler(async function list(req, res) {
  const { search, department } = req.query;
  const rows = await listEmployees({ search, department });
  res.json(rows.map(serializeEmployee));
});

export const getById = asyncHandler(async function getById(req, res) {
  const employee = await findEmployeeById(req.params.id);
  if (!employee) throw new NotFoundError("Employee not found.");
  res.json(serializeEmployee(employee));
});

export const update = asyncHandler(async function update(req, res) {
  const existing = await findEmployeeById(req.params.id);
  if (!existing) throw new NotFoundError("Employee not found.");

  const payload = req.body || {};
  assertOnlyAllowedFields(payload, ADMIN_EDITABLE_FIELDS);
  validatePhone(payload);

  const updated = await updateEmployee(req.params.id, payload);
  res.json(serializeEmployee(updated));
});
