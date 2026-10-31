import { ReactNode, createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { ApiError, api, onAuthLost, refreshToken, setToken } from '../lib/api'
import { EMPTY, loadAll, mapReader } from '../lib/data'
import { DB, Reader, Role, User } from '../types'

/* ===== Store (React Context): dữ liệu lấy từ API backend, không còn lưu localStorage ===== */
type Err = string | void
interface Store {
  db: DB; me: User | null; msg: string; ready: boolean
  toast: (m: string) => void
  login: (u: string, p: string) => Promise<string | null>
  signup: (d: { u: string; p: string; name: string; phone: string; addr: string }) => Promise<string | null>
  logout: () => Promise<void>
  saveBook: (code: string | undefined, v: Record<string, string>) => Promise<Err>
  delBook: (code: string) => Promise<Err>
  saveReader: (code: string | undefined, v: Record<string, string>) => Promise<Err>
  delReader: (code: string) => Promise<Err>
  createLoan: (f: { reader: string; book: string; borrow: string; days: number }) => Promise<Err>
  giveBack: (code: string) => Promise<{ fine?: number; error?: string }>
  saveSettings: (c: { days: number; fine: number }) => Promise<Err>
  setRole: (username: string, role: Role) => Promise<Err>
  delUser: (username: string) => Promise<Err>
}
const Ctx = createContext<Store>(null as never)
export const useStore = () => useContext(Ctx)

const errMsg = (e: unknown) => (e instanceof ApiError ? e.message : 'Có lỗi xảy ra, vui lòng thử lại')

export function Provider({ children }: { children: ReactNode }) {
  const [db, setDb] = useState<DB>(EMPTY), [me, setMe] = useState<User | null>(null), [msg, setMsg] = useState(''), [ready, setReady] = useState(false)
  const dbRef = useRef(db); dbRef.current = db
  const ses = useRef<{ me: User; rdr: Reader | null } | null>(null)
  const toast = useCallback((m: string) => { setMsg(m); setTimeout(() => setMsg(''), 2600) }, [])

  const reload = useCallback(async () => { if (ses.current) setDb(await loadAll(ses.current.me, ses.current.rdr)) }, [])

  // Sau khi có access token: lấy thông tin tài khoản + tải dữ liệu theo vai trò
  const enter = useCallback(async (accessToken?: string) => {
    if (accessToken) setToken(accessToken)
    const m = await api<any>('/auth/me')
    const u: User = { pk: m.id, u: m.username, name: m.fullName, role: m.role, reader: m.reader?.code }
    const rdr = m.reader ? mapReader(m.reader) : null
    ses.current = { me: u, rdr }
    const data = await loadAll(u, rdr)
    setDb(data); setMe(u)
  }, [])

  // Mở trang: thử khôi phục phiên bằng refresh token trong cookie
  useEffect(() => {
    onAuthLost(() => { ses.current = null; setMe(null); setDb(EMPTY); toast('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại') })
    let alive = true
    ;(async () => {
      try { if (await refreshToken()) await enter() } catch { /* chưa đăng nhập */ }
      if (alive) setReady(true)
    })()
    return () => { alive = false }
  }, [enter, toast])

  const login = async (u: string, p: string) => {
    try { const r = await api('/auth/login', 'POST', { username: u, password: p }); await enter(r.accessToken); return null } catch (e) { return errMsg(e) }
  }
  const signup = async (d: { u: string; p: string; name: string; phone: string; addr: string }) => {
    try {
      const r = await api('/auth/register', 'POST', { fullName: d.name, phone: d.phone, address: d.addr, username: d.u, password: d.p })
      await enter(r.accessToken); return null
    } catch (e) { return errMsg(e) }
  }
  const logout = async () => {
    try { await api('/auth/logout', 'POST') } catch { /* bỏ qua */ }
    setToken(null); ses.current = null; setMe(null); setDb(EMPTY)
  }

  // Gọi API rồi tải lại dữ liệu; trả về thông báo lỗi (nếu có)
  const run = async (fn: () => Promise<unknown>): Promise<Err> => {
    try { await fn(); await reload() } catch (e) { return errMsg(e) }
  }
  const pk = (list: { id: string; pk?: number }[], code: string) => list.find(x => x.id == code)?.pk

  const saveBook: Store['saveBook'] = (code, v) => run(() => {
    const body = { title: v.name, author: v.author, category: v.cat, quantity: +v.qty, image: v.img || '', description: v.desc || '' }
    return code ? api(`/books/${pk(dbRef.current.books, code)}`, 'PATCH', body) : api('/books', 'POST', body)
  })
  const delBook: Store['delBook'] = code => run(() => api(`/books/${pk(dbRef.current.books, code)}`, 'DELETE'))
  const saveReader: Store['saveReader'] = (code, v) => run(() => {
    const body = { fullName: v.name, phone: v.phone, address: v.addr }
    return code ? api(`/readers/${pk(dbRef.current.readers, code)}`, 'PATCH', body) : api('/readers', 'POST', body)
  })
  const delReader: Store['delReader'] = code => run(() => api(`/readers/${pk(dbRef.current.readers, code)}`, 'DELETE'))
  const createLoan: Store['createLoan'] = f => run(() => api('/loans', 'POST', {
    readerId: pk(dbRef.current.readers, f.reader), bookId: pk(dbRef.current.books, f.book), borrowDate: f.borrow, days: f.days,
  }))
  const giveBack: Store['giveBack'] = async code => {
    try {
      const l = await api(`/loans/${pk(dbRef.current.loans, code)}/return`, 'POST', {})
      await reload(); return { fine: l.fineAmount as number }
    } catch (e) { return { error: errMsg(e) } }
  }
  const saveSettings: Store['saveSettings'] = c => run(() => api('/settings', 'PUT', { loanDays: c.days, finePerDay: c.fine }))
  const setRole: Store['setRole'] = (u, role) => run(() => api(`/users/${pk(dbRef.current.users.map(x => ({ id: x.u, pk: x.pk })), u)}/role`, 'PATCH', { role }))
  const delUser: Store['delUser'] = u => run(() => api(`/users/${pk(dbRef.current.users.map(x => ({ id: x.u, pk: x.pk })), u)}`, 'DELETE'))

  return <Ctx.Provider value={{ db, me, msg, ready, toast, login, signup, logout, saveBook, delBook, saveReader, delReader, createLoan, giveBack, saveSettings, setRole, delUser }}>{children}</Ctx.Provider>
}
