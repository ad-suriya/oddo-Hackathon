const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function required(value, message = "This field is required.") {
  if (value === null || value === undefined) return message;
  if (typeof value === "string" && value.trim() === "") return message;
  return undefined;
}

export function validateEmail(value) {
  if (!value || !value.trim()) return "Email is required.";
  if (!EMAIL_RE.test(value.trim())) return "Enter a valid email address.";
  return undefined;
}

export function validatePassword(value) {
  if (!value) return "Password is required.";
  if (value.length < 8) return "Password must be at least 8 characters.";
  if (!/[A-Za-z]/.test(value) || !/[0-9]/.test(value)) {
    return "Password must contain both letters and numbers.";
  }
  return undefined;
}

export function validateConfirmPassword(password, confirm) {
  if (!confirm) return "Please confirm your password.";
  if (password !== confirm) return "Passwords do not match.";
  return undefined;
}

export function validateDateRange(startDate, endDate) {
  if (!startDate || !endDate) return "Select both a start and end date.";
  if (new Date(startDate) > new Date(endDate)) {
    return "End date must be on or after the start date.";
  }
  return undefined;
}

export function validateMaxLength(value, max, label = "This field") {
  if (value && value.length > max) return `${label} must be ${max} characters or fewer.`;
  return undefined;
}

/**
 * Runs a map of { field: validatorFn } against a values object.
 * Returns an errors object containing only the fields that failed.
 */
export function validateForm(values, validators) {
  const errors = {};
  for (const [field, validator] of Object.entries(validators)) {
    const message = validator(values[field], values);
    if (message) errors[field] = message;
  }
  return errors;
}

export function hasErrors(errors) {
  return Object.keys(errors).length > 0;
}
