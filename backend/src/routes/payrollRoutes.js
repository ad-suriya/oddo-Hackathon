import { Router } from "express";
import * as payrollController from "../controllers/payrollController.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { requireUuidParam } from "../middleware/validateParams.js";

export const payrollRouter = Router();

payrollRouter.use(requireAuth);

payrollRouter.get("/me", payrollController.getMine);
payrollRouter.get("/", requireRole("admin", "hr"), payrollController.list);
payrollRouter.get(
  "/:employeeId",
  requireRole("admin", "hr"),
  requireUuidParam("employeeId"),
  payrollController.getById
);
payrollRouter.patch(
  "/:employeeId",
  requireRole("admin", "hr"),
  requireUuidParam("employeeId"),
  payrollController.update
);
