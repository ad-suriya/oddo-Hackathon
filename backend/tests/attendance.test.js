import { test } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import { app, loginAs, signupNewEmployee } from "./helpers/testApp.js";

test("check-in succeeds for an employee with no record today", async () => {
  const { cookie } = await signupNewEmployee();
  const res = await request(app).post("/api/attendance/check-in").set("Cookie", cookie);
  assert.equal(res.status, 201);
  assert.equal(res.body.status, "present");
  assert.ok(res.body.checkInAt);
  assert.equal(res.body.checkOutAt, null);
});

test("a second check-in on the same day is rejected with 409", async () => {
  const { cookie } = await signupNewEmployee();
  await request(app).post("/api/attendance/check-in").set("Cookie", cookie);
  const res = await request(app).post("/api/attendance/check-in").set("Cookie", cookie);
  assert.equal(res.status, 409);
  assert.equal(res.body.error.code, "CONFLICT");
});

test("check-out succeeds after a check-in", async () => {
  const { cookie } = await signupNewEmployee();
  await request(app).post("/api/attendance/check-in").set("Cookie", cookie);
  const res = await request(app).post("/api/attendance/check-out").set("Cookie", cookie);
  assert.equal(res.status, 200);
  assert.ok(res.body.checkOutAt);
});

test("check-out without a prior check-in is rejected", async () => {
  const { cookie } = await signupNewEmployee();
  const res = await request(app).post("/api/attendance/check-out").set("Cookie", cookie);
  assert.equal(res.status, 422);
  assert.equal(res.body.error.code, "VALIDATION_ERROR");
});

test("employee sees only their own attendance history", async () => {
  const { cookie } = await signupNewEmployee();
  await request(app).post("/api/attendance/check-in").set("Cookie", cookie);
  const res = await request(app).get("/api/attendance/me").set("Cookie", cookie);
  assert.equal(res.status, 200);
  assert.ok(Array.isArray(res.body));
  assert.ok(res.body.length >= 1);
});

test("a plain employee cannot list all attendance (403)", async () => {
  const cookie = await loginAs("alice@dayflow.dev");
  const res = await request(app).get("/api/attendance").set("Cookie", cookie);
  assert.equal(res.status, 403);
});

test("admin/HR can list attendance for all employees, with employee summaries attached", async () => {
  const adminCookie = await loginAs("admin@dayflow.dev");
  const { cookie: workerCookie } = await signupNewEmployee();
  await request(app).post("/api/attendance/check-in").set("Cookie", workerCookie);

  const res = await request(app).get("/api/attendance").set("Cookie", adminCookie);
  assert.equal(res.status, 200);
  assert.ok(res.body.length >= 1);
  assert.ok(res.body[0].employee, "admin attendance rows must include an employee summary");
  assert.ok("fullName" in res.body[0].employee);
});
