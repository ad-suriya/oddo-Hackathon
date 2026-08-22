import { USE_MOCK_API } from "../config.js";
import { attendanceApi } from "../api/attendance.js";
import { mockAttendanceApi } from "../mocks/attendance.js";

const impl = USE_MOCK_API ? mockAttendanceApi : attendanceApi;

export const attendanceService = {
  checkIn: () => impl.checkIn(),
  checkOut: () => impl.checkOut(),
  getMine: (params) => impl.getMine(params),
  list: (params) => impl.list(params),
  getForEmployee: (employeeId, params) => impl.getForEmployee(employeeId, params),
};
