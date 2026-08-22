import { ValidationError } from "../utils/errors.js";

const SALARY_FIELDS = ["basicPay", "allowances", "deductions"];

export function validateSalaryPayload(payload) {
  for (const field of SALARY_FIELDS) {
    if (payload[field] !== undefined) {
      const num = Number(payload[field]);
      if (Number.isNaN(num) || num < 0) {
        throw new ValidationError("Salary values must be zero or greater.", {
          [field]: "Must be zero or greater.",
        });
      }
    }
  }
}

// Each field is non-negative on its own (checked above), but nothing
// stopped deductions from exceeding basicPay + allowances, producing a
// negative net pay. Call this against the *merged* (existing + patch)
// values, since a partial update (e.g. { deductions } alone) can only be
// judged against what basicPay/allowances actually resolve to.
export function assertNonNegativeNetPay({ basicPay, allowances, deductions }) {
  if (basicPay + allowances - deductions < 0) {
    throw new ValidationError("Deductions cannot exceed basic pay plus allowances.", {
      deductions: "Deductions cannot exceed basic pay plus allowances.",
    });
  }
}
