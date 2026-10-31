import { ReactNode, useEffect, useState } from 'react'
import { Cover, EXT } from './Cover'
import { useStore } from '../context/StoreContext'
import { Book } from '../types'

const ok = (u: string) => new Promise<boolean>(r => { const i = new Image(); i.onload = () => r(true); i.onerror = () => r(false); i.src = u })

/* Trang nội dung: public/images/<mã sách>/1.jpg, 2.jpg, ... (dừng khi thiếu số) */

async function probe(id: string) {
  const o: string[] = []
  for (let n = 1; n <= 300; n++) {
    let f = ''
    for (const e of EXT) { const u = `/images/${id}/${n}.${e}`; if (await ok(u)) { f = u; break } }
    if (!f) break
    o.push(f)
  }
  return o
}

export default function BookReader({ b, onClose }: { b: Book; onClose: () => void }) {
  const { me } = useStore()
  const [imgs, setImgs] = useState<string[] | null>(null)
  const [cur, setCur] = useState(0)
  useEffect(() => { let live = true; probe(b.id).then(x => live && setImgs(x)); return () => { live = false } }, [b.id])

  const P: ReactNode[] = imgs ? [
    <Cover b={b} />,
    <div className="pp">
      <small>{b.cat}</small><h2>{b.name}</h2><i>{b.author}</i>
      <p>{b.desc || 'Chưa có phần giới thiệu cho cuốn sách này.'}</p>
      {me?.role != 'reader' && !imgs.length && <p className="hn">Thêm ảnh các trang vào thư mục <b>public/images/{b.id}/</b>, đặt tên 1.jpg, 2.jpg, 3.jpg… để xem đủ nội dung.</p>}
    </div>,
    ...imgs.map(u => <img src={u} alt="" />),
    <div className="pp" style={{ justifyContent: 'center', textAlign: 'center' }}><h2>— Hết —</h2><p>Cảm ơn bạn đã xem.</p></div>,
  ] : []
  if (P.length % 2) P.push(null)
  const n = P.length / 2
  const go = (d: number) => setCur(c => Math.max(0, Math.min(n, c + d)))

  useEffect(() => {
    const k = (e: KeyboardEvent) => { if (e.key == 'Escape') onClose(); if (e.key == 'ArrowRight') go(1); if (e.key == 'ArrowLeft') go(-1) }
    addEventListener('keydown', k); return () => removeEventListener('keydown', k)
  }, [n, onClose])

  return (
    <div className="rd">
      <div className="rdh"><b>{b.name}</b><button className="btn g s" onClick={onClose}>✕ Đóng</button></div>
      <div className="rdm">
        {!imgs ? <span style={{ color: '#fff' }}>Đang mở sách…</span> : (
          <div className="bkw">
            <div className="book" style={{ transform: cur == 0 ? 'translateX(-25%)' : cur == n ? 'translateX(25%)' : 'none' }}
              onClick={e => { const r = e.currentTarget.getBoundingClientRect(); go(cur == 0 ? 1 : cur == n ? -1 : e.clientX - r.left < r.width / 2 ? -1 : 1) }}>
              {Array.from({ length: n }, (_, k) => (
                <div className="lf" key={k} style={{ transform: `rotateY(${k < cur ? -180 : 0}deg)`, zIndex: k < cur ? k : n - k }}>
                  <div className="fc">{P[2 * k]}</div><div className="pb">{P[2 * k + 1]}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <div className="rdf">
        <button className="btn" onClick={() => go(-1)}>◀</button>
        <span>{cur == 0 ? 'Bìa trước' : cur == n ? 'Bìa sau' : `Trang ${2 * cur}–${2 * cur + 1} / ${P.length}`}</span>
        <button className="btn" onClick={() => go(1)}>▶</button>
      </div>
    </div>
  )
}
