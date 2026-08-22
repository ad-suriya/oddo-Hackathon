import { db, persist, DEMO_PASSWORD } from "./db.js";
import { badRequest, conflict, delay, makeId, unauthorized } from "./utils.js";

const SESSION_KEY = "dayflow_mock_session_user_id";

function loadSession() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(SESSION_KEY);
}

function saveSession(userId) {
  if (typeof window === "undefined") return;
  if (userId) window.localStorage.setItem(SESSION_KEY, userId);
  else window.localStorage.removeItem(SESSION_KEY);
}

db.sessionUserId = db.sessionUserId || loadSession();

function toAuthUser(user) {
  const employee = db.employees.find((e) => e.userId === user.id) || null;
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    emailVerifiedAt: user.emailVerifiedAt,
    employee: employee
      ? {
          id: employee.id,
          employeeCode: employee.employeeCode,
          fullName: employee.fullName,
          jobTitle: employee.jobTitle,
          department: employee.department,
          profilePictureUrl: employee.profilePictureUrl,
        }
      : null,
  };
}

export const mockAuthApi = {
  async signup({ fullName, employeeCode, email, password }) {
    await delay();
    const errors = {};
    if (!fullName?.trim()) errors.fullName = "Full name is required.";
    if (!employeeCode?.trim()) errors.employeeCode = "Employee ID is required.";
    if (!email?.trim()) errors.email = "Email is required.";
    if (!password || password.length < 8) errors.password = "Password must be at least 8 characters.";
    if (Object.keys(errors).length) throw badRequest("Please fix the highlighted fields.", errors);

    const normalizedEmail = email.trim().toLowerCase();
    if (db.users.some((u) => u.email.toLowerCase() === normalizedEmail)) {
      throw conflict("An account with this email already exists.");
    }
    if (db.employees.some((e) => e.employeeCode.toLowerCase() === employeeCode.trim().toLowerCase())) {
      throw conflict("This employee ID is already registered.");
    }

    const userId = makeId();
    const employeeId = makeId();
    // Public signup always creates role="employee" — see docs/DECISIONS.md
    // ("Public Signup Cannot Choose Admin/HR Role"). Never wire a role
    // selector on the signup form through to this call.
    db.users.push({
      id: userId,
      email: normalizedEmail,
      password,
      role: "employee",
      emailVerifiedAt: new Date().toISOString(),
    });
    db.employees.push({
      id: employeeId,
      userId,
      employeeCode: employeeCode.trim(),
      fullName: fullName.trim(),
      phone: null,
      address: null,
      jobTitle: null,
      department: null,
      dateJoined: new Date().toISOString().slice(0, 10),
      profilePictureUrl: null,
    });
    db.salaries.push({
      id: makeId(),
      employeeId,
      basicPay: 0,
      allowances: 0,
      deductions: 0,
      currency: "INR",
      updatedBy: null,
      updatedAt: new Date().toISOString(),
    });
    persist();

    db.sessionUserId = userId;
    saveSession(userId);
    return toAuthUser(db.users.find((u) => u.id === userId));
  },

  async login({ email, password, rememberMe = true }) {
    await delay();
    const normalizedEmail = (email || "").trim().toLowerCase();
    const user = db.users.find((u) => u.email.toLowerCase() === normalizedEmail);
    if (!user || user.password !== password) {
      throw unauthorized("Incorrect email or password.");
    }
    db.sessionUserId = user.id;
    // "Remember me" unchecked: keep the session in memory only, so a page
    // refresh signs the user out instead of persisting to localStorage.
    if (rememberMe) saveSession(user.id);
    return toAuthUser(user);
  },

  async verifyEmail({ token }) {
    await delay();
    if (!token) throw badRequest("A verification token is required.");
    return { verified: true };
  },

  async logout() {
    await delay(150);
    db.sessionUserId = null;
    saveSession(null);
    return null;
  },

  async me() {
    await delay(200);
    const userId = db.sessionUserId;
    if (!userId) throw unauthorized("You are not signed in.");
    const user = db.users.find((u) => u.id === userId);
    if (!user) throw unauthorized("You are not signed in.");
    return toAuthUser(user);
  },
};

export const MOCK_DEMO_PASSWORD = DEMO_PASSWORD;
