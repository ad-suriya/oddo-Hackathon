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
import EmbeddedPostgres from "embedded-postgres";
import { config } from "../src/config/index.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const pg = new EmbeddedPostgres({
  databaseDir: path.resolve(__dirname, "../.pgdata"),
  user: config.db.user,
  password: config.db.password || "postgres",
  port: config.db.port,
  persistent: true,
});

async function main() {
  console.log(`Initializing embedded PostgreSQL at ${path.resolve(__dirname, "../.pgdata")} ...`);
  await pg.initialise();
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
