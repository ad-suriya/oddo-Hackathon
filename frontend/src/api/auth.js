import { apiClient } from "./client.js";

export const authApi = {
  signup: (payload) => apiClient.post("/auth/signup", payload),
  login: (payload) => apiClient.post("/auth/login", payload),
  verifyEmail: (payload) => apiClient.post("/auth/verify-email", payload),
  logout: () => apiClient.post("/auth/logout"),
  me: () => apiClient.get("/auth/me"),
};
