import { db, persist } from "./db.js";
import { badRequest, delay, forbidden, makeId, notFound, unauthorized } from "./utils.js";
import { isAdminRole } from "../utils/constants.js";

function currentSession() {
  const userId = db.sessionUserId;
  if (!userId) throw unauthorized("You are not signed in.");
  const user = db.users.find((u) => u.id === userId);
  const employee = db.employees.find((e) => e.userId === userId);
  if (!user || !employee) throw unauthorized("You are not signed in.");
  return { user, employee };
}

function withEmployee(record) {
  const employee = db.employees.find((e) => e.id === record.employeeId);
  const reviewer = record.reviewedBy ? db.employees.find((e) => e.id === record.reviewedBy) : null;
  return {
    ...record,
    employee: employee
      ? { id: employee.id, fullName: employee.fullName, employeeCode: employee.employeeCode, department: employee.department }
      : null,
    reviewer: reviewer ? { id: reviewer.id, fullName: reviewer.fullName } : null,
  };
}

const VALID_LEAVE_TYPES = ["paid", "sick", "unpaid"];

export const mockLeaveApi = {
  async create({ leaveType, startDate, endDate, remarks }) {
    await delay();
    const { employee } = currentSession();
    const errors = {};
    if (!VALID_LEAVE_TYPES.includes(leaveType)) errors.leaveType = "Select a valid leave type.";
    if (!startDate) errors.startDate = "Start date is required.";
    if (!endDate) errors.endDate = "End date is required.";
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      errors.endDate = "End date must be on or after the start date.";
    }
    if (Object.keys(errors).length) throw badRequest("Please fix the highlighted fields.", errors);

    const record = {
      id: makeId(),
      employeeId: employee.id,
      leaveType,
      startDate,
      endDate,
      remarks: remarks?.trim() || null,
      status: "pending",
      reviewedBy: null,
      reviewerComment: null,
      reviewedAt: null,
      createdAt: new Date().toISOString(),
    };
    db.leaveRequests.push(record);
    persist();
    return withEmployee(record);
  },

  async getMine() {
    await delay();
    const { employee } = currentSession();
    return db.leaveRequests
      .filter((r) => r.employeeId === employee.id)
      .map(withEmployee)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  async list({ status } = {}) {
    await delay();
    const { user } = currentSession();
    if (!isAdminRole(user.role)) throw forbidden("Only Admin/HR can view all leave requests.");
    let rows = db.leaveRequests;
    if (status) rows = rows.filter((r) => r.status === status);
    return rows.map(withEmployee).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  async approve(id, { reviewerComment } = {}) {
    await delay();
    const { user, employee: reviewer } = currentSession();
    if (!isAdminRole(user.role)) throw forbidden("Only Admin/HR can approve leave requests.");
    const record = db.leaveRequests.find((r) => r.id === id);
    if (!record) throw notFound("Leave request not found.");
    if (record.status !== "pending") throw badRequest("Only pending requests can be approved.");
    record.status = "approved";
    record.reviewedBy = reviewer.id;
    record.reviewerComment = reviewerComment?.trim() || null;
    record.reviewedAt = new Date().toISOString();
    persist();
    return withEmployee(record);
  },

  async reject(id, { reviewerComment } = {}) {
    await delay();
    const { user, employee: reviewer } = currentSession();
    if (!isAdminRole(user.role)) throw forbidden("Only Admin/HR can reject leave requests.");
    const record = db.leaveRequests.find((r) => r.id === id);
    if (!record) throw notFound("Leave request not found.");
    if (record.status !== "pending") throw badRequest("Only pending requests can be rejected.");
    record.status = "rejected";
    record.reviewedBy = reviewer.id;
    record.reviewerComment = reviewerComment?.trim() || null;
    record.reviewedAt = new Date().toISOString();
    persist();
    return withEmployee(record);
  },
};
