import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/avikash.naidu.github.io/',  // ← must match your GitHub repo name exactly
})
