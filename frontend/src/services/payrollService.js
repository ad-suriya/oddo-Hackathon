import { USE_MOCK_API } from "../config.js";
import { payrollApi } from "../api/payroll.js";
import { mockPayrollApi } from "../mocks/payroll.js";

const impl = USE_MOCK_API ? mockPayrollApi : payrollApi;

export const payrollService = {
  getMine: () => impl.getMine(),
  list: (params) => impl.list(params),
  getById: (employeeId) => impl.getById(employeeId),
  update: (employeeId, payload) => impl.update(employeeId, payload),
};
