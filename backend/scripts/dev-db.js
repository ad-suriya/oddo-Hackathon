// Local development convenience: this sandbox has no system-installed
// PostgreSQL (no `psql`, no Docker). `embedded-postgres` downloads real
// PostgreSQL server binaries and runs them from node_modules — same wire
// protocol, same SQL, nothing mocked. It exists purely so `npm run dev:db`
// works on a machine with nothing preinstalled; a real deployment should
// point DB_HOST/DB_PORT/... (see backend/../.env.example) at an actual
// managed or self-hosted PostgreSQL instance instead of using this.
//
// Data directory: backend/.pgdata (gitignored). Keeps running until
// Ctrl+C so `npm run migrate` / `npm run seed` / `npm run dev` can connect
// to it in other terminals.
import path from "node:path";
import { fileURLToPath } from "node:url";
import { existsSync } from "node:fs";
import EmbeddedPostgres from "embedded-postgres";
import { config } from "../src/config/index.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const databaseDir = path.resolve(__dirname, "../.pgdata");

const pg = new EmbeddedPostgres({
  databaseDir,
  user: config.db.user,
  password: config.db.password || "postgres",
  port: config.db.port,
  persistent: true,
});

async function main() {
  // initialise() runs initdb, which refuses to run against a non-empty
  // directory — only run it the first time this data dir is used, so
  // `npm run dev:db` is safe to re-run against an existing cluster.
  if (existsSync(path.join(databaseDir, "PG_VERSION"))) {
    console.log(`Existing PostgreSQL data directory found at ${databaseDir}, skipping initdb.`);
  } else {
    console.log(`Initializing embedded PostgreSQL at ${databaseDir} ...`);
    await pg.initialise();
  }
  await pg.start();
  console.log(`PostgreSQL is running on 127.0.0.1:${config.db.port}`);

  await pg.createDatabase(config.db.database).catch(() => {
    // already exists
  });
  console.log(`Database "${config.db.database}" ready.`);
  console.log("Leave this running, then in another terminal: npm run migrate && npm run seed");

  const shutdown = async () => {
    console.log("\nStopping embedded PostgreSQL...");
    await pg.stop();
    process.exit(0);
  };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
