import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/* Vite configuration for React 18 frontend build */
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    /* Proxy API requests to Spring Boot backend during development */
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
});
