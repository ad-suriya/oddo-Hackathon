import { ApiError } from "../api/client.js";

export function delay(ms = 350) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function makeId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return `id_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

export function clone(value) {
  return value === undefined ? value : JSON.parse(JSON.stringify(value));
}

export function notFound(message = "Resource not found.") {
  return new ApiError(message, { status: 404, code: "NOT_FOUND" });
}

export function forbidden(message = "You do not have permission to perform this action.") {
  return new ApiError(message, { status: 403, code: "FORBIDDEN" });
}

export function badRequest(message = "Invalid request.", details) {
  return new ApiError(message, { status: 422, code: "VALIDATION_ERROR", details });
}

export function unauthorized(message = "Authentication required.") {
  return new ApiError(message, { status: 401, code: "UNAUTHENTICATED" });
}

export function conflict(message = "This resource already exists.") {
  return new ApiError(message, { status: 409, code: "CONFLICT" });
}

export { todayIso } from "../utils/formatters.js";

export function isoDaysAgo(days) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

export function isoDaysFromNow(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

// Mirrors the real API's paginated envelope (see backend/src/utils/pagination.js
// and docs/API.md §6/§9) so USE_MOCK_API can flip without page-level changes.
export function paginate(items, { page, limit } = {}) {
  const safePage = Number.isFinite(Number(page)) && Number(page) >= 1 ? Number(page) : 1;
  const safeLimit = Number.isFinite(Number(limit)) && Number(limit) >= 1 ? Math.min(Number(limit), 100) : 20;
  const total = items.length;
  const start = (safePage - 1) * safeLimit;
  return {
    items: items.slice(start, start + safeLimit),
    page: safePage,
    limit: safeLimit,
    total,
    totalPages: total === 0 ? 0 : Math.ceil(total / safeLimit),
  };
}
