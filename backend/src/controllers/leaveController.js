import { asyncHandler } from "../utils/asyncHandler.js";
import { NotFoundError, ValidationError } from "../utils/errors.js";
import { validateLeaveRequestPayload } from "../validation/leaveValidation.js";
import { serializeLeaveRequest } from "../serializers/leaveSerializer.js";
import {
  createLeaveRequest,
  findLeaveRequestById,
  listForEmployee,
  listAll,
  reviewLeaveRequest,
} from "../repositories/leaveRequestsRepo.js";

export const create = asyncHandler(async function create(req, res) {
  const { leaveType, startDate, endDate, remarks } = req.body || {};
  validateLeaveRequestPayload({ leaveType, startDate, endDate });

  const record = await createLeaveRequest({
    employeeId: req.currentEmployee.id,
    leaveType,
    startDate,
    endDate,
    remarks: remarks?.trim() || null,
  });
  res.status(201).json(serializeLeaveRequest(record));
});

export const getMine = asyncHandler(async function getMine(req, res) {
  const rows = await listForEmployee(req.currentEmployee.id);
  res.json(rows.map(serializeLeaveRequest));
});

export const list = asyncHandler(async function list(req, res) {
  const { status } = req.query;
  const rows = await listAll({ status });
  res.json(rows.map(serializeLeaveRequest));
});

async function review(req, res, status) {
  const existing = await findLeaveRequestById(req.params.id);
  if (!existing) throw new NotFoundError("Leave request not found.");
  if (existing.status !== "pending") {
    throw new ValidationError(`Only pending requests can be ${status === "approved" ? "approved" : "rejected"}.`);
  }
  const { reviewerComment } = req.body || {};
  const updated = await reviewLeaveRequest(req.params.id, {
    status,
    reviewerId: req.currentEmployee.id,
    reviewerComment: reviewerComment?.trim() || null,
  });
  if (!updated) throw new ValidationError("Only pending requests can be reviewed.");
  res.json(serializeLeaveRequest(updated));
}

export const approve = asyncHandler(async function approve(req, res) {
  await review(req, res, "approved");
});

export const reject = asyncHandler(async function reject(req, res) {
  await review(req, res, "rejected");
});
