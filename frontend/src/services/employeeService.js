import { USE_MOCK_API } from "../config.js";
import { employeesApi } from "../api/employees.js";
import { mockEmployeesApi } from "../mocks/employees.js";

const impl = USE_MOCK_API ? mockEmployeesApi : employeesApi;

export const employeeService = {
  getMe: () => impl.getMe(),
  updateMe: (payload) => impl.updateMe(payload),
  list: (params) => impl.list(params),
  getById: (id) => impl.getById(id),
  update: (id, payload) => impl.update(id, payload),
};
