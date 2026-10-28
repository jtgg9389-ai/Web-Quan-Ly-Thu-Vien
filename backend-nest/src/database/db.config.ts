import { mkdirSync } from 'fs';
import { dirname } from 'path';
import { DataSourceOptions } from 'typeorm';
import { ENTITIES } from '../entities';

// DB_TYPE=mysql -> MySQL (ở trường); mặc định sqlite (ở nhà, không cần cài gì)
export function buildDbOptions(env: Record<string, string | undefined>): DataSourceOptions {
  const synchronize = (env.DB_SYNC ?? 'true') === 'true';
  if ((env.DB_TYPE || 'sqlite') === 'mysql') {
    return {
      type: 'mysql',
      host: env.DB_HOST || 'localhost',
      port: Number(env.DB_PORT) || 3306,
      username: env.DB_USER || 'root',
      password: env.DB_PASSWORD || '',
      database: env.DB_NAME || 'quan_ly_thu_vien',
      charset: 'utf8mb4',
      entities: ENTITIES,
      synchronize,
    };
  }
  const location = env.SQLITE_PATH || 'data/library.sqlite';
  mkdirSync(dirname(location), { recursive: true });
  // sql.js: SQLite thuần JavaScript, không cần biên dịch, ghi tự động ra file
  return { type: 'sqljs', location, autoSave: true, entities: ENTITIES, synchronize };
}
