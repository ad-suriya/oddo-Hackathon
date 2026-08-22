import { Router } from "express";
import { getHealth } from "../controllers/healthController.js";
import { authRouter } from "./authRoutes.js";
import { employeesRouter } from "./employeesRoutes.js";
import { attendanceRouter } from "./attendanceRoutes.js";
import { leaveRouter } from "./leaveRoutes.js";
import { payrollRouter } from "./payrollRoutes.js";

export const router = Router();

router.get("/health", getHealth);

router.use("/auth", authRouter);
router.use("/employees", employeesRouter);
router.use("/attendance", attendanceRouter);
router.use("/leave-requests", leaveRouter);
router.use("/payroll", payrollRouter);
