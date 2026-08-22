import { USE_MOCK_API } from "../config.js";
import { documentsApi } from "../api/documents.js";
import { mockDocumentsApi } from "../mocks/documents.js";

const impl = USE_MOCK_API ? mockDocumentsApi : documentsApi;

export const documentService = {
  getMine: () => impl.getMine(),
  getForEmployee: (employeeId) => impl.getForEmployee(employeeId),
};
