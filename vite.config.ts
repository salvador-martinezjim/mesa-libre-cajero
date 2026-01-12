import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true, 
    proxy: {
      // 1. API REST (Con LOGS activados)
      '/api': {
        target: 'http://137.184.191.81',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, ''), 
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('❌ Proxy API Error:', err);
          });
          // ESTO ES LO QUE TE FALTABA PARA VER LOS 200/401 EN LA TERMINAL:
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log(`[API] ${req.method} ${req.url} -> ${proxyRes.statusCode}`);
          });
        },
      },
      
      // 2. SOCKETS (Configuración Final Correcta de Pedro)
      '/ws': {
        target: 'ws://137.184.191.81', 
        ws: true,
        changeOrigin: true,
        secure: false,
        configure: (proxy, _options) => {
            proxy.on('error', (err, _req, _res) => {
               // Log discreto para errores de socket
               // console.log('⚠️ Socket Error:', (err as any).code);
            });
        }
      }
    },
  },
})