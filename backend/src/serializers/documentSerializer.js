import { toIsoString } from "./dateHelpers.js";

export function serializeDocument(row) {
  return {
    id: row.id,
    employeeId: row.employee_id,
    fileName: row.file_name,
    fileType: row.file_type,
    fileSizeBytes: Number(row.file_size_bytes),
    uploadedByName: row.uploaded_by_name ?? null,
    createdAt: toIsoString(row.created_at),
  };
}
