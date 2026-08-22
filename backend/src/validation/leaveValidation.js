import { ValidationError } from "../utils/errors.js";

export const VALID_LEAVE_TYPES = ["paid", "sick", "unpaid"];

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

// A malformed or calendar-impossible date string (e.g. "not-a-date" or
// "2027-02-30") would previously fail to be caught here — comparing two
// `Invalid Date`s with `>` is always `false`, so it silently passed
// validation and blew up as a 500 once it hit the DATE column instead.
// The round-trip through toISOString() catches overflow days too: JS
// normalizes "2027-02-30" to March 2, so it no longer matches the input.
function isValidIsoDate(value) {
  if (typeof value !== "string" || !ISO_DATE_RE.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export function validateLeaveRequestPayload({ leaveType, startDate, endDate }) {
  const errors = {};
  if (!VALID_LEAVE_TYPES.includes(leaveType)) errors.leaveType = "Select a valid leave type.";

  if (!startDate) errors.startDate = "Start date is required.";
  else if (!isValidIsoDate(startDate)) errors.startDate = "Enter a valid date (YYYY-MM-DD).";

  if (!endDate) errors.endDate = "End date is required.";
  else if (!isValidIsoDate(endDate)) errors.endDate = "Enter a valid date (YYYY-MM-DD).";

  if (!errors.startDate && !errors.endDate && new Date(startDate) > new Date(endDate)) {
    errors.endDate = "End date must be on or after the start date.";
  }
  if (Object.keys(errors).length) throw new ValidationError("Please fix the highlighted fields.", errors);
}
