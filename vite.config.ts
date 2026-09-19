import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import * as path from 'path'

const domain = process.env.LEARN_SITE_DOMAIN?.trim() || ''
if (domain && !/^(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,}$/i.test(domain)) {
  throw new Error('LEARN_SITE_DOMAIN must be a hostname without a protocol or path')
}

export default defineConfig({
  base: domain ? '/' : '/learn-react/',
  plugins: [react()],
  resolve: { alias: { '@': path.resolve(__dirname, './src') } }
})
