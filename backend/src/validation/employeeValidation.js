import { ForbiddenError, ValidationError } from "../utils/errors.js";

const PHONE_RE = /^[\d+\-\s()]{6,20}$/;

export const EMPLOYEE_SELF_EDITABLE_FIELDS = ["phone", "address", "profilePictureUrl"];
export const ADMIN_EDITABLE_FIELDS = [
  "fullName",
  "phone",
  "address",
  "jobTitle",
  "department",
  "dateJoined",
  "profilePictureUrl",
];

export function assertOnlyAllowedFields(payload, allowedFields) {
  for (const key of Object.keys(payload)) {
    if (!allowedFields.includes(key)) {
      throw new ForbiddenError(`Field "${key}" cannot be edited.`);
    }
  }
}

export function validatePhone(payload) {
  if (payload.phone !== undefined && payload.phone && !PHONE_RE.test(payload.phone)) {
    throw new ValidationError("Enter a valid phone number.", { phone: "Enter a valid phone number." });
  }
}
