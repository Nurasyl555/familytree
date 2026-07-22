import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Задаётся только для деплоя под путём (напр. esg.kbtu.kz/familytree/, см. VITE_BASE_PATH
  // build-arg во frontend/Dockerfile) — Vercel/Docker Compose/локальная разработка живут
  // в корне домена, там переменная не задана и base остаётся '/'.
  base: process.env.VITE_BASE_PATH || '/',
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/media': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.js',
    coverage: {
      provider: 'v8',
      include: [
        'src/pages/LoginPage.jsx',
        'src/pages/DashboardPage.jsx',
        'src/components/FamilyTreeGraph.jsx',
        'src/components/PersonCard.jsx',
      ],
      thresholds: {
        lines: 60,
        statements: 60,
      },
    },
  },
})
