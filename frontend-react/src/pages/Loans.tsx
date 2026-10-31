import { useState } from 'react'
import { Page } from '../components/PageHeader'
import { Search } from '../components/Search'
import { Tbl } from '../components/Table'
import { St } from '../components/Widgets'
import { useStore } from '../context/StoreContext'
import { bn, has, late, rn } from '../lib/calc'
import { fd } from '../lib/utils'
import { Loan } from '../types'

const LH = ['Mã phiếu', 'Độc giả', 'Sách', 'Ngày mượn', 'Hạn trả', 'Ngày trả', 'Trạng thái']

const lrow = (d: Parameters<typeof bn>[0], l: Loan) => [l.id, rn(d, l.reader), <b>{bn(d, l.book)}</b>, fd(l.borrow), fd(l.due), fd(l.ret), <St l={l} />]

type LF = 'all' | 'act' | 'over' | 'ret'

export function Loans() {
  const { db } = useStore(), [q, setQ] = useState(''), [lf, setLf] = useState<LF>('all')
  const tabs: [LF, string][] = [['all', 'Tất cả'], ['act', 'Đang mượn'], ['over', 'Quá hạn'], ['ret', 'Đã trả']]
  const ok = (l: Loan) => lf == 'all' || (lf == 'act' && !l.ret) || (lf == 'ret' && !!l.ret) || (lf == 'over' && !l.ret && late(l) > 0)
  return (
    <Page t="Phiếu mượn – trả" s="Toàn bộ lịch sử và sách đang mượn">
      <div className="bar"><Search v={q} set={setQ} ph="Tìm theo mã phiếu, độc giả, sách..." />
        <div className="seg">{tabs.map(t => <button key={t[0]} className={lf == t[0] ? 'on' : ''} onClick={() => setLf(t[0])}>{t[1]}</button>)}</div></div>
      <Tbl head={LH} rows={[...db.loans].reverse().filter(l => ok(l) && has(q, l.id, rn(db, l.reader), bn(db, l.book))).map(l => lrow(db, l))} />
    </Page>
  )
}
