// The DB schema (docs/DATABASE.md) has no leave-balance/entitlement table —
// only leave_requests. "Available leave" is therefore a client-side derived
// figure against an assumed annual policy, not real backend state. Replace
// this once a balance/entitlement concept exists on the backend.
export const ANNUAL_PAID_LEAVE_DAYS = 24;

export function daysBetweenInclusive(startDate, endDate) {
  if (!startDate || !endDate) return 0;
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diff = Math.round((end - start) / 86400000) + 1;
  return Math.max(diff, 0);
}

export function summarizeLeave(requests = []) {
  const thisYear = new Date().getFullYear();
  let pending = 0;
  let approved = 0;
  let rejected = 0;
  let usedPaidDays = 0;

  for (const req of requests) {
    if (req.status === "pending") pending += 1;
    if (req.status === "rejected") rejected += 1;
    if (req.status === "approved") {
      approved += 1;
      const year = new Date(req.startDate).getFullYear();
      if (req.leaveType === "paid" && year === thisYear) {
        usedPaidDays += daysBetweenInclusive(req.startDate, req.endDate);
      }
    }
  }

  const availableDays = Math.max(ANNUAL_PAID_LEAVE_DAYS - usedPaidDays, 0);
  return { pending, approved, rejected, usedPaidDays, availableDays, total: requests.length };
}
