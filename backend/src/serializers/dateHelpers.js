// pg returns DATE columns as JS Date objects (midnight UTC) and
// TIMESTAMPTZ columns as JS Date objects too. The frontend/mock contract
// expects plain ISO strings: "YYYY-MM-DD" for dates, full ISO 8601 for
// timestamps.
export function toDateOnly(value) {
  if (value === null || value === undefined) return null;
  if (typeof value === "string") return value.slice(0, 10);
  return value.toISOString().slice(0, 10);
}

export function toIsoString(value) {
  if (value === null || value === undefined) return null;
  if (typeof value === "string") return value;
  return value.toISOString();
}
