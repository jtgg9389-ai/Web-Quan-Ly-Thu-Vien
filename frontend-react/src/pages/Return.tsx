import { Page } from '../components/PageHeader'
import { Tbl } from '../components/Table'
import { St } from '../components/Widgets'
import { useStore } from '../context/StoreContext'
import { act, bn, fine, rn } from '../lib/calc'
import { fd, vnd } from '../lib/utils'
import { Loan } from '../types'

export function Return() {
  const { db, giveBack, toast } = useStore()
  const give = async (l: Loan) => { const r = await giveBack(l.id); toast(r.error ? r.error : r.fine ? 'Đã trả sách. Tiền phạt: ' + vnd(r.fine) : 'Đã trả sách đúng hạn') }
  return (
    <Page t="Lập phiếu trả" s="Ngày trả là hôm nay; tiền phạt tính tự động">
      <Tbl head={['Mã', 'Độc giả', 'Sách', 'Hạn trả', 'Trạng thái', 'Phạt dự kiến', '']} rows={act(db).map(l => [l.id, rn(db, l.reader), <b>{bn(db, l.book)}</b>, fd(l.due), <St l={l} />, vnd(fine(db, l)), <button className="btn s" onClick={() => give(l)}>Trả sách</button>])} />
    </Page>
  )
}
