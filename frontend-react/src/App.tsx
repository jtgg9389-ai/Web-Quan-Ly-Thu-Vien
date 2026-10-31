import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { useStore } from './context/StoreContext'
import { Accounts } from './pages/Accounts'
import { BookDetail } from './pages/BookDetail'
import { Books } from './pages/Books'
import { Borrow } from './pages/Borrow'
import { Dashboard } from './pages/Dashboard'
import { Loans } from './pages/Loans'
import { Login } from './pages/Login'
import { MyBooks } from './pages/MyBooks'
import { Overdue } from './pages/Overdue'
import { Readers } from './pages/Readers'
import { Reports } from './pages/Reports'
import { Return } from './pages/Return'
import { Settings } from './pages/Settings'

export default function App() {
  const { msg, ready } = useStore()
  if (!ready) return <div style={{ display: 'grid', placeItems: 'center', minHeight: '100vh', color: 'var(--mu)' }}>Đang tải…</div>
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/books" element={<Books />} />
          <Route path="/books/:id" element={<BookDetail />} />
          <Route path="/readers" element={<Readers />} />
          <Route path="/borrow" element={<Borrow />} />
          <Route path="/return" element={<Return />} />
          <Route path="/loans" element={<Loans />} />
          <Route path="/overdue" element={<Overdue />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/accounts" element={<Accounts />} />
          <Route path="/my-books" element={<MyBooks />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {msg && <div id="toast">{msg}</div>}
    </BrowserRouter>
  )
}
