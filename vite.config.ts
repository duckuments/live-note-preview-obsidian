import { fileURLToPath, URL } from 'url'
import KumaUI from '@kuma-ui/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    KumaUI({
      wasm: true
    })
  ],
  server: {
    // Dev: forward note fetches to the backend resolver so /api is same-origin
    // like it is in production (SPA + backend behind one host).
    proxy: {
      '/api': 'http://localhost:8787'
    }
  },
  resolve: {
    alias: [
      {
        find: '@',
        replacement: fileURLToPath(new URL('./src', import.meta.url))
      }
    ]
  }
})
