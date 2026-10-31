import { ReactNode } from 'react'

export const Tbl = ({ head, rows }: { head: string[]; rows: ReactNode[][] }) => (
  <div className="tw"><table>
    <thead><tr>{head.map(h => <th key={h}>{h}</th>)}</tr></thead>
    <tbody>{rows.length ? rows.map((r, i) => <tr key={i}>{r.map((c, j) => <td key={j}>{c}</td>)}</tr>) : <tr><td colSpan={head.length} className="empty">Không có dữ liệu</td></tr>}</tbody>
  </table></div>
)
