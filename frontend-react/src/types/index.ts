/* ===== Kiểu dữ liệu ===== */
export type Role = 'admin' | 'librarian' | 'reader'
export interface Book { id: string; name: string; author: string; cat: string; qty: number; img?: string; desc?: string; pk?: number; av?: number }
export interface Reader { id: string; name: string; phone: string; addr: string; pk?: number }
export interface Loan { id: string; reader: string; book: string; borrow: string; due: string; ret: string | null; pk?: number; fineAmount?: number }
export interface User { u: string; name: string; role: Role; reader?: string; pk?: number }
export interface DB { cfg: { days: number; fine: number }; books: Book[]; readers: Reader[]; loans: Loan[]; users: User[] }
export const ROLE: Record<Role, string> = { admin: 'Quản trị', librarian: 'Thủ thư', reader: 'Độc giả' }
