import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
export default defineConfig({
  plugins: [react()],
  test: { environment: 'happy-dom', include: ['src/test/**/*.test.tsx'], setupFiles: ['./src/test/setup.ts'] },
})
