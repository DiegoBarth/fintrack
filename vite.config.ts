import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from "path"

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',
      scope: '/fintrack/',
      manifest: {
        name: 'Fintrack',
        short_name: 'Fintrack',
        description: 'Aplicativo de controle financeiro pessoal',
        theme_color: '#1e293b',
        background_color: '#0f172a',
        display: 'standalone',
        start_url: '/fintrack/',
        scope: '/fintrack/',
        icons: [
          { src: '/fintrack/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        navigateFallback: '/fintrack/index.html',
      },
    }),
  ],
  base: '/fintrack/',
  build: {
    outDir: 'docs',
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules/react')) return 'vendor-react';
          if (id.includes('node_modules/@tanstack/react-query')) return 'react-query';
        },
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  }
})