import { config } from "../config/index.js";
import { findValidSessionByTokenHash } from "../repositories/sessionsRepo.js";
import { findUserById } from "../repositories/usersRepo.js";
import { findEmployeeByUserId } from "../repositories/employeesRepo.js";
import { hashSessionToken } from "../utils/session.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { UnauthorizedError, ForbiddenError } from "../utils/errors.js";

export const requireAuth = asyncHandler(async function requireAuth(req, res, next) {
  const token = req.signedCookies?.[config.session.cookieName];
  if (!token) throw new UnauthorizedError("You are not signed in.");

  const session = await findValidSessionByTokenHash(hashSessionToken(token));
  if (!session) throw new UnauthorizedError("Your session has expired. Please sign in again.");

  const user = await findUserById(session.user_id);
  if (!user) throw new UnauthorizedError("You are not signed in.");

  const employee = await findEmployeeByUserId(user.id);

  req.currentUser = user;
  req.currentEmployee = employee;
  req.sessionTokenHash = session.token_hash;
  next();
});

export function requireRole(...roles) {
  return function checkRole(req, res, next) {
    if (!req.currentUser || !roles.includes(req.currentUser.role)) {
      return next(new ForbiddenError("You do not have permission to perform this action."));
    }
    next();
  };
}
