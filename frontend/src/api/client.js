import { API_BASE_URL } from "../config.js";

export class ApiError extends Error {
  constructor(message, { status, code, details } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

async function parseErrorResponse(res) {
  let body = null;
  try {
    body = await res.json();
  } catch {
    // no JSON body
  }
  const message = body?.error?.message || body?.error || `Request failed with status ${res.status}`;
  return new ApiError(message, {
    status: res.status,
    code: body?.error?.code,
    details: body?.error?.details,
  });
}

async function request(path, { method = "GET", body, headers } = {}) {
  let res;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      method,
      credentials: "include",
      headers: {
        ...(body ? { "Content-Type": "application/json" } : {}),
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError("Unable to reach the server. Check your connection and try again.", {
      status: 0,
      code: "NETWORK_ERROR",
    });
  }

  if (!res.ok) {
    throw await parseErrorResponse(res);
  }

  if (res.status === 204) return null;

  try {
    return await res.json();
  } catch {
    return null;
  }
}

export const apiClient = {
  get: (path) => request(path, { method: "GET" }),
  post: (path, body) => request(path, { method: "POST", body }),
  patch: (path, body) => request(path, { method: "PATCH", body }),
  delete: (path) => request(path, { method: "DELETE" }),
};
