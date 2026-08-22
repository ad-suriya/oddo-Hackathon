import { createApp } from "./app.js";
import { config } from "./config/index.js";
import { deleteExpiredSessions } from "./repositories/sessionsRepo.js";

const app = createApp();

const SESSION_SWEEP_INTERVAL_MS = 60 * 60 * 1000;

async function sweepExpiredSessions() {
  try {
    const removed = await deleteExpiredSessions();
    if (removed > 0) console.log(`Swept ${removed} expired session(s).`);
  } catch (err) {
    console.error("Session sweep failed:", err);
  }
}

app.listen(config.port, () => {
  console.log(`Backend listening on http://localhost:${config.port}`);
  // Sessions are already excluded from auth once expired (see
  // findValidSessionByTokenHash) — this just keeps the table from growing
  // forever, since nothing else deletes a row once its cookie is gone.
  sweepExpiredSessions();
  setInterval(sweepExpiredSessions, SESSION_SWEEP_INTERVAL_MS).unref();
});
