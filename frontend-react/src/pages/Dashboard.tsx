import { Link } from 'react-router-dom'
import { Page } from '../components/PageHeader'
import { Tbl } from '../components/Table'
import { Bars, St, Stat } from '../components/Widgets'
import { useStore } from '../context/StoreContext'
import { act, bn, cnt, fine, ovr, rn } from '../lib/calc'
import { fd, td, vnd } from '../lib/utils'

export function Dashboard() {
  const { db, me } = useStore(), a = act(db), o = ovr(db)
  return (
    <Page t="Tổng quan" s={'Hôm nay, ' + fd(td())}>
      <div className="hero">
        <div><h2>Xin chào, {me!.name} 👋</h2><p>{a.length} cuốn đang được mượn · {o.length} phiếu quá hạn cần xử lý.</p></div>
        <div className="bar" style={{ margin: 0 }}><Link className="btn" to="/borrow">+ Lập phiếu mượn</Link><Link className="btn g" to="/return">Nhận trả sách</Link></div>
      </div>
      <div className="grid">
        <Stat i="📚" l="Đầu sách" v={db.books.length} /><Stat i="🗂️" l="Tổng số bản" v={db.books.reduce((s, b) => s + b.qty, 0)} />
        <Stat i="👥" l="Độc giả" v={db.readers.length} /><Stat i="📖" l="Đang mượn" v={a.length} />
        <Stat i="⏰" l="Quá hạn" v={o.length} /><Stat i="💰" l="Tiền phạt" v={vnd(db.loans.reduce((s, l) => s + fine(db, l), 0))} />
      </div>
      <div className="two">
        <div><h2>Phiếu gần đây</h2><Tbl head={['Mã', 'Độc giả', 'Sách', 'Trạng thái']} rows={db.loans.slice(-5).reverse().map(l => [l.id, rn(db, l.reader), bn(db, l.book), <St l={l} />])} /></div>
        <div className="card"><h2>Sách theo thể loại</h2><Bars a={cnt(db.books.map(b => b.cat))} /></div>
      </div>
    </Page>
  )
}
