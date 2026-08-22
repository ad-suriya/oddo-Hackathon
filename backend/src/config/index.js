import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

// Backend + database config lives in a single .env at the repo root (see
// ../../../.env.example), not inside backend/, so it's shared with the
// migrate/seed scripts. Resolve it by file location, not process.cwd(),
// since `npm run dev` etc. are run with cwd = backend/.
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

const nodeEnv = process.env.NODE_ENV || "development";

export const config = {
  port: process.env.PORT || 4000,
  nodeEnv,
  isProduction: nodeEnv === "production",
  db: {
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME || "hackathon_dev",
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "",
  },
  frontendOrigin: process.env.FRONTEND_ORIGIN || "http://localhost:5173",
  // Signs the session cookie (defense-in-depth against tampering) — the
  // session itself is still an opaque, DB-backed, hashed token, not a JWT.
  // Must be overridden with a real secret outside local development.
  sessionSecret: process.env.SESSION_SECRET || "dev-only-insecure-secret-change-me",
  session: {
    cookieName: "dayflow_session",
    // "Remember me" -> persistent cookie + longer-lived server session.
    // Otherwise the cookie is a browser session cookie (no Max-Age) and the
    // server-side session row is a short-lived safety net.
    rememberMeMaxAgeMs: 30 * 24 * 60 * 60 * 1000,
    defaultMaxAgeMs: 24 * 60 * 60 * 1000,
  },
};
