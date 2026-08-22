import { Router } from "express";
import * as employeesController from "../controllers/employeesController.js";
import * as documentsController from "../controllers/documentsController.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { requireUuidParam } from "../middleware/validateParams.js";

export const employeesRouter = Router();

employeesRouter.use(requireAuth);

// Literal routes ("/me", "/me/documents") must be registered before the
// "/:id" routes below, or Express will match "me" as an :id param.
employeesRouter.get("/me", employeesController.getMe);
employeesRouter.patch("/me", employeesController.updateMe);
employeesRouter.get("/me/documents", documentsController.getMine);

employeesRouter.get("/", requireRole("admin", "hr"), employeesController.list);
employeesRouter.get("/:id", requireRole("admin", "hr"), requireUuidParam("id"), employeesController.getById);
employeesRouter.patch("/:id", requireRole("admin", "hr"), requireUuidParam("id"), employeesController.update);
employeesRouter.get(
  "/:id/documents",
  requireRole("admin", "hr"),
  requireUuidParam("id"),
  documentsController.getForEmployee
);
