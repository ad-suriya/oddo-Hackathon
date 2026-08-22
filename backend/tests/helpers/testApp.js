import crypto from "node:crypto";
import request from "supertest";
import { createApp } from "../../src/app.js";

export const app = createApp();

const DEMO_PASSWORD = "Password123";

export async function loginAs(email) {
  const res = await request(app).post("/api/auth/login").send({ email, password: DEMO_PASSWORD });
  const cookie = extractSessionCookie(res);
  if (!cookie) throw new Error(`Failed to log in as ${email}: ${JSON.stringify(res.body)}`);
  return cookie;
}

export async function signupNewEmployee(overrides = {}) {
  const email = uniqueEmail("worker");
  const res = await request(app)
    .post("/api/auth/signup")
    .send({
      fullName: "Test Worker",
      employeeCode: uniqueEmployeeCode(),
      email,
      password: DEMO_PASSWORD,
      ...overrides,
    });
  return { body: res.body, cookie: extractSessionCookie(res) };
}

export function uniqueEmail(prefix) {
  return `${prefix}.${crypto.randomBytes(6).toString("hex")}@dayflow.test`;
}

export function uniqueEmployeeCode() {
  return `TST${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
}

// Extracts the Set-Cookie session value from a supertest response so it
// can be replayed on the next request (supertest has no built-in cookie
// jar across separate `request(app)` calls).
export function extractSessionCookie(res) {
  const setCookie = res.headers["set-cookie"];
  if (!setCookie) return null;
  const sessionCookie = setCookie.find((c) => c.startsWith("dayflow_session="));
  return sessionCookie ? sessionCookie.split(";")[0] : null;
}
