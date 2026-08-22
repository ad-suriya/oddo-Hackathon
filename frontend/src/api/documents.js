import { apiClient } from "./client.js";

export const documentsApi = {
  getMine: () => apiClient.get("/employees/me/documents"),
  getForEmployee: (employeeId) => apiClient.get(`/employees/${employeeId}/documents`),
};
