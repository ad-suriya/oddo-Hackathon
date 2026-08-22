import { Router } from "express";
import * as payrollController from "../controllers/payrollController.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

export const payrollRouter = Router();

payrollRouter.use(requireAuth);

payrollRouter.get("/me", payrollController.getMine);
payrollRouter.get("/", requireRole("admin", "hr"), payrollController.list);
payrollRouter.patch("/:employeeId", requireRole("admin", "hr"), payrollController.update);
