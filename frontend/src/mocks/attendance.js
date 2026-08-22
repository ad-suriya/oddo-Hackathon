import { db, persist } from "./db.js";
import { badRequest, conflict, delay, forbidden, makeId, notFound, todayIso, unauthorized } from "./utils.js";
import { isAdminRole } from "../utils/constants.js";

function currentSession() {
  const userId = db.sessionUserId;
  if (!userId) throw unauthorized("You are not signed in.");
  const user = db.users.find((u) => u.id === userId);
  const employee = db.employees.find((e) => e.userId === userId);
  if (!user || !employee) throw unauthorized("You are not signed in.");
  return { user, employee };
}

function toDto(record) {
  return { ...record };
}

function findTodayRecord(employeeId) {
  const date = todayIso();
  return db.attendance.find((a) => a.employeeId === employeeId && a.attendanceDate === date);
}

export const mockAttendanceApi = {
  async checkIn() {
    await delay();
    const { employee } = currentSession();
    const existing = findTodayRecord(employee.id);
    if (existing && existing.checkInAt) {
      throw conflict("You have already checked in today.");
    }
    let record = existing;
    if (!record) {
      record = {
        id: makeId(),
        employeeId: employee.id,
        attendanceDate: todayIso(),
        checkInAt: null,
        checkOutAt: null,
        status: "present",
      };
      db.attendance.push(record);
    }
    record.checkInAt = new Date().toISOString();
    record.status = "present";
    persist();
    return toDto(record);
  },

  async checkOut() {
    await delay();
    const { employee } = currentSession();
    const record = findTodayRecord(employee.id);
    if (!record || !record.checkInAt) {
      throw badRequest("You need to check in before you can check out.");
    }
    if (record.checkOutAt) {
      throw conflict("You have already checked out today.");
    }
    record.checkOutAt = new Date().toISOString();
    persist();
    return toDto(record);
  },

  async getMine({ from, to } = {}) {
    await delay();
    const { employee } = currentSession();
    let rows = db.attendance.filter((a) => a.employeeId === employee.id);
    if (from) rows = rows.filter((a) => a.attendanceDate >= from);
    if (to) rows = rows.filter((a) => a.attendanceDate <= to);
    return rows.map(toDto).sort((a, b) => b.attendanceDate.localeCompare(a.attendanceDate));
  },

  async list({ date } = {}) {
    await delay();
    const { user } = currentSession();
    if (!isAdminRole(user.role)) throw forbidden("Only Admin/HR can view all attendance records.");
    const targetDate = date || todayIso();
    const rows = db.attendance.filter((a) => a.attendanceDate === targetDate);
    return rows
      .map((record) => {
        const employee = db.employees.find((e) => e.id === record.employeeId);
        return {
          ...toDto(record),
          employee: employee
            ? { id: employee.id, fullName: employee.fullName, employeeCode: employee.employeeCode, department: employee.department }
            : null,
        };
      })
      .sort((a, b) => (a.employee?.fullName || "").localeCompare(b.employee?.fullName || ""));
  },

  async getForEmployee(employeeId, { from, to } = {}) {
    await delay();
    const { user } = currentSession();
    if (!isAdminRole(user.role)) throw forbidden("Only Admin/HR can view another employee's attendance.");
    const employee = db.employees.find((e) => e.id === employeeId);
    if (!employee) throw notFound("Employee not found.");
    let rows = db.attendance.filter((a) => a.employeeId === employeeId);
    if (from) rows = rows.filter((a) => a.attendanceDate >= from);
    if (to) rows = rows.filter((a) => a.attendanceDate <= to);
    return rows.map(toDto).sort((a, b) => b.attendanceDate.localeCompare(a.attendanceDate));
  },
};
