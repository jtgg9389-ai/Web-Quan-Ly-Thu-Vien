import { Page } from '../components/PageHeader'
import { Tbl } from '../components/Table'
import { St } from '../components/Widgets'
import { useStore } from '../context/StoreContext'
import { bn } from '../lib/calc'
import { fd } from '../lib/utils'

export function MyBooks() {
  const { db, me } = useStore(), l = db.loans.filter(x => x.reader == me!.reader).reverse()
  return (
    <Page t="Sách của tôi" s={`${l.filter(x => !x.ret).length} cuốn đang mượn`}>
      <Tbl head={['Mã phiếu', 'Sách', 'Ngày mượn', 'Hạn trả', 'Ngày trả', 'Trạng thái']} rows={l.map(x => [x.id, <b>{bn(db, x.book)}</b>, fd(x.borrow), fd(x.due), fd(x.ret), <St l={x} />])} />
    </Page>
  )
}
