import { test } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import { app, loginAs, signupNewEmployee } from "./helpers/testApp.js";

test("employee reads own profile via /employees/me", async () => {
  const cookie = await loginAs("alice@dayflow.dev");
  const res = await request(app).get("/api/employees/me").set("Cookie", cookie);
  assert.equal(res.status, 200);
  assert.equal(res.body.email, "alice@dayflow.dev");
  assert.equal(res.body.employeeCode, "EMP0003");
});

test("employee can edit phone, address, and profilePictureUrl", async () => {
  const { cookie } = await signupNewEmployee();
  const res = await request(app)
    .patch("/api/employees/me")
    .set("Cookie", cookie)
    .send({ phone: "+91-9123456780", address: "New Address", profilePictureUrl: "https://example.com/a.png" });

  assert.equal(res.status, 200);
  assert.equal(res.body.phone, "+91-9123456780");
  assert.equal(res.body.address, "New Address");
});

test("employee cannot edit protected fields on their own profile (403)", async () => {
  const { cookie } = await signupNewEmployee();
  const res = await request(app).patch("/api/employees/me").set("Cookie", cookie).send({ fullName: "Hacked Name" });
  assert.equal(res.status, 403);
  assert.equal(res.body.error.code, "FORBIDDEN");
});

test("employee cannot edit role via their own profile (403)", async () => {
  const { cookie } = await signupNewEmployee();
  const res = await request(app).patch("/api/employees/me").set("Cookie", cookie).send({ role: "admin" });
  assert.equal(res.status, 403);
});

test("admin/HR can edit a broader field set on an employee record", async () => {
  const adminCookie = await loginAs("admin@dayflow.dev");
  const { body } = await signupNewEmployee();

  const res = await request(app)
    .patch(`/api/employees/${body.employee.id}`)
    .set("Cookie", adminCookie)
    .send({ jobTitle: "Engineer II", department: "Platform" });

  assert.equal(res.status, 200);
  assert.equal(res.body.jobTitle, "Engineer II");
  assert.equal(res.body.department, "Platform");
});

test("a plain employee is rejected from admin-only employee endpoints (403)", async () => {
  const cookie = await loginAs("alice@dayflow.dev");
  const listRes = await request(app).get("/api/employees").set("Cookie", cookie);
  assert.equal(listRes.status, 403);

  const { body } = await signupNewEmployee();
  const getRes = await request(app).get(`/api/employees/${body.employee.id}`).set("Cookie", cookie);
  assert.equal(getRes.status, 403);
});

test("unauthenticated access to a protected employee endpoint returns 401", async () => {
  const res = await request(app).get("/api/employees/me");
  assert.equal(res.status, 401);
});

test("GET /employees/:id for a nonexistent employee returns 404", async () => {
  const adminCookie = await loginAs("admin@dayflow.dev");
  const res = await request(app)
    .get("/api/employees/00000000-0000-0000-0000-000000000000")
    .set("Cookie", adminCookie);
  assert.equal(res.status, 404);
  assert.equal(res.body.error.code, "NOT_FOUND");
});
