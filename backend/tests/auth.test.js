import { test } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import { app, uniqueEmail, uniqueEmployeeCode, extractSessionCookie } from "./helpers/testApp.js";

test("signup creates an employee account and starts a session", async () => {
  const email = uniqueEmail("signup");
  const res = await request(app).post("/api/auth/signup").send({
    fullName: "New Person",
    employeeCode: uniqueEmployeeCode(),
    email,
    password: "Password123",
  });

  assert.equal(res.status, 201);
  assert.equal(res.body.email, email);
  assert.equal(res.body.role, "employee", "public signup must always create role=employee");
  assert.ok(res.body.employee);
  assert.ok(extractSessionCookie(res), "signup should set a session cookie");
});

test("signup ignores a client-supplied admin/hr role", async () => {
  const email = uniqueEmail("privesc");
  const res = await request(app).post("/api/auth/signup").send({
    fullName: "Attempted Admin",
    employeeCode: uniqueEmployeeCode(),
    email,
    password: "Password123",
    role: "admin",
  });

  assert.equal(res.status, 201);
  assert.equal(res.body.role, "employee");
});

test("signup rejects a duplicate email with 409", async () => {
  const email = uniqueEmail("dup");
  const payload = { fullName: "Dup", employeeCode: uniqueEmployeeCode(), email, password: "Password123" };
  await request(app).post("/api/auth/signup").send(payload);
  const res = await request(app).post("/api/auth/signup").send({ ...payload, employeeCode: uniqueEmployeeCode() });

  assert.equal(res.status, 409);
  assert.equal(res.body.error.code, "CONFLICT");
});

test("signup rejects invalid input with 422 and field details", async () => {
  const res = await request(app).post("/api/auth/signup").send({ fullName: "", employeeCode: "", email: "", password: "short" });
  assert.equal(res.status, 422);
  assert.equal(res.body.error.code, "VALIDATION_ERROR");
  assert.ok(res.body.error.details.fullName);
  assert.ok(res.body.error.details.password);
});

test("login with correct credentials returns the auth user and a session cookie", async () => {
  const res = await request(app).post("/api/auth/login").send({
    email: "alice@dayflow.dev",
    password: "Password123",
    rememberMe: true,
  });
  assert.equal(res.status, 200);
  assert.equal(res.body.email, "alice@dayflow.dev");
  assert.ok(extractSessionCookie(res));
});

test("login with an incorrect password returns 401", async () => {
  const res = await request(app).post("/api/auth/login").send({ email: "alice@dayflow.dev", password: "wrong" });
  assert.equal(res.status, 401);
  assert.equal(res.body.error.code, "UNAUTHENTICATED");
});

test("login with an unknown email returns 401 (not a user-enumeration 404)", async () => {
  const res = await request(app).post("/api/auth/login").send({ email: "nobody@dayflow.dev", password: "Password123" });
  assert.equal(res.status, 401);
});

test("GET /auth/me with a valid session returns the current user", async () => {
  const loginRes = await request(app).post("/api/auth/login").send({ email: "alice@dayflow.dev", password: "Password123" });
  const cookie = extractSessionCookie(loginRes);

  const res = await request(app).get("/api/auth/me").set("Cookie", cookie);
  assert.equal(res.status, 200);
  assert.equal(res.body.email, "alice@dayflow.dev");
});

test("GET /auth/me without a session returns 401 (frontend treats this as logged-out, not an error toast)", async () => {
  const res = await request(app).get("/api/auth/me");
  assert.equal(res.status, 401);
  assert.equal(res.body.error.code, "UNAUTHENTICATED");
});

test("logout invalidates the session", async () => {
  const loginRes = await request(app).post("/api/auth/login").send({ email: "alice@dayflow.dev", password: "Password123" });
  const cookie = extractSessionCookie(loginRes);

  const logoutRes = await request(app).post("/api/auth/logout").set("Cookie", cookie);
  assert.equal(logoutRes.status, 204);

  const meRes = await request(app).get("/api/auth/me").set("Cookie", cookie);
  assert.equal(meRes.status, 401);
});
