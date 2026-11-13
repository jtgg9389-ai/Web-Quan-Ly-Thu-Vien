const fs = require('fs');
const initSqlJs = require('sql.js');

(async () => {
  const [username, email] = process.argv.slice(2);
  if (!username || !email) {
    console.log('Cách dùng: node scripts/set-email.js <username> <email>');
    process.exit(1);
  }
  const file = process.env.SQLITE_PATH || 'data/library.sqlite';
  const SQL = await initSqlJs();
  const db = new SQL.Database(fs.readFileSync(file));

  const cols = db.exec('PRAGMA table_info(users)')[0].values.map((r) => r[1]);
  if (!cols.includes('email')) {
    console.log('Bảng users chưa có cột email. Hãy chạy backend 1 lần (npm run start:dev) sau khi sửa user.entity.ts, rồi dừng backend và chạy lại script này.');
    console.log('Các cột hiện có:', cols.join(', '));
    process.exit(1);
  }

  db.run('UPDATE users SET email = ? WHERE username = ?', [email.toLowerCase(), username]);
  const changed = db.getRowsModified();
  fs.writeFileSync(file, Buffer.from(db.export()));
  console.log(changed ? `Đã gán email cho tài khoản ${username}` : `Không tìm thấy username "${username}"`);
})();