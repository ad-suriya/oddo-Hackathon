import { ValidationError } from "../utils/errors.js";

export const VALID_LEAVE_TYPES = ["paid", "sick", "unpaid"];

export function validateLeaveRequestPayload({ leaveType, startDate, endDate }) {
  const errors = {};
  if (!VALID_LEAVE_TYPES.includes(leaveType)) errors.leaveType = "Select a valid leave type.";
  if (!startDate) errors.startDate = "Start date is required.";
  if (!endDate) errors.endDate = "End date is required.";
  if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
    errors.endDate = "End date must be on or after the start date.";
  }
  if (Object.keys(errors).length) throw new ValidationError("Please fix the highlighted fields.", errors);
}
