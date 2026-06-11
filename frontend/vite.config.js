import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'PizzaHub - Delicious Pizza Delivery',
        short_name: 'PizzaHub',
        description: 'Fresh pizza delivery at your doorstep',
        theme_color: '#f97316',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          {
            src: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192"><rect fill="%23f97316" width="192" height="192"/><text x="50%" y="50%" font-size="120" fill="white" text-anchor="middle" dy=".3em">🍕</text></svg>',
            sizes: '192x192',
            type: 'image/svg+xml',
            purpose: 'any',
          },
          {
            src: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><rect fill="%23f97316" width="512" height="512"/><text x="50%" y="50%" font-size="300" fill="white" text-anchor="middle" dy=".3em">🍕</text></svg>',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'any maskable',
          },
        ],
        screenshots: [
          {
            src: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 540 720"><rect fill="%23f97316" width="540" height="720"/><text x="50%" y="50%" font-size="200" fill="white" text-anchor="middle" dy=".3em">🍕</text></svg>',
            sizes: '540x720',
            form_factor: 'narrow',
          },
        ],
        screenshots_wide: [
          {
            src: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 720"><rect fill="%23f97316" width="1280" height="720"/><text x="50%" y="50%" font-size="300" fill="white" text-anchor="middle" dy=".3em">🍕</text></svg>',
            sizes: '1280x720',
            form_factor: 'wide',
          },
        ],
        categories: ['food', 'shopping'],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,webp,woff,woff2,ttf,eot}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\./,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 300,
              },
            },
          },
          {
            urlPattern: /^https:\/\/.*\.(png|jpg|jpeg|svg|gif|webp)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'image-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 2592000,
              },
            },
          },
        ],
      },
      strategies: 'auto',
    }),
  ],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: process.env.VITE_DEV_API_PROXY || 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
})
