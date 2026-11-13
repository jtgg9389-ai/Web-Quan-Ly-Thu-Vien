/* ===== Tiện ích ===== */
const D = 864e5
export const td = () => { const n = new Date(); return new Date(n.getTime() - n.getTimezoneOffset() * 60000).toISOString().slice(0, 10) }
export const add = (d: string, n: number) => new Date(+new Date(d) + n * D).toISOString().slice(0, 10)
export const diff = (a: string, b: string) => Math.round((+new Date(a) - +new Date(b)) / D)
export const vnd = (n: number) => (n || 0).toLocaleString('vi-VN') + ' đ'
export const fd = (d: string | null) => (d ? d.split('-').reverse().join('/') : '—')
export const H = (s: string) => { let h = 5381; for (const c of 'lib$' + s) h = (h * 33 ^ c.charCodeAt(0)) >>> 0; return h.toString(36) }
export const nid = (p: string, a: { id: string }[]) => p + String(Math.max(0, ...a.map(x => +x.id.slice(1))) + 1).padStart(3, '0')
