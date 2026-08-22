import { test } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import { app, loginAs, signupNewEmployee } from "./helpers/testApp.js";

test("employee sees their own payroll with a correctly computed netPay", async () => {
  const { cookie } = await signupNewEmployee();
  const res = await request(app).get("/api/payroll/me").set("Cookie", cookie);
  assert.equal(res.status, 200);
  assert.equal(res.body.netPay, res.body.basicPay + res.body.allowances - res.body.deductions);
  assert.ok("payPeriod" in res.body);
  assert.ok("paymentStatus" in res.body);
});

test("employee cannot modify their own payroll (403)", async () => {
  const { body, cookie } = await signupNewEmployee();
  const res = await request(app)
    .patch(`/api/payroll/${body.employee.id}`)
    .set("Cookie", cookie)
    .send({ basicPay: 999999 });
  assert.equal(res.status, 403);
});

test("a plain employee cannot list payroll for everyone (403)", async () => {
  const cookie = await loginAs("alice@dayflow.dev");
  const res = await request(app).get("/api/payroll").set("Cookie", cookie);
  assert.equal(res.status, 403);
});

test("admin can update salary structure and netPay recomputes", async () => {
  const adminCookie = await loginAs("admin@dayflow.dev");
  const { body } = await signupNewEmployee();

  const res = await request(app)
    .patch(`/api/payroll/${body.employee.id}`)
    .set("Cookie", adminCookie)
    .send({ basicPay: 50000, allowances: 4000, deductions: 1000 });

  assert.equal(res.status, 200);
  assert.equal(res.body.basicPay, 50000);
  assert.equal(res.body.netPay, 53000);
});

test("negative salary values are rejected with 422", async () => {
  const adminCookie = await loginAs("admin@dayflow.dev");
  const { body } = await signupNewEmployee();

  const res = await request(app)
    .patch(`/api/payroll/${body.employee.id}`)
    .set("Cookie", adminCookie)
    .send({ basicPay: -1 });

  assert.equal(res.status, 422);
  assert.equal(res.body.error.code, "VALIDATION_ERROR");
});

test("PATCH /payroll/:employeeId for a nonexistent employee returns 404", async () => {
  const adminCookie = await loginAs("admin@dayflow.dev");
  const res = await request(app)
    .patch("/api/payroll/00000000-0000-0000-0000-000000000000")
    .set("Cookie", adminCookie)
    .send({ basicPay: 1000 });
  assert.equal(res.status, 404);
});
