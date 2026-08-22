import { Router } from "express";
import * as authController from "../controllers/authController.js";
import { requireAuth } from "../middleware/auth.js";
import { loginLimiter, signupLimiter } from "../middleware/rateLimit.js";

export const authRouter = Router();

authRouter.post("/signup", signupLimiter, authController.signup);
authRouter.post("/login", loginLimiter, authController.login);
authRouter.post("/verify-email", authController.verifyEmail);
authRouter.post("/logout", requireAuth, authController.logout);
authRouter.get("/me", requireAuth, authController.me);
