/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    // En Docker sobre Windows/macOS los cambios de la carpeta montada no generan eventos:
    // compose.yaml activa el sondeo para que la recarga en caliente funcione.
    watch: process.env.VITE_WATCH_POLLING === 'true' ? { usePolling: true, interval: 300 } : {},
  },
  build: {
    // El mapa 3D (three.js) va en su propio fragmento de carga diferida (~960 kB) y solo
    // se descarga al llegar a Territorio; el resto de la app queda por debajo del límite.
    chunkSizeWarningLimit: 1000,
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    css: false,
  },
})
