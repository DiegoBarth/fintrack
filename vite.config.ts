import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from "path"

export default defineConfig({
   plugins: [
      react(),
      VitePWA({
         registerType: 'autoUpdate',
         includeAssets: ['favicon.ico', 'apple-touch-icon.png'],
         manifest: {
            name: 'Fintrack',
            short_name: 'Finanças',
            description: 'Aplicativo de controle financeiro pessoal',
            theme_color: '#1e293b',
            background_color: '#0f172a',
            display: 'standalone',
            orientation: 'portrait',
            scope: '/fintrack/',
            start_url: '/fintrack/',
            icons: [
               {
                  src: 'pwa-192x192.png',
                  sizes: '192x192',
                  type: 'image/png'
               },
               {
                  src: 'pwa-512x512.png',
                  sizes: '512x512',
                  type: 'image/png'
               },
               {
                  src: 'pwa-512x512.png',
                  sizes: '512x512',
                  type: 'image/png',
                  purpose: 'any maskable'
               }
            ]
         },
         workbox: {
            globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
            runtimeCaching: [
               {
                  urlPattern: /^https:\/\/script\.google\.com\/.*/i,
                  handler: 'NetworkFirst',
                  options: {
                     cacheName: 'google-scripts-cache',
                     expiration: {
                        maxEntries: 10,
                        maxAgeSeconds: 60 * 60 * 24 * 7
                     },
                     cacheableResponse: {
                        statuses: [0, 200]
                     }
                  }
               }
            ],
         },
         devOptions: {
            enabled: false
         }
      })
   ],
   base: '/fintrack/',
   build: {
      outDir: 'docs'
   },
   resolve: {
      alias: {
         "@": path.resolve(__dirname, "./src"),
      },
   }
})