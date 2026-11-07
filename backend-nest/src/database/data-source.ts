import 'dotenv/config';
import { DataSource } from 'typeorm';
import { buildDbOptions } from './db.config';

// DataSource dùng cho script (seed) bên ngoài Nest
export const AppDataSource = new DataSource(buildDbOptions(process.env));
