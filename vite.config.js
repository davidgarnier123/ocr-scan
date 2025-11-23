import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    fs: {
      // Allow serving files from one level up to the project root
      allow: ['..'],
    },
  },
  // Optimize deps might be needed for some wasm packages, but usually standard config works.
  // We might need to handle static assets for wasm if they aren't automatically resolved.
})
