import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // --- AGREGA ESTO ---
    proxy: {
      '/api': {
        target: 'http://137.184.191.81', // La IP de tu servidor
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, ''), // Borra "/api" antes de enviar
      },
    },
    // -------------------
  },
})
