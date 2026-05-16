import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// 端口见 docs/WORKSPACE.md 端口名单
export default defineConfig({
  plugins: [react()],
  server: {
    port: 8100,
    host: '127.0.0.1',
  },
})
