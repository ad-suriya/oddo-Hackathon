import { test } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import { app, loginAs, signupNewEmployee } from "./helpers/testApp.js";

async function createLeaveRequest(cookie, overrides = {}) {
  return request(app)
    .post("/api/leave-requests")
    .set("Cookie", cookie)
    .send({ leaveType: "paid", startDate: "2027-01-10", endDate: "2027-01-12", remarks: "Test leave", ...overrides });
}

test("employee can create a leave request", async () => {
  const { cookie } = await signupNewEmployee();
  const res = await createLeaveRequest(cookie);
  assert.equal(res.status, 201);
  assert.equal(res.body.status, "pending");
  assert.equal(res.body.reviewer, null);
});

test("invalid leave payload is rejected with 422 and field details", async () => {
  const { cookie } = await signupNewEmployee();
  const res = await createLeaveRequest(cookie, { leaveType: "not-a-type", startDate: "", endDate: "" });
  assert.equal(res.status, 422);
  assert.ok(res.body.error.details.leaveType);
});

test("employee sees only their own leave requests", async () => {
  const { cookie } = await signupNewEmployee();
  await createLeaveRequest(cookie);
  const res = await request(app).get("/api/leave-requests/me").set("Cookie", cookie);
  assert.equal(res.status, 200);
  assert.ok(res.body.every((r) => r.employee));
});

test("a plain employee cannot list all leave requests (403)", async () => {
  const cookie = await loginAs("alice@dayflow.dev");
  const res = await request(app).get("/api/leave-requests").set("Cookie", cookie);
  assert.equal(res.status, 403);
});

test("admin can view, approve, and reject leave requests", async () => {
  const adminCookie = await loginAs("admin@dayflow.dev");
  const { cookie: workerCookie } = await signupNewEmployee();

  const created = await createLeaveRequest(workerCookie);
  const listRes = await request(app).get("/api/leave-requests").set("Cookie", adminCookie);
  assert.equal(listRes.status, 200);
  assert.ok(listRes.body.some((r) => r.id === created.body.id));

  const approveRes = await request(app)
    .patch(`/api/leave-requests/${created.body.id}/approve`)
    .set("Cookie", adminCookie)
    .send({ reviewerComment: "Approved" });
  assert.equal(approveRes.status, 200);
  assert.equal(approveRes.body.status, "approved");
  assert.ok(approveRes.body.reviewer);

  const secondApprove = await request(app)
    .patch(`/api/leave-requests/${created.body.id}/approve`)
    .set("Cookie", adminCookie)
    .send({});
  assert.equal(secondApprove.status, 422, "an already-approved request cannot be approved again");

  const created2 = await createLeaveRequest(workerCookie, { startDate: "2027-02-01", endDate: "2027-02-02" });
  const rejectRes = await request(app)
    .patch(`/api/leave-requests/${created2.body.id}/reject`)
    .set("Cookie", adminCookie)
    .send({ reviewerComment: "Not now" });
  assert.equal(rejectRes.status, 200);
  assert.equal(rejectRes.body.status, "rejected");

  const secondReject = await request(app)
    .patch(`/api/leave-requests/${created2.body.id}/reject`)
    .set("Cookie", adminCookie)
    .send({});
  assert.equal(secondReject.status, 422, "an already-rejected request cannot be rejected again");
});

test("a plain employee cannot approve leave requests (403)", async () => {
  const cookie = await loginAs("alice@dayflow.dev");
  const { cookie: workerCookie } = await signupNewEmployee();
  const created = await createLeaveRequest(workerCookie);

  const res = await request(app).patch(`/api/leave-requests/${created.body.id}/approve`).set("Cookie", cookie).send({});
  assert.equal(res.status, 403);
});
