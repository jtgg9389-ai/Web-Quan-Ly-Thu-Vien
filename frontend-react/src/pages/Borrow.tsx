import { FormEvent, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Page } from '../components/PageHeader'
import { useStore } from '../context/StoreContext'
import { avail, bn } from '../lib/calc'
import { td } from '../lib/utils'

export function Borrow() {
  const { db, createLoan, toast } = useStore(), nav = useNavigate(), [sp] = useSearchParams(), av = db.books.filter(b => avail(db, b) > 0)
  const [f, setF] = useState({ reader: db.readers[0]?.id || '', book: sp.get('book') || av[0]?.id || '', borrow: td(), days: db.cfg.days })
  const scan = (v: string) => {
    const x = (v.match(/B\d{3,}/i) || [])[0]?.toUpperCase()
    if (!x) return toast('Mã không hợp lệ')
    if (!av.some(b => b.id == x)) return toast('Sách không tồn tại hoặc đã hết')
    setF({ ...f, book: x }); toast('Đã chọn: ' + bn(db, x))
  }
  const sub = async (e: FormEvent) => {
    e.preventDefault(); if (!f.book) return toast('Sách đã hết.'); if (!f.reader) return toast('Chưa có độc giả nào.')
    const err = await createLoan({ reader: f.reader, book: f.book, borrow: f.borrow, days: +f.days })
    if (err) return toast(err)
    toast('Đã lập phiếu mượn'); nav('/loans')
  }
  return (
    <Page t="Lập phiếu mượn" s="Số lượng sách còn lại tự động cập nhật">
      <form className="card frm" onSubmit={sub}>
        <label>Độc giả<select value={f.reader} onChange={e => setF({ ...f, reader: e.target.value })}>{db.readers.map(r => <option key={r.id} value={r.id}>{r.id} — {r.name}</option>)}</select></label>
        <label>Quét mã QR / nhập mã sách<input placeholder="Đưa máy quét vào đây hoặc gõ mã (vd: B001) rồi Enter" onKeyDown={e => { if (e.key == 'Enter') { e.preventDefault(); scan(e.currentTarget.value); e.currentTarget.value = '' } }} /></label>
        <label>Sách (chỉ hiển thị sách còn)<select value={f.book} onChange={e => setF({ ...f, book: e.target.value })}>{av.map(b => <option key={b.id} value={b.id}>{b.name} (còn {avail(db, b)})</option>)}</select></label>
        <div className="two" style={{ margin: 0 }}>
          <label>Ngày mượn<input type="date" required value={f.borrow} onChange={e => setF({ ...f, borrow: e.target.value })} /></label>
          <label>Số ngày được mượn<input type="number" min={1} required value={f.days} onChange={e => setF({ ...f, days: +e.target.value })} /></label>
        </div>
        <button className="btn">Lập phiếu mượn</button>
      </form>
    </Page>
  )
}
