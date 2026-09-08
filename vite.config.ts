import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/r2-dev': {
        target: 'https://pub-6d09ad692430411182c45170ee192a0a.r2.dev',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/r2-dev/, ''),
      },
    },
  },
});
