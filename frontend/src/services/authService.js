import { USE_MOCK_API } from "../config.js";
import { authApi } from "../api/auth.js";
import { mockAuthApi } from "../mocks/auth.js";

const impl = USE_MOCK_API ? mockAuthApi : authApi;

export const authService = {
  signup: (payload) => impl.signup(payload),
  login: (payload) => impl.login(payload),
  verifyEmail: (payload) => impl.verifyEmail(payload),
  logout: () => impl.logout(),
  me: () => impl.me(),
};
