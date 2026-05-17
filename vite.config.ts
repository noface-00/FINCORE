import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],

  server: {
    proxy: {
      // All requests to /ords/* are forwarded to the ORDS server.
      // This bypasses CORS entirely: the browser talks to localhost,
      // Vite dev server talks to Oracle ORDS server-to-server.
      '/ords': {
        target: 'http://100.100.129.101:8080',
        changeOrigin: true,
        secure: false,
        // Log proxy activity in the terminal
        configure: (proxy) => {
          proxy.on('error', (err) => {
            console.error('[vite-proxy] ORDS unreachable:', err.message);
          });
        },
      },
    },
  },

  build: {
    // Suppress the chunk size warning for the production bundle
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          charts: ['recharts'],
        },
      },
    },
  },
})
