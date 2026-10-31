import { useState } from 'react'
import { Field, FormModal } from '../components/FormModal'
import { Page } from '../components/PageHeader'
import { Search } from '../components/Search'
import { Tbl } from '../components/Table'
import { useStore } from '../context/StoreContext'
import { act, has } from '../lib/calc'

const RF: Field[] = [{ k: 'name', label: 'Họ và tên' }, { k: 'phone', label: 'Số điện thoại', type: 'tel' }, { k: 'addr', label: 'Địa chỉ' }]

export function Readers() {
  const { db, saveReader, delReader, toast } = useStore(), [q, setQ] = useState(''), [ed, setEd] = useState<{ id?: string; name?: string; phone?: string; addr?: string } | null>(null)
  const save = (v: Record<string, string>) => saveReader(ed!.id, v)
  const del = async (id: string) => { if (!confirm('Xóa độc giả này?')) return; toast((await delReader(id)) || 'Đã xóa độc giả') }
  return (
    <Page t="Quản lý độc giả" s="Lưu và tra cứu thông tin độc giả">
      <div className="bar"><Search v={q} set={setQ} ph="Tra cứu theo mã, tên, số điện thoại..." /><button className="btn" onClick={() => setEd({})}>+ Thêm độc giả</button></div>
      <Tbl head={['Mã', 'Họ tên', 'Điện thoại', 'Địa chỉ', 'Đang mượn', '']} rows={db.readers.filter(r => has(q, r.id, r.name, r.phone, r.addr)).map(r => [r.id, <b>{r.name}</b>, r.phone, r.addr, act(db).filter(l => l.reader == r.id).length,
        <><button className="btn g s" onClick={() => setEd(r)}>Sửa</button> <button className="btn d s" onClick={() => del(r.id)}>Xóa</button></>])} />
      {ed && <FormModal title={ed.id ? 'Sửa độc giả' : 'Thêm độc giả'} fields={RF} init={ed} onSave={save} onClose={() => setEd(null)} />}
    </Page>
  )
}
