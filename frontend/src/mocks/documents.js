import { db } from "./db.js";
import { delay, forbidden, notFound, unauthorized } from "./utils.js";
import { isAdminRole } from "../utils/constants.js";

function currentSession() {
  const userId = db.sessionUserId;
  if (!userId) throw unauthorized("You are not signed in.");
  const user = db.users.find((u) => u.id === userId);
  const employee = db.employees.find((e) => e.userId === userId);
  if (!user || !employee) throw unauthorized("You are not signed in.");
  return { user, employee };
}

function toDto(doc) {
  const uploader = doc.uploadedBy ? db.users.find((u) => u.id === doc.uploadedBy) : null;
  const uploaderEmployee = uploader ? db.employees.find((e) => e.userId === uploader.id) : null;
  return {
    id: doc.id,
    employeeId: doc.employeeId,
    fileName: doc.fileName,
    fileType: doc.fileType,
    fileSizeBytes: doc.fileSizeBytes,
    uploadedByName: uploaderEmployee?.fullName ?? null,
    createdAt: doc.createdAt,
  };
}

export const mockDocumentsApi = {
  async getMine() {
    await delay();
    const { employee } = currentSession();
    return db.documents
      .filter((d) => d.employeeId === employee.id)
      .map(toDto)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  async getForEmployee(employeeId) {
    await delay();
    const { user } = currentSession();
    if (!isAdminRole(user.role)) throw forbidden("Only Admin/HR can view another employee's documents.");
    const employee = db.employees.find((e) => e.id === employeeId);
    if (!employee) throw notFound("Employee not found.");
    return db.documents
      .filter((d) => d.employeeId === employeeId)
      .map(toDto)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },
};
