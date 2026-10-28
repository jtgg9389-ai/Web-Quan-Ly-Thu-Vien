// Tạo database nếu chưa có (TypeORM chỉ tạo bảng, không tạo database)
require('dotenv').config();
const mysql = require('mysql2/promise');

(async () => {
  const name = process.env.DB_NAME || 'quan_ly_thu_vien';
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
  });
  await conn.query(`CREATE DATABASE IF NOT EXISTS \`${name}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
  console.log(`✅ Database "${name}" đã sẵn sàng.`);
  await conn.end();
})().catch((e) => {
  console.error('❌ Không tạo được database:', e.message);
  process.exit(1);
});
