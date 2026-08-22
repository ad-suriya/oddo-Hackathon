import { apiClient } from "./client.js";

export const payrollApi = {
  getMine: () => apiClient.get("/payroll/me"),
  list: (params = {}) => apiClient.get(`/payroll${toQueryString(params)}`),
  update: (employeeId, payload) => apiClient.patch(`/payroll/${employeeId}`, payload),
};

function toQueryString(params) {
  const entries = Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== "");
  if (entries.length === 0) return "";
  return `?${new URLSearchParams(entries).toString()}`;
}
