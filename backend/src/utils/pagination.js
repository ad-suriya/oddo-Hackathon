const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

// Shared by every paginated list endpoint so "page=abc" or "limit=-5" from
// a client degrades to sane defaults instead of producing a broken query
// (negative OFFSET, NaN LIMIT).
export function parsePagination(query = {}) {
  let page = Number.parseInt(query.page, 10);
  if (!Number.isFinite(page) || page < 1) page = 1;

  let limit = Number.parseInt(query.limit, 10);
  if (!Number.isFinite(limit) || limit < 1) limit = DEFAULT_LIMIT;
  limit = Math.min(limit, MAX_LIMIT);

  return { page, limit, offset: (page - 1) * limit };
}

export function paginatedResponse(items, { page, limit }, total) {
  return {
    items,
    page,
    limit,
    total,
    totalPages: total === 0 ? 0 : Math.ceil(total / limit),
  };
}
