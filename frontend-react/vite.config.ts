import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: 'localhost', port: 5173, open: true,
    // Chuyển /api sang backend NestJS (cổng 3000) để trình duyệt gọi cùng một địa chỉ, không vướng CORS
    proxy: { '/api': { target: 'http://localhost:3000', changeOrigin: true } },
  },
})
