import { Page } from '../components/PageHeader'
import { Bars } from '../components/Widgets'
import { useStore } from '../context/StoreContext'
import { avail, bn, cnt } from '../lib/calc'

export function Reports() {
  const { db } = useStore()
  const cat = Object.entries(db.books.reduce<Record<string, number>>((o, b) => (o[b.cat] = (o[b.cat] || 0) + b.qty, o), {})).sort((a, b) => b[1] - a[1])
  const exp = () => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([JSON.stringify(db, null, 2)], { type: 'application/json' })); a.download = 'thu-vien.json'; a.click() }
  return (
    <Page t="Thống kê & báo cáo" s="Tổng hợp hoạt động thư viện">
      <div className="two">
        <div className="card"><h2>Số bản theo thể loại</h2><Bars a={cat} /></div>
        <div className="card"><h2>Sách được mượn nhiều nhất</h2><Bars a={cnt(db.loans.map(l => bn(db, l.book))).slice(0, 6)} /></div>
        <div className="card"><h2>Lượt mượn theo tháng</h2><Bars a={cnt(db.loans.map(l => l.borrow.slice(0, 7))).sort()} /></div>
        <div className="card"><h2>Tồn kho hiện tại</h2><Bars a={db.books.map(b => [b.name, avail(db, b)])} /></div>
      </div>
      <button className="btn g" onClick={exp}>⬇ Xuất dữ liệu JSON</button>
    </Page>
  )
}
