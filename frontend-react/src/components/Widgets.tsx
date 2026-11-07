import { ReactNode } from 'react'
import { late } from '../lib/calc'
import { Loan } from '../types'

export const Stat = ({ i, l, v }: { i: string; l: string; v: ReactNode }) => (
  <div className="card stat"><div className="ic">{i}</div><div><span>{l}</span><b>{v}</b></div></div>
)

export const Bars = ({ a }: { a: [string, number][] }) => {
  const mx = Math.max(1, ...a.map(x => x[1]))
  return a.length ? <>{a.map(x => (
    <div className="row" key={x[0]}><em title={x[0]}>{x[0]}</em><div className="tr"><i style={{ width: x[1] / mx * 100 + '%' }} /></div><b>{x[1]}</b></div>
  ))}</> : <div className="empty">Chưa có dữ liệu</div>
}

export const St = ({ l }: { l: Loan }) =>
  l.ret ? <span className="tag o">Đã trả</span> : late(l) > 0 ? <span className="tag e">Quá {late(l)} ngày</span> : <span className="tag">Đang mượn</span>
