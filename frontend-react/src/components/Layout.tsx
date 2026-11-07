import { NavLink, Navigate, Outlet, useLocation } from 'react-router-dom'
import { useStore } from '../context/StoreContext'
import { ROLE, Role } from '../types'

/* Phân quyền theo đường dẫn */

const can = (r: Role, p: string) =>
  r == 'admin' ? p != '/my-books' : r == 'librarian' ? !['/settings', '/accounts', '/my-books'].includes(p) : p == '/my-books' || p.startsWith('/books')

const NAV: [string, string, string][] = [['/', '🏠', 'Tổng quan'], ['/books', '📚', 'Quản lý sách'], ['/readers', '👥', 'Độc giả'], ['/borrow', '📝', 'Lập phiếu mượn'], ['/return', '↩️', 'Lập phiếu trả'], ['/loans', '🧾', 'Phiếu mượn – trả'], ['/overdue', '⏰', 'Quá hạn & phạt'], ['/reports', '📊', 'Báo cáo'], ['/settings', '⚙️', 'Cài đặt'], ['/accounts', '🔑', 'Tài khoản'], ['/my-books', '🙋', 'Sách của tôi']]

export function Layout() {
  const { me, logout } = useStore(), { pathname } = useLocation()
  if (!me) return <Navigate to="/login" replace />
  if (!can(me.role, pathname)) return <Navigate to={me.role == 'reader' ? '/my-books' : '/'} replace />
  return (
    <>
      <aside>
        <NavLink className="brand" to={me.role == 'reader' ? '/my-books' : '/'}><span className="lg">📚</span><b>Thư viện số</b></NavLink>
        <nav>{NAV.filter(n => can(me.role, n[0])).map(n => (
          <NavLink key={n[0]} to={n[0]} end={n[0] == '/'} className={({ isActive }) => (isActive ? 'on' : '')}><span>{n[1]}</span>{n[2]}</NavLink>
        ))}</nav>
        <div className="me">
          <div className="av">{me.name.trim()[0]}</div>
          <div><b>{me.name}</b><small>{ROLE[me.role]}</small></div>
          <button className="btn g s" onClick={logout} title="Đăng xuất">⎋</button>
        </div>
      </aside>
      <main><Outlet /></main>
    </>
  )
}
