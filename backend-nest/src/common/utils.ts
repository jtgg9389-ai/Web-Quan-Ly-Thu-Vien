import { Repository } from 'typeorm';

// Ngày dạng 'YYYY-MM-DD' theo giờ máy chủ
export const today = () => {
  const d = new Date();
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
};
export const addDays = (date: string, n: number) => new Date(Date.parse(date) + n * 864e5).toISOString().slice(0, 10);
export const diffDays = (a: string, b: string) => Math.round((Date.parse(a) - Date.parse(b)) / 864e5);

// Lỗi trùng khóa duy nhất (MySQL và SQLite)
export const isDuplicate = (e: any) => {
  const c = e?.code || e?.driverError?.code;
  return c === 'ER_DUP_ENTRY' || c === 'SQLITE_CONSTRAINT_UNIQUE' || /UNIQUE constraint failed/i.test(e?.message || '');
};

// Sinh mã tiếp theo: B001, R001, P001...
export async function nextCode(repo: Repository<any>, prefix: string) {
  const r = await repo.createQueryBuilder('t').select('MAX(t.id)', 'max').getRawOne();
  return prefix + String((Number(r?.max) || 0) + 1).padStart(3, '0');
}

export const paging = (q: { page?: string; limit?: string }) => {
  const page = Math.max(1, parseInt(q.page || '1', 10) || 1);
  const limit = Math.min(500, Math.max(1, parseInt(q.limit || '100', 10) || 100));
  return { page, limit, skip: (page - 1) * limit };
};
