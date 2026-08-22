import { asyncHandler } from "../utils/asyncHandler.js";
import { NotFoundError } from "../utils/errors.js";
import { serializeDocument } from "../serializers/documentSerializer.js";
import { listDocumentsForEmployee } from "../repositories/documentsRepo.js";
import { findEmployeeById } from "../repositories/employeesRepo.js";

export const getMine = asyncHandler(async function getMine(req, res) {
  const rows = await listDocumentsForEmployee(req.currentEmployee.id);
  res.json(rows.map(serializeDocument));
});

export const getForEmployee = asyncHandler(async function getForEmployee(req, res) {
  const employee = await findEmployeeById(req.params.id);
  if (!employee) throw new NotFoundError("Employee not found.");
  const rows = await listDocumentsForEmployee(req.params.id);
  res.json(rows.map(serializeDocument));
});
