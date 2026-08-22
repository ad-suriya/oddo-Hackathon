import { ValidationError } from "../utils/errors.js";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateSignupPayload({ fullName, employeeCode, email, password }) {
  const errors = {};
  if (!fullName?.trim()) errors.fullName = "Full name is required.";
  if (!employeeCode?.trim()) errors.employeeCode = "Employee ID is required.";
  if (!email?.trim()) errors.email = "Email is required.";
  else if (!EMAIL_RE.test(email.trim())) errors.email = "Enter a valid email address.";
  if (!password || password.length < 8) errors.password = "Password must be at least 8 characters.";
  if (Object.keys(errors).length) throw new ValidationError("Please fix the highlighted fields.", errors);
}

export function validateLoginPayload({ email, password }) {
  const errors = {};
  if (!email?.trim()) errors.email = "Email is required.";
  if (!password) errors.password = "Password is required.";
  if (Object.keys(errors).length) throw new ValidationError("Please fix the highlighted fields.", errors);
}
