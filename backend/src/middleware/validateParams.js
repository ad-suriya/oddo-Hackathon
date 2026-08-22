import { NotFoundError } from "../utils/errors.js";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// A malformed :id/:employeeId (e.g. "not-a-uuid") can never match a row, but
// passing it straight into a parameterized query against a uuid column makes
// Postgres throw "invalid input syntax for type uuid" — not a constraint
// violation errorHandler.js recognizes, so it fell through to a generic 500.
// Reject the format up front and answer the same 404 a valid-but-missing id
// would get.
export function requireUuidParam(paramName) {
  return function validateUuidParam(req, res, next) {
    if (!UUID_RE.test(req.params[paramName])) {
      return next(new NotFoundError("Resource not found."));
    }
    next();
  };
}

// leave_requests.id is BIGSERIAL, not UUID (see database/migrations/0007) —
// use this instead of requireUuidParam for routes keyed on it.
export function requireIntParam(paramName) {
  return function validateIntParam(req, res, next) {
    if (!/^\d+$/.test(req.params[paramName])) {
      return next(new NotFoundError("Resource not found."));
    }
    next();
  };
}
