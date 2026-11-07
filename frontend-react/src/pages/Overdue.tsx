import { Page } from '../components/PageHeader'
import { Tbl } from '../components/Table'
import { Stat } from '../components/Widgets'
import { useStore } from '../context/StoreContext'
import { bn, fine, late, ovr, rn } from '../lib/calc'
import { fd, vnd } from '../lib/utils'

export function Overdue() {
  const { db } = useStore(), o = ovr(db)
  return (
    <Page t="Quá hạn & tiền phạt" s={`Mức phạt: ${vnd(db.cfg.fine)}/ngày/cuốn`}>
      <div className="grid"><Stat i="⏰" l="Phiếu quá hạn" v={o.length} /><Stat i="💰" l="Tiền phạt tạm tính" v={vnd(o.reduce((s, l) => s + fine(db, l), 0))} /></div>
      <Tbl head={['Mã', 'Độc giả', 'SĐT', 'Sách', 'Hạn trả', 'Số ngày trễ', 'Tiền phạt']} rows={o.map(l => [l.id, rn(db, l.reader), db.readers.find(r => r.id == l.reader)?.phone || '', bn(db, l.book), fd(l.due), <span className="tag e">{late(l)}</span>, <b>{vnd(fine(db, l))}</b>])} />
    </Page>
  )
}
