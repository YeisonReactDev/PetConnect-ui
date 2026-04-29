import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// VITE_BASE_PATH is injected by actions/configure-pages in CI (e.g. "/petconnect").
// Locally it is undefined → base defaults to '/' so dev server works as-is.
const basePath = process.env.VITE_BASE_PATH ?? ''

export default defineConfig({
  base: basePath ? `${basePath}/` : '/',
  plugins: [tailwindcss(), react()],
  server: {
    host: true,
    allowedHosts: ['host.docker.internal', 'localhost', '127.0.0.1']
  }
})
