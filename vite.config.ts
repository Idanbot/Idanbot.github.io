/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/',
  build: {
    outDir: 'dist',
    modulePreload: {
      polyfill: false,
      resolveDependencies(url, deps) {
        if (!url.includes('CommandPalette')) {
          return deps.filter((dep) => !dep.includes('cmdk'));
        }
        return deps;
      },
    },
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return;
          if (id.includes('framer-motion')) return 'framer-motion';
          if (id.includes('cmdk')) return 'cmdk';
          if (id.includes('lucide-react')) return 'lucide';
          if (id.includes('react-icons')) return 'react-icons';
        },
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    environment: 'jsdom',
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    globals: false,
    passWithNoTests: true,
  },
})
