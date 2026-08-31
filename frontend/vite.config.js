import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        // recharts entra por el panel y por dos pestanas del expediente, pero
        // rollup lo estaba metiendo en el chunk principal, asi que lo
        // descargaba tambien quien solo abria Pacientes o Agenda. En su propio
        // chunk lo piden unicamente las pantallas que dibujan graficas.
        manualChunks: {
          recharts: ['recharts'],
        },
      },
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.js'],
    include: ['src/**/*.{test,spec}.{js,jsx,ts,tsx}'],
    css: false,
  },
})
