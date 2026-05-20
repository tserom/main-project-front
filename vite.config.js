import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// 端口见 docs/WORKSPACE.md 端口名单
const microProxy = (prefix, port) => ({
  target: `http://127.0.0.1:${port}`,
  changeOrigin: true,
  rewrite: (path) => {
    const stripped = path.replace(new RegExp(`^${prefix}/?`), '');
    return stripped.startsWith('/') ? stripped : `/${stripped}`;
  },
});

export default defineConfig({
  plugins: [react()],
  server: {
    port: 8100,
    host: '127.0.0.1',
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8500',
        changeOrigin: true,
      },
      // 与 infra/gateway/nginx.conf 一致：多端口 dev 时 /micro/* 须转发到子应用，否则会落到 host SPA（套娃）
      '/micro/hello': microProxy('/micro/hello', 8101),
      '/micro/user': microProxy('/micro/user', 8102),
      '/micro/inventory': microProxy('/micro/inventory', 8103),
    },
  },
})
