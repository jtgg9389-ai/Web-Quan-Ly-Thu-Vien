import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Cover } from '../components/Cover'
import { Page } from '../components/PageHeader'
import { Search } from '../components/Search'
import { useStore } from '../context/StoreContext'
import { useBookEditor } from '../hooks/useBookEditor'
import { avail, has } from '../lib/calc'

export function Books() {
  const { db, me, delBook, toast } = useStore(), [q, setQ] = useState(''), { open, modal } = useBookEditor()
  const staff = me!.role != 'reader', list = db.books.filter(b => has(q, b.id, b.name, b.author, b.cat))
  const del = async (id: string) => { if (!confirm('Xóa sách này?')) return; toast((await delBook(id)) || 'Đã xóa sách') }
  return (
    <Page t="Quản lý sách" s="Thêm, sửa, xóa và tìm kiếm sách">
      <div className="bar"><Search v={q} set={setQ} ph="Tìm theo mã, tên, tác giả, thể loại..." />{staff && <button className="btn" onClick={() => open({})}>+ Thêm sách</button>}</div>
      {list.length ? (
        <div className="bks">{list.map(b => (
          <div className="bc" key={b.id}>
            <Link to={`/books/${b.id}`}><Cover b={b} /></Link>
            <div><Link to={`/books/${b.id}`}><b>{b.name}</b></Link><br /><small>{b.author}</small></div>
            <div className="bar" style={{ margin: 0, justifyContent: 'space-between' }}>
              <span className="tag">{b.cat}</span>{avail(db, b) ? <small>Còn {avail(db, b)}/{b.qty}</small> : <span className="tag e">Hết</span>}
            </div>
            {staff && <div className="bar" style={{ margin: 0 }}><button className="btn g s" onClick={() => open(b)}>Sửa</button><button className="btn d s" onClick={() => del(b.id)}>Xóa</button></div>}
          </div>
        ))}</div>
      ) : <div className="card empty">Không có dữ liệu</div>}
      {modal}
    </Page>
  )
}
