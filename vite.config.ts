import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    // Lokal ishlaganda `/api/*` so'rovlarini backendga uzatamiz (CORS
    // muammosini chetlab o'tish uchun — Vercel'dagi rewrite bilan bir xil).
    proxy: {
      '/api': {
        target: 'https://arabosfera.onrender.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
});
