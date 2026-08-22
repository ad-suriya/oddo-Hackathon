import { checkDatabaseConnection } from "../repositories/db.js";

export async function getHealth(req, res) {
  try {
    await checkDatabaseConnection();
    res.json({ status: "ok", database: "connected" });
  } catch (err) {
    res.status(503).json({ status: "ok", database: "unreachable" });
  }
}
