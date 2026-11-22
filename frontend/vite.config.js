import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// There is no backend. In development, the scan service (Node, port 8787) is reached
// through the /scan-ws proxy below, so no CORS setup is needed.
export default defineConfig({
  plugins: [react()],
  // One .env at the project root. Only variables that start with VITE_ reach the browser.
  envDir: '..',
  server: {
    port: 5173,
    proxy: {
      // The scan service (Node) runs the Presage SDK. The browser streams camera frames to it.
      '/scan-ws': { target: 'ws://localhost:8787', ws: true },
    },
  },
})
