// Central switch between the real backend and the temporary in-memory mock
// layer (see src/mocks/). Flip VITE_USE_MOCK_API=false once the backend
// implements the endpoints in docs/API.md — no UI/component changes needed.
export const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API !== "false";

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api";
