import { QRCodeSVG } from 'qrcode.react'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import BookReader from '../components/BookReader'
import { Cover } from '../components/Cover'
import { Page } from '../components/PageHeader'
import { useStore } from '../context/StoreContext'
import { useBookEditor } from '../hooks/useBookEditor'
import { avail, out } from '../lib/calc'

export function BookDetail() {
  const { db, me } = useStore(), { id } = useParams<{ id: string }>(), { open, modal } = useBookEditor(), [rd, setRd] = useState(false)
  const b = db.books.find(x => x.id == id), staff = me!.role != 'reader'
  if (!b) return <Page t="Không tìm thấy sách" s=""><Link className="btn" to="/books">← Về danh sách</Link></Page>
  return (
    <Page t={b.name} s={b.author}>
      <div className="det">
        <div className="rb" onClick={() => setRd(true)} title="Bấm để đọc thử"><Cover b={b} /><span className="rbh">📖 Bấm để đọc thử</span></div>
        <div style={{ display: 'grid', gap: 16 }}>
          <div className="card"><h2>Thông tin</h2>
            <dl className="kv">
              <dt>Mã sách</dt><dd><b>{b.id}</b></dd><dt>Thể loại</dt><dd><span className="tag">{b.cat}</span></dd>
              <dt>Tổng số bản</dt><dd>{b.qty}</dd><dt>Đang mượn</dt><dd>{out(db, b.id)}</dd>
              <dt>Còn lại</dt><dd>{avail(db, b) ? <span className="tag o">{avail(db, b)} bản</span> : <span className="tag e">Hết</span>}</dd>
            </dl>
            <div className="bar noprint" style={{ margin: '16px 0 0' }}>
              <button className="btn" onClick={() => setRd(true)}>📖 Đọc sách</button><Link className="btn g" to="/books">← Danh sách</Link>
              {staff && <><button className="btn g" onClick={() => open(b)}>Sửa</button>{avail(db, b) > 0 && <Link className="btn" to={`/borrow?book=${b.id}`}>Lập phiếu mượn</Link>}</>}
            </div>
          </div>
          <div className="card"><h2>Mã QR của sách</h2>
            <div className="qrb"><QRCodeSVG value={`${location.origin}/books/${b.id}`} size={180} /></div>
            <p className="sub" style={{ margin: '10px 0 12px' }}>{b.id} · {b.name}</p>
            <button className="btn g noprint" onClick={() => print()}>🖨 In mã QR</button>
          </div>
        </div>
      </div>
      {rd && <BookReader b={b} onClose={() => setRd(false)} />}{modal}
    </Page>
  )
}
