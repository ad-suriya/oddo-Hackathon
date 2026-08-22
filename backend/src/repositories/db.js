import pg from "pg";
import { config } from "../config/index.js";

const { Pool } = pg;

export const pool = new Pool(config.db);

export async function checkDatabaseConnection() {
  await pool.query("SELECT 1");
}
