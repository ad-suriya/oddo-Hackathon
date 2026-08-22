import { Router } from "express";
import * as leaveController from "../controllers/leaveController.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

export const leaveRouter = Router();

leaveRouter.use(requireAuth);

leaveRouter.post("/", leaveController.create);
leaveRouter.get("/me", leaveController.getMine);
leaveRouter.get("/", requireRole("admin", "hr"), leaveController.list);
leaveRouter.patch("/:id/approve", requireRole("admin", "hr"), leaveController.approve);
leaveRouter.patch("/:id/reject", requireRole("admin", "hr"), leaveController.reject);
