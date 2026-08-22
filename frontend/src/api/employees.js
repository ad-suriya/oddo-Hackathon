import { apiClient } from "./client.js";

export const employeesApi = {
  getMe: () => apiClient.get("/employees/me"),
  updateMe: (payload) => apiClient.patch("/employees/me", payload),
  list: (params = {}) => apiClient.get(`/employees${toQueryString(params)}`),
  getById: (id) => apiClient.get(`/employees/${id}`),
  update: (id, payload) => apiClient.patch(`/employees/${id}`, payload),
};

function toQueryString(params) {
  const entries = Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== "");
  if (entries.length === 0) return "";
  return `?${new URLSearchParams(entries).toString()}`;
}
