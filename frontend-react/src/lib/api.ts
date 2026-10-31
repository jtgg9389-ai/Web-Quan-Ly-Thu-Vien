/* ===== Gọi API backend (NestJS) =====
 * - Access token giữ trong bộ nhớ (không lưu localStorage).
 * - Refresh token nằm trong cookie httpOnly do backend đặt, trình duyệt tự gửi (credentials: 'include').
 * - Khi gặp 401, tự gọi /auth/refresh một lần rồi thử lại yêu cầu. */

// Dev: dùng proxy của Vite (/api -> http://localhost:3000). Khi triển khai: đặt VITE_API_URL=https://ten-mien/api
const BASE = ((import.meta.env.VITE_API_URL as string | undefined) || '/api').replace(/\/$/, '')

export class ApiError extends Error {
  constructor(public status: number, message: string) { super(message) }
}

let token: string | null = null
let refreshing: Promise<boolean> | null = null
let lost: () => void = () => {}

export const setToken = (t: string | null) => { token = t }
export const onAuthLost = (f: () => void) => { lost = f }

const NO_RETRY = ['/auth/login', '/auth/register', '/auth/refresh', '/auth/logout']

async function send(path: string, method: string, body?: unknown): Promise<Response> {
  const headers: Record<string, string> = {}
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  if (token) headers.Authorization = 'Bearer ' + token
  try {
    return await fetch(BASE + path, { method, headers, credentials: 'include', body: body !== undefined ? JSON.stringify(body) : undefined })
  } catch {
    throw new ApiError(0, 'Không kết nối được máy chủ. Hãy kiểm tra backend đang chạy (npm run start:dev).')
  }
}

// Đổi refresh token (cookie) lấy access token mới. Gộp nhiều lời gọi đồng thời thành một.
export function refreshToken(): Promise<boolean> {
  if (!refreshing) {
    refreshing = (async () => {
      try {
        const r = await send('/auth/refresh', 'POST')
        if (!r.ok) { token = null; return false }
        token = (await r.json()).accessToken
        return true
      } catch { return false }
    })().finally(() => { refreshing = null })
  }
  return refreshing
}

const text = (j: any, fallback: string) => (Array.isArray(j?.message) ? j.message.join('. ') : j?.message || fallback)

export async function api<T = any>(path: string, method = 'GET', body?: unknown): Promise<T> {
  let r = await send(path, method, body)
  if (r.status === 401 && !NO_RETRY.includes(path)) {
    if (await refreshToken()) r = await send(path, method, body)
    else lost()
  }
  const raw = await r.text()
  let j: any = null
  try { j = raw ? JSON.parse(raw) : null } catch { /* không phải JSON */ }
  if (!r.ok) throw new ApiError(r.status, text(j, 'Lỗi ' + r.status))
  return j as T
}
