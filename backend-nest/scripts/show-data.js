const fs = require('fs');
const initSqlJs = require('sql.js');

(async () => {
  const file = process.env.SQLITE_PATH || 'data/library.sqlite';
  const SQL = await initSqlJs();
  const db = new SQL.Database(fs.readFileSync(file));

  const tables = db.exec("SELECT name FROM sqlite_master WHERE type='table'")[0].values.map((r) => r[0]);
  console.log('Các bảng:', tables.join(', '));

  for (const t of ['users', 'readers']) {
    if (!tables.includes(t)) continue;
    const res = db.exec(`SELECT * FROM ${t}`);
    console.log(`\n=== Bảng ${t} ===`);
    if (!res.length) { console.log('(chưa có dòng nào)'); continue; }
    const { columns, values } = res[0];
    console.table(values.map((v) => Object.fromEntries(columns.map((c, i) => [c, c === 'password_hash' || c === 'refresh_token_hash' ? '***đã băm***' : v[i]]))));
  }
})();