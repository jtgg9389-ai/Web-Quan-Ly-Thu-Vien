import { ReactNode, useState } from 'react'

/* Ảnh bìa: ảnh đã tải lên/link -> public/images/<mã>.<đuôi> -> bìa mặc định */

export const EXT = ['jpg', 'jpeg', 'png', 'webp', 'svg']

const hue = (n: string) => [...n].reduce((a, c) => a + c.charCodeAt(0), 0) * 7 % 360

export function Cover({ b }: { b: { id?: string; name: string; img?: string } }) {
  const [i, setI] = useState(0)
  let inner: ReactNode = (
    <div className="ph" style={{ background: `linear-gradient(145deg,hsl(${hue(b.name)} 45% 38%),hsl(${hue(b.name) + 35} 50% 26%))` }}>{b.name}</div>
  )
  if (b.img) inner = <img src={b.img} alt="" />
  else if (b.id && i < EXT.length) inner = <img src={`/images/${b.id}.${EXT[i]}`} alt="" onError={() => setI(i + 1)} />
  return <div className="cv">{inner}</div>
}
