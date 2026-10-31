import { FormEvent, useState } from 'react'
import { Cover } from './Cover'
import { useStore } from '../context/StoreContext'

export interface Field { k: string; label: string; type?: string; opt?: boolean }

export function FormModal({ title, fields, init, onSave, onClose }: {
  title: string; fields: Field[]; init: Record<string, any>
  onSave: (v: Record<string, string>) => string | void | Promise<string | void>; onClose: () => void
}) {
  const { toast } = useStore(), [busy, setBusy] = useState(false)
  const [v, setV] = useState<Record<string, string>>(() => Object.fromEntries(fields.map(f => [f.k, String(init[f.k] ?? '')])))
  const up = (k: string, x: string) => setV(o => ({ ...o, [k]: x }))
  const pick = (f?: File) => {
    if (!f) return
    const r = new FileReader()
    r.onload = () => {
      const im = new Image()
      im.onload = () => {
        const k = Math.min(1, 360 / im.width), c = document.createElement('canvas')
        c.width = im.width * k; c.height = im.height * k
        c.getContext('2d')!.drawImage(im, 0, 0, c.width, c.height)
        up('img', c.toDataURL('image/jpeg', .8))
      }
      im.src = r.result as string
    }
    r.readAsDataURL(f)
  }
  const sub = async (e: FormEvent) => { e.preventDefault(); if (busy) return; setBusy(true); const err = await onSave(v); setBusy(false); if (err) toast(err); else onClose() }
  return (
    <div className="md"><form onSubmit={sub}>
      <h1 style={{ fontSize: 19 }}>{title}</h1>
      {fields.map(f => f.type == 'img' ? (
        <label key={f.k}>{f.label}
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <div style={{ width: 78, flex: 'none' }}><Cover key={v.img} b={{ id: init.id, name: init.name || '?', img: v.img }} /></div>
            <div style={{ display: 'grid', gap: 8, flex: 1, minWidth: 0 }}>
              <input type="file" accept="image/*" onChange={e => pick(e.target.files?.[0])} />
              <input placeholder="hoặc dán link ảnh (không bắt buộc)" value={v.img.startsWith('data:') ? '' : v.img} onChange={e => up('img', e.target.value.trim())} />
            </div>
          </div>
        </label>
      ) : (
        <label key={f.k}>{f.label}
          <input type={f.type || 'text'} min={f.type == 'number' ? 1 : undefined} required={!f.opt} value={v[f.k]} onChange={e => up(f.k, e.target.value)} />
        </label>
      ))}
      <div className="bar" style={{ justifyContent: 'flex-end', margin: 0 }}>
        <button type="button" className="btn g" onClick={onClose}>Hủy</button><button className="btn" disabled={busy}>{busy ? 'Đang lưu…' : 'Lưu'}</button>
      </div>
    </form></div>
  )
}
