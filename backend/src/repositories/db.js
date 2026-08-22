import pg from "pg";
import { config } from "../config/index.js";

const { Pool } = pg;

// By default node-postgres parses DATE columns into a JS Date at local
// midnight, then a naive .toISOString() shifts it back a day in any
// timezone ahead of UTC (e.g. IST). Returning the raw "YYYY-MM-DD" wire
// text instead sidesteps that entirely — see serializers/dateHelpers.js.
pg.types.setTypeParser(pg.types.builtins.DATE, (value) => value);

export const pool = new Pool(config.db);

export async function checkDatabaseConnection() {
  await pool.query("SELECT 1");
}
