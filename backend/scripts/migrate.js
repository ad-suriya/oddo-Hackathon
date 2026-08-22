// Applies database/migrations/*.sql, in filename order, against the
// database configured by backend/src/config. This is a thin runner around
// the plain SQL files that remain the source of truth for the schema (see
// docs/DECISIONS.md "Use Database Migrations") — it exists because `psql`
// is not assumed to be installed everywhere the backend is set up.
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";
import { config } from "../src/config/index.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const migrationsDir = path.resolve(__dirname, "../../database/migrations");

async function main() {
  const client = new pg.Client(config.db);
  await client.connect();
  try {
    await client.query(
      `CREATE TABLE IF NOT EXISTS schema_migrations (
         filename TEXT PRIMARY KEY,
         applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
       )`
    );

    const files = (await readdir(migrationsDir))
      .filter((f) => f.endsWith(".sql"))
      .sort();

    const { rows } = await client.query("SELECT filename FROM schema_migrations");
    const applied = new Set(rows.map((r) => r.filename));

    for (const file of files) {
      if (applied.has(file)) {
        console.log(`skip  ${file} (already applied)`);
        continue;
      }
      const sql = await readFile(path.join(migrationsDir, file), "utf8");
      console.log(`apply ${file}`);
      await client.query("BEGIN");
      try {
        await client.query(sql);
        await client.query("INSERT INTO schema_migrations (filename) VALUES ($1)", [file]);
        await client.query("COMMIT");
      } catch (err) {
        await client.query("ROLLBACK");
        throw new Error(`Migration ${file} failed: ${err.message}`);
      }
    }
    console.log("Migrations up to date.");
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
