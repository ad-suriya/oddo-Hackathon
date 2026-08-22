import { USE_MOCK_API } from "../config.js";
import { leaveApi } from "../api/leave.js";
import { mockLeaveApi } from "../mocks/leave.js";

const impl = USE_MOCK_API ? mockLeaveApi : leaveApi;

export const leaveService = {
  create: (payload) => impl.create(payload),
  getMine: (params) => impl.getMine(params),
  list: (params) => impl.list(params),
  approve: (id, payload) => impl.approve(id, payload),
  reject: (id, payload) => impl.reject(id, payload),
};
