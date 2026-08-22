import { apiClient } from "./client.js";

export const leaveApi = {
  create: (payload) => apiClient.post("/leave-requests", payload),
  getMine: (params = {}) => apiClient.get(`/leave-requests/me${toQueryString(params)}`),
  list: (params = {}) => apiClient.get(`/leave-requests${toQueryString(params)}`),
  approve: (id, payload) => apiClient.patch(`/leave-requests/${id}/approve`, payload),
  reject: (id, payload) => apiClient.patch(`/leave-requests/${id}/reject`, payload),
};

function toQueryString(params) {
  const entries = Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== "");
  if (entries.length === 0) return "";
  return `?${new URLSearchParams(entries).toString()}`;
}
