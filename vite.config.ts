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
