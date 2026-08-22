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
