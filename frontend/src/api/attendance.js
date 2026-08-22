import { apiClient } from "./client.js";

export const attendanceApi = {
  checkIn: () => apiClient.post("/attendance/check-in"),
  checkOut: () => apiClient.post("/attendance/check-out"),
  getMine: (params = {}) => apiClient.get(`/attendance/me${toQueryString(params)}`),
  list: (params = {}) => apiClient.get(`/attendance${toQueryString(params)}`),
  getForEmployee: (employeeId, params = {}) =>
    apiClient.get(`/attendance/${employeeId}${toQueryString(params)}`),
};

function toQueryString(params) {
  const entries = Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== "");
  if (entries.length === 0) return "";
  return `?${new URLSearchParams(entries).toString()}`;
}
