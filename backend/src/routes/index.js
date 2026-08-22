import { Router } from "express";
import { getHealth } from "../controllers/healthController.js";

export const router = Router();

router.get("/health", getHealth);

// Add feature routers here as they're built, e.g.:
// import { widgetsRouter } from "./widgets.js";
// router.use("/widgets", widgetsRouter);
