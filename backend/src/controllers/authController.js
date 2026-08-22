import { config } from "../config/index.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ConflictError, UnauthorizedError, ValidationError } from "../utils/errors.js";
import { validateSignupPayload, validateLoginPayload } from "../validation/authValidation.js";
import { hashPassword, verifyPassword } from "../utils/password.js";
import { generateSessionToken, hashSessionToken } from "../utils/session.js";
import { serializeAuthUser } from "../serializers/authSerializer.js";
import { findUserByEmail, createUser } from "../repositories/usersRepo.js";
import {
  findEmployeeByCode,
  findEmployeeByUserId,
  createEmployee,
} from "../repositories/employeesRepo.js";
import { upsertSalary } from "../repositories/payrollRepo.js";
import { createSession, deleteSessionByTokenHash } from "../repositories/sessionsRepo.js";

function cookieOptions(maxAgeMs) {
  return {
    httpOnly: true,
    secure: config.isProduction,
    sameSite: config.isProduction ? "none" : "lax",
    // Omitting maxAge makes it a browser session cookie (cleared on
    // browser close) — used when the user didn't check "remember me".
    ...(maxAgeMs ? { maxAge: maxAgeMs } : {}),
  };
}

async function startSession(res, userId, rememberMe) {
  const token = generateSessionToken();
  const maxAgeMs = rememberMe ? config.session.rememberMeMaxAgeMs : config.session.defaultMaxAgeMs;
  const expiresAt = new Date(Date.now() + maxAgeMs);
  await createSession({ tokenHash: hashSessionToken(token), userId, expiresAt });
  res.cookie(config.session.cookieName, token, {
    ...cookieOptions(rememberMe ? maxAgeMs : undefined),
    signed: true,
  });
}

export const signup = asyncHandler(async function signup(req, res) {
  const { fullName, employeeCode, email, password } = req.body || {};
  validateSignupPayload({ fullName, employeeCode, email, password });

  const normalizedEmail = email.trim().toLowerCase();
  const trimmedCode = employeeCode.trim();

  if (await findUserByEmail(normalizedEmail)) {
    throw new ConflictError("An account with this email already exists.");
  }
  if (await findEmployeeByCode(trimmedCode)) {
    throw new ConflictError("This employee ID is already registered.");
  }

  // Public signup always creates role="employee" and ignores any role the
  // client might send — see docs/DECISIONS.md ("Public Signup Cannot
  // Choose Admin/HR Role"). Do not read req.body.role here.
  const passwordHash = await hashPassword(password);
  const user = await createUser({ email: normalizedEmail, passwordHash, role: "employee" });
  const employee = await createEmployee({ userId: user.id, employeeCode: trimmedCode, fullName: fullName.trim() });
  await upsertSalary(employee.id, { basicPay: 0, allowances: 0, deductions: 0, currency: "INR", updatedBy: null });

  await startSession(res, user.id, true);
  res.status(201).json(serializeAuthUser(user, employee));
});

export const login = asyncHandler(async function login(req, res) {
  const { email, password, rememberMe = true } = req.body || {};
  validateLoginPayload({ email, password });

  const normalizedEmail = email.trim().toLowerCase();
  const user = await findUserByEmail(normalizedEmail);
  if (!user || !(await verifyPassword(password, user.password_hash))) {
    throw new UnauthorizedError("Incorrect email or password.");
  }

  const employee = await findEmployeeByUserId(user.id);
  await startSession(res, user.id, Boolean(rememberMe));
  res.json(serializeAuthUser(user, employee));
});

export const verifyEmail = asyncHandler(async function verifyEmailHandler(req, res) {
  const { token } = req.body || {};
  if (!token) throw new ValidationError("A verification token is required.", { token: "Required." });
  // Signup auto-verifies (see docs/FRONTEND_HANDOFF.md "Known gaps —
  // email verification"); this endpoint exists for API-contract parity
  // with docs/API.md but there is no pending-verification state to clear.
  res.json({ verified: true });
});

export const logout = asyncHandler(async function logout(req, res) {
  if (req.sessionTokenHash) await deleteSessionByTokenHash(req.sessionTokenHash);
  res.clearCookie(config.session.cookieName, cookieOptions());
  res.status(204).send();
});

export const me = asyncHandler(async function me(req, res) {
  const employee = req.currentEmployee || (await findEmployeeByUserId(req.currentUser.id));
  res.json(serializeAuthUser(req.currentUser, employee));
});
