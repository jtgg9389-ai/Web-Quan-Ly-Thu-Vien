import { useState } from 'react'
import { Page } from '../components/PageHeader'
import { useStore } from '../context/StoreContext'

export function Settings() {
  const { db, saveSettings, toast } = useStore(), [days, setDays] = useState(db.cfg.days), [fn, setFn] = useState(db.cfg.fine)
  return (
    <Page t="Cài đặt" s="Quy định mượn – trả">
      <form className="card frm" onSubmit={async e => { e.preventDefault(); toast((await saveSettings({ days, fine: fn })) || 'Đã lưu cài đặt') }}>
        <label>Số ngày mượn mặc định<input type="number" min={1} value={days} onChange={e => setDays(+e.target.value)} /></label>
        <label>Tiền phạt mỗi ngày trễ (đ)<input type="number" min={0} step={500} value={fn} onChange={e => setFn(+e.target.value)} /></label>
        <button className="btn">Lưu cài đặt</button>
      </form>
    </Page>
  )
}
