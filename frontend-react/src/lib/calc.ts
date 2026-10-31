import { diff, td } from './utils'
import { Book, DB, Loan } from '../types'

/* ===== Tính toán từ dữ liệu ===== */
// Số sách đang cho mượn / còn lại: ưu tiên số liệu backend (độc giả chỉ thấy phiếu của mình nên không tự đếm được)
export const out = (d: DB, id: string) => { const b = d.books.find(x => x.id == id); return b?.av != null ? b.qty - b.av : d.loans.filter(l => l.book == id && !l.ret).length }
export const avail = (d: DB, b: Book) => b.av ?? b.qty - out(d, b.id)
export const late = (l: Loan) => Math.max(0, diff(l.ret || td(), l.due))
export const fine = (d: DB, l: Loan) => l.fineAmount ?? late(l) * d.cfg.fine
export const act = (d: DB) => d.loans.filter(l => !l.ret)
export const ovr = (d: DB) => act(d).filter(l => late(l) > 0)
export const bn = (d: DB, id: string) => d.books.find(b => b.id == id)?.name ?? '(đã xóa)'
export const rn = (d: DB, id: string) => d.readers.find(r => r.id == id)?.name ?? '(đã xóa)'

export const cnt = (a: string[]): [string, number][] => Object.entries(a.reduce<Record<string, number>>((o, x) => (o[x] = (o[x] || 0) + 1, o), {})).sort((a, b) => b[1] - a[1])

export const has = (q: string, ...s: string[]) => s.join(' ').toLowerCase().includes(q.toLowerCase())
