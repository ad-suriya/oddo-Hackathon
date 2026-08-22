import { Router } from "express";
import * as attendanceController from "../controllers/attendanceController.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { requireUuidParam } from "../middleware/validateParams.js";

export const attendanceRouter = Router();

attendanceRouter.use(requireAuth);

attendanceRouter.post("/check-in", attendanceController.checkIn);
attendanceRouter.post("/check-out", attendanceController.checkOut);
attendanceRouter.get("/me", attendanceController.getMine);
attendanceRouter.get("/", requireRole("admin", "hr"), attendanceController.list);
attendanceRouter.get(
  "/:employeeId",
  requireRole("admin", "hr"),
  requireUuidParam("employeeId"),
  attendanceController.getForEmployee
);
