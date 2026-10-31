import { FormEvent, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useStore } from '../context/StoreContext'

export function Login() {
  const { me, login, signup, toast } = useStore(), [tab, setTab] = useState<'in' | 'up'>('in')
  if (me) return <Navigate to={me.role == 'reader' ? '/my-books' : '/'} replace />
  const sub = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const f = new FormData(e.currentTarget), g = (k: string) => String(f.get(k) || '').trim()
    if (tab == 'in') { const err = await login(g('u'), String(f.get('p'))); if (err) toast(err); return }
    if (f.get('p') != f.get('p2')) return toast('Mật khẩu nhập lại không khớp')
    const err = await signup({ u: g('u'), p: String(f.get('p')), name: g('name'), phone: g('phone'), addr: g('addr') })
    if (err) toast(err)
  }
  return (
    <div className="auth">
      <div className="side">
        <div className="lg" style={{ width: 52, height: 52, fontSize: 26, background: '#ffffff2e' }}>📚</div>
        <h1>Thư viện số</h1><p>Quản lý sách, độc giả, phiếu mượn – trả và tiền phạt trong một nơi.</p>
        <ul><li>Tra cứu sách nhanh</li><li>Theo dõi sách quá hạn</li><li>Báo cáo trực quan</li></ul>
      </div>
      <div className="box">
        <form className="card" key={tab} onSubmit={sub}>
          <div className="seg"><button type="button" className={tab == 'in' ? 'on' : ''} onClick={() => setTab('in')}>Đăng nhập</button><button type="button" className={tab == 'up' ? 'on' : ''} onClick={() => setTab('up')}>Đăng ký</button></div>
          {tab == 'up' && <><label>Họ và tên<input name="name" required /></label><label>Số điện thoại<input name="phone" type="tel" required /></label><label>Địa chỉ<input name="addr" required /></label></>}
          <label>Tên đăng nhập<input name="u" required autoComplete="username" /></label>
          <label>Mật khẩu<input name="p" type="password" minLength={6} required /></label>
          {tab == 'up' && <label>Nhập lại mật khẩu<input name="p2" type="password" required /></label>}
          <button className="btn">{tab == 'in' ? 'Đăng nhập' : 'Tạo tài khoản độc giả'}</button>
          {tab == 'in' && <small style={{ color: 'var(--mu)' }}>Demo: <b>admin / admin123</b> · <b>thuthu / thuthu123</b></small>}
        </form>
      </div>
    </div>
  )
}
