import { AppError } from "../utils/errors.js";

const PG_UNIQUE_VIOLATION = "23505";
const PG_CHECK_VIOLATION = "23514";
const PG_FOREIGN_KEY_VIOLATION = "23503";

export function errorHandler(err, req, res, next) {
  if (err instanceof AppError) {
    return res.status(err.status).json({
      error: { code: err.code, message: err.message, details: err.details || {} },
    });
  }

  // Safety net: a business rule race (e.g. two simultaneous check-ins) can
  // still hit a database constraint even after application-level checks.
  if (err.code === PG_UNIQUE_VIOLATION) {
    return res.status(409).json({
      error: { code: "CONFLICT", message: "This resource already exists.", details: {} },
    });
  }
  if (err.code === PG_CHECK_VIOLATION || err.code === PG_FOREIGN_KEY_VIOLATION) {
    return res.status(422).json({
      error: { code: "VALIDATION_ERROR", message: "The request could not be processed.", details: {} },
    });
  }

  console.error(err);
  res.status(500).json({
    error: { code: "INTERNAL_ERROR", message: "Internal server error", details: {} },
  });
}

export function notFoundHandler(req, res) {
  res.status(404).json({
    error: { code: "NOT_FOUND", message: "Not found", details: {} },
  });
}
