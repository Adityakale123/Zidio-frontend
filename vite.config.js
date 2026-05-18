import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { writeFileSync, mkdirSync } from 'fs'

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'generate-redirects',
      closeBundle() {
        mkdirSync('dist', { recursive: true })
        writeFileSync('dist/_redirects', '/*    /index.html    200\n')
        console.log('✓ _redirects file created in dist/')
      }
    }
  ],
})