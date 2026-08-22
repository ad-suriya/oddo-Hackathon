import { asyncHandler } from "../utils/asyncHandler.js";
import { ConflictError, NotFoundError, ValidationError } from "../utils/errors.js";
import { serializeAttendance, serializeAttendanceWithEmployee } from "../serializers/attendanceSerializer.js";
import {
  findTodayRecord,
  insertCheckIn,
  setCheckOut,
  listForEmployee,
  listForDate,
} from "../repositories/attendanceRepo.js";
import { findEmployeeById } from "../repositories/employeesRepo.js";

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export const checkIn = asyncHandler(async function checkIn(req, res) {
  const employeeId = req.currentEmployee.id;
  const existing = await findTodayRecord(employeeId);
  if (existing && existing.check_in_at) {
    throw new ConflictError("You have already checked in today.");
  }
  const record = await insertCheckIn(employeeId);
  res.status(201).json(serializeAttendance(record));
});

export const checkOut = asyncHandler(async function checkOut(req, res) {
  const employeeId = req.currentEmployee.id;
  const existing = await findTodayRecord(employeeId);
  if (!existing || !existing.check_in_at) {
    throw new ValidationError("You need to check in before you can check out.");
  }
  if (existing.check_out_at) {
    throw new ConflictError("You have already checked out today.");
  }
  const record = await setCheckOut(employeeId);
  res.json(serializeAttendance(record));
});

export const getMine = asyncHandler(async function getMine(req, res) {
  const { from, to } = req.query;
  const rows = await listForEmployee(req.currentEmployee.id, { from, to });
  res.json(rows.map(serializeAttendance));
});

export const list = asyncHandler(async function list(req, res) {
  const date = req.query.date || todayIso();
  const rows = await listForDate(date);
  res.json(rows.map(serializeAttendanceWithEmployee));
});

export const getForEmployee = asyncHandler(async function getForEmployee(req, res) {
  const { employeeId } = req.params;
  const { from, to } = req.query;
  const employee = await findEmployeeById(employeeId);
  if (!employee) throw new NotFoundError("Employee not found.");
  const rows = await listForEmployee(employeeId, { from, to });
  res.json(rows.map(serializeAttendance));
});
