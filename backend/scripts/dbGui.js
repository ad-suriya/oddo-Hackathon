// Minimal local-only database browser: table list + row viewer + a SQL
// query box. Built in-house (rather than pulling in a third-party GUI
// package) after sqlpad turned out deprecated/critically vulnerable on npm
// and dbgate's standalone-server story was unclear. Reuses the app's own
// `pool`, so it points at whatever DB_* the backend is configured for.
//
// Dev-only. Not mounted on the main app, not authenticated — do not expose
// this port beyond localhost.
import express from "express";
import { pool } from "../src/repositories/db.js";

const PORT = process.env.DB_GUI_PORT || 4001;
const app = express();
app.use(express.json());

app.get("/api/tables", async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT table_name,
              (SELECT count(*) FROM information_schema.columns c WHERE c.table_name = t.table_name) AS column_count
       FROM information_schema.tables t
       WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
       ORDER BY table_name`
    );
    const withCounts = await Promise.all(
      rows.map(async (r) => {
        const { rows: countRows } = await pool.query(`SELECT count(*)::int AS n FROM "${r.table_name}"`);
        return { ...r, row_count: countRows[0].n };
      })
    );
    res.json(withCounts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/table/:name", async (req, res) => {
  const { name } = req.params;
  const limit = Math.min(Number(req.query.limit) || 100, 500);
  const offset = Number(req.query.offset) || 0;
  try {
    const check = await pool.query(
      `SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = $1`,
      [name]
    );
    if (!check.rows.length) return res.status(404).json({ error: "Unknown table" });

    const { rows: cols } = await pool.query(
      `SELECT column_name, data_type FROM information_schema.columns WHERE table_name = $1 ORDER BY ordinal_position`,
      [name]
    );
    const data = await pool.query(`SELECT * FROM "${name}" ORDER BY 1 LIMIT $1 OFFSET $2`, [limit, offset]);
    res.json({ columns: cols, rows: data.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/query", async (req, res) => {
  const { sql } = req.body || {};
  if (!sql || typeof sql !== "string") return res.status(400).json({ error: "Missing sql" });
  try {
    const result = await pool.query(sql);
    res.json({ columns: result.fields?.map((f) => ({ column_name: f.name })) || [], rows: result.rows, rowCount: result.rowCount });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get("/", (req, res) => {
  res.type("html").send(HTML);
});

app.listen(PORT, () => {
  console.log(`DB browser running at http://localhost:${PORT}`);
});

const HTML = `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<title>Dayflow DB Browser</title>
<style>
  :root {
    --bg: #0c0c0d; --panel: #17171a; --border: #292929; --text: #f5f5f5; --muted: #9a9a9a;
    --accent: #e91e46; --page: #f8f7f6; --card: #ffffff; --ink: #0f172a; --ink-muted: #64748b; --line: #e2e8f0;
  }
  * { box-sizing: border-box; }
  body { margin: 0; font-family: -apple-system, "Segoe UI", Inter, sans-serif; height: 100vh; display: flex; background: var(--page); color: var(--ink); }
  aside { width: 260px; flex-shrink: 0; background: var(--bg); color: var(--text); display: flex; flex-direction: column; padding: 16px 10px; overflow-y: auto; }
  aside h1 { font-size: 15px; margin: 4px 10px 16px; color: var(--text); }
  .table-item { display: flex; justify-content: space-between; padding: 8px 10px; border-radius: 8px; color: var(--muted); cursor: pointer; font-size: 13px; }
  .table-item:hover { background: rgba(255,255,255,0.06); color: var(--text); }
  .table-item.active { background: rgba(233,30,70,0.14); color: var(--accent); }
  .table-item .count { font-variant-numeric: tabular-nums; opacity: 0.7; }
  main { flex: 1; display: flex; flex-direction: column; min-width: 0; }
  .toolbar { padding: 16px 24px; border-bottom: 1px solid var(--line); display: flex; gap: 10px; align-items: center; background: var(--card); }
  .toolbar h2 { margin: 0; font-size: 18px; flex: 1; }
  textarea { width: 100%; font-family: ui-monospace, Consolas, monospace; font-size: 13px; padding: 10px; border: 1px solid var(--line); border-radius: 8px; resize: vertical; }
  button { background: var(--accent); color: #fff; border: none; border-radius: 8px; padding: 8px 16px; font-size: 13px; font-weight: 600; cursor: pointer; }
  button:hover { background: #c8163a; }
  .query-panel { padding: 16px 24px; border-bottom: 1px solid var(--line); background: var(--card); display: flex; gap: 10px; align-items: flex-start; }
  .query-panel textarea { height: 60px; }
  .results { flex: 1; overflow: auto; padding: 0 24px 24px; }
  table { border-collapse: collapse; width: 100%; background: var(--card); font-size: 13px; }
  th { position: sticky; top: 0; background: #f2f1ef; text-align: left; padding: 8px 12px; border-bottom: 1px solid var(--line); font-size: 11px; text-transform: uppercase; letter-spacing: 0.03em; color: var(--ink-muted); }
  td { padding: 8px 12px; border-bottom: 1px solid var(--line); font-variant-numeric: tabular-nums; white-space: nowrap; max-width: 320px; overflow: hidden; text-overflow: ellipsis; }
  tr:hover td { background: #fafafa; }
  .muted { color: var(--ink-muted); padding: 24px; }
  .error { color: #dc2626; padding: 16px 24px; font-family: ui-monospace, monospace; font-size: 13px; }
</style>
</head>
<body>
  <aside>
    <h1>Dayflow — live DB</h1>
    <div id="tableList"></div>
  </aside>
  <main>
    <div class="toolbar"><h2 id="title">Select a table</h2></div>
    <div class="query-panel">
      <textarea id="sql" placeholder="SELECT * FROM employees LIMIT 20;"></textarea>
      <button onclick="runQuery()">Run SQL</button>
    </div>
    <div class="results" id="results"><p class="muted">Pick a table on the left, or write a query above.</p></div>
  </main>
<script>
async function loadTables() {
  const tables = await fetch('/api/tables').then(r => r.json());
  const list = document.getElementById('tableList');
  list.innerHTML = tables.map(t =>
    '<div class="table-item" data-name="' + t.table_name + '" onclick="loadTable(\\'' + t.table_name + '\\')">' +
    '<span>' + t.table_name + '</span><span class="count">' + t.row_count + '</span></div>'
  ).join('');
}
function renderRows(columns, rows) {
  if (!rows.length) return '<p class="muted">No rows.</p>';
  const cols = columns.map(c => c.column_name);
  return '<table><thead><tr>' + cols.map(c => '<th>' + c + '</th>').join('') + '</tr></thead><tbody>' +
    rows.map(r => '<tr>' + cols.map(c => '<td title="' + escapeHtml(String(r[c] ?? '')) + '">' + escapeHtml(String(r[c] ?? '')) + '</td>').join('') + '</tr>').join('') +
    '</tbody></table>';
}
function escapeHtml(s) { return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
async function loadTable(name) {
  document.querySelectorAll('.table-item').forEach(el => el.classList.toggle('active', el.dataset.name === name));
  document.getElementById('title').textContent = name;
  document.getElementById('results').innerHTML = '<p class="muted">Loading…</p>';
  const data = await fetch('/api/table/' + name).then(r => r.json());
  if (data.error) { document.getElementById('results').innerHTML = '<p class="error">' + data.error + '</p>'; return; }
  document.getElementById('results').innerHTML = renderRows(data.columns, data.rows);
}
async function runQuery() {
  const sql = document.getElementById('sql').value.trim();
  if (!sql) return;
  document.getElementById('title').textContent = 'Query result';
  document.getElementById('results').innerHTML = '<p class="muted">Running…</p>';
  const res = await fetch('/api/query', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sql }) });
  const data = await res.json();
  if (data.error) { document.getElementById('results').innerHTML = '<p class="error">' + data.error + '</p>'; return; }
  document.getElementById('results').innerHTML = renderRows(data.columns, data.rows) + '<p class="muted">' + data.rowCount + ' row(s)</p>';
}
loadTables();
</script>
</body>
</html>`;
