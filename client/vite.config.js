import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // expose to external devices
    port: 5173,
    allowedHosts: ['.ngrok.io', '8f78-192-145-117-188.ngrok-free.app'], // allow ngrok host (NOTE: must always update second value with Forwarding URL from ngrok)
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
      fs: {
        strict: false, 
      }
    },
  },
});

console.log('Vite config loaded');

