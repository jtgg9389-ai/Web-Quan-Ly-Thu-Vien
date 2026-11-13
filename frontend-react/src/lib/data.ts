import { DB, Loan, Reader, Book, User } from '../types'
import { api } from './api'

export const EMPTY: DB = { cfg: { days: 14, fine: 5000 }, books: [], readers: [], loans: [], users: [] }

/* ===== Đổi dữ liệu từ API sang kiểu dữ liệu của giao diện =====
 * id của giao diện là MÃ (B001, R001, P001); pk là id số trong CSDL, dùng khi gọi API. */
export const mapBook = (b: any): Book => ({ pk: b.id, id: b.code, name: b.title, author: b.author, cat: b.category, qty: b.quantity, av: b.available, img: b.image || undefined, desc: b.description || undefined })
export const mapReader = (r: any): Reader => ({ pk: r.id, id: r.code, name: r.fullName, phone: r.phone, addr: r.address })
export const mapLoan = (l: any): Loan => ({ pk: l.id, id: l.code, reader: l.reader?.code ?? '', book: l.book?.code ?? '', borrow: l.borrowDate, due: l.dueDate, ret: l.returnDate, fineAmount: l.fineAmount })
export const mapUser = (u: any): User => ({ pk: u.id, u: u.username, name: u.fullName, role: u.role })

type Page<T> = { data: T[] }

// Tải dữ liệu theo vai trò: nhân viên xem tất cả, độc giả chỉ xem sách và phiếu của mình
export async function loadAll(me: User, rdr: Reader | null): Promise<DB> {
  const staff = me.role !== 'reader'
  const [books, readers, loans, cfg, users] = await Promise.all([
    api<Page<any>>('/books?limit=500'),
    staff ? api<Page<any>>('/readers?limit=500') : null,
    api<Page<any>>(staff ? '/loans?limit=500' : '/loans/my'),
    staff ? api<{ loanDays: number; finePerDay: number }>('/settings') : null,
    me.role === 'admin' ? api<any[]>('/users') : null,
  ])
  return {
    cfg: cfg ? { days: cfg.loanDays, fine: cfg.finePerDay } : EMPTY.cfg,
    books: books.data.map(mapBook),
    readers: readers ? readers.data.map(mapReader) : rdr ? [rdr] : [],
    loans: loans.data.map(mapLoan),
    users: users ? users.map(mapUser) : [],
  }
}
