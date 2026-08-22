import { db, persist } from "./db.js";
import { badRequest, delay, forbidden, notFound, paginate, unauthorized } from "./utils.js";
import { isAdminRole } from "../utils/constants.js";

function currentSession() {
  const userId = db.sessionUserId;
  if (!userId) throw unauthorized("You are not signed in.");
  const user = db.users.find((u) => u.id === userId);
  if (!user) throw unauthorized("You are not signed in.");
  const employee = db.employees.find((e) => e.userId === user.id);
  return { user, employee };
}

function toEmployeeDto(employee) {
  const user = db.users.find((u) => u.id === employee.userId);
  return {
    id: employee.id,
    employeeCode: employee.employeeCode,
    fullName: employee.fullName,
    email: user?.email ?? null,
    role: user?.role ?? "employee",
    phone: employee.phone,
    address: employee.address,
    jobTitle: employee.jobTitle,
    department: employee.department,
    dateJoined: employee.dateJoined,
    profilePictureUrl: employee.profilePictureUrl,
  };
}

const EMPLOYEE_SELF_EDITABLE_FIELDS = ["phone", "address", "profilePictureUrl"];
const ADMIN_EDITABLE_FIELDS = ["fullName", "phone", "address", "jobTitle", "department", "dateJoined", "profilePictureUrl"];

export const mockEmployeesApi = {
  async getMe() {
    await delay();
    const { employee } = currentSession();
    if (!employee) throw notFound("Employee profile not found.");
    return toEmployeeDto(employee);
  },

  async updateMe(payload) {
    await delay();
    const { employee } = currentSession();
    if (!employee) throw notFound("Employee profile not found.");
    for (const key of Object.keys(payload)) {
      if (!EMPLOYEE_SELF_EDITABLE_FIELDS.includes(key)) {
        throw forbidden(`Field "${key}" cannot be edited by an employee.`);
      }
    }
    if (payload.phone !== undefined && payload.phone && !/^[\d+\-\s()]{6,20}$/.test(payload.phone)) {
      throw badRequest("Enter a valid phone number.", { phone: "Enter a valid phone number." });
    }
    Object.assign(employee, payload, { updatedAt: new Date().toISOString() });
    persist();
    return toEmployeeDto(employee);
  },

  async list({ department, search, page, limit } = {}) {
    await delay();
    const { user } = currentSession();
    if (!isAdminRole(user.role)) throw forbidden("Only Admin/HR can view all employees.");
    let results = db.employees.map(toEmployeeDto);
    if (department) results = results.filter((e) => e.department === department);
    if (search) {
      const q = search.trim().toLowerCase();
      results = results.filter(
        (e) =>
          e.fullName.toLowerCase().includes(q) ||
          e.employeeCode.toLowerCase().includes(q) ||
          (e.email || "").toLowerCase().includes(q)
      );
    }
    results.sort((a, b) => a.fullName.localeCompare(b.fullName));
    return paginate(results, { page, limit });
  },

  async getById(id) {
    await delay();
    const { user } = currentSession();
    if (!isAdminRole(user.role)) throw forbidden("Only Admin/HR can view employee details.");
    const employee = db.employees.find((e) => e.id === id);
    if (!employee) throw notFound("Employee not found.");
    return toEmployeeDto(employee);
  },

  async update(id, payload) {
    await delay();
    const { user } = currentSession();
    if (!isAdminRole(user.role)) throw forbidden("Only Admin/HR can update employee records.");
    const employee = db.employees.find((e) => e.id === id);
    if (!employee) throw notFound("Employee not found.");
    for (const key of Object.keys(payload)) {
      if (!ADMIN_EDITABLE_FIELDS.includes(key)) {
        throw forbidden(`Field "${key}" cannot be edited.`);
      }
    }
    Object.assign(employee, payload, { updatedAt: new Date().toISOString() });
    persist();
    return toEmployeeDto(employee);
  },
};

export { toEmployeeDto };
