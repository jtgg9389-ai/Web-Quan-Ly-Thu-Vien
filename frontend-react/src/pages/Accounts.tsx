import { Page } from '../components/PageHeader'
import { Tbl } from '../components/Table'
import { useStore } from '../context/StoreContext'
import { ROLE, Role } from '../types'

export function Accounts() {
  const { db, me, setRole, delUser, toast } = useStore()
  return (
    <Page t="Quản lý tài khoản" s="Phân quyền: Quản trị, Thủ thư, Độc giả">
      <Tbl head={['Tên đăng nhập', 'Họ tên', 'Vai trò', '']} rows={db.users.map(x => [x.u, x.name,
        <select value={x.role} disabled={x.u == me!.u} onChange={async e => { const er = await setRole(x.u, e.target.value as Role); if (er) toast(er) }}>{(Object.keys(ROLE) as Role[]).map(r => <option key={r} value={r}>{ROLE[r]}</option>)}</select>,
        x.u == me!.u ? '' : <button className="btn d s" onClick={async () => { if (!confirm('Xóa tài khoản ' + x.u + '?')) return; const er = await delUser(x.u); if (er) toast(er) }}>Xóa</button>])} />
    </Page>
  )
}
