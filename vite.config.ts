/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'favicon.ico', 'apple-touch-icon-180x180.png'],
      manifest: {
        name: 'PoGoFilter',
        short_name: 'PoGoFilter',
        description: 'Build Pokémon GO storage search strings, save them, and paste them into the game.',
        theme_color: '#0e7f78',
        background_color: '#0e7f78',
        display: 'standalone',
        start_url: '/',
        scope: '/',
        icons: [
          { src: 'pwa-64x64.png', sizes: '64x64', type: 'image/png' },
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'maskable-icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
        // The optional stats service owns these; never answer them with the app shell.
        navigateFallbackDenylist: [/^\/admin/, /^\/api\//],
      },
    }),
  ],
  // For trying the optional stats locally: `node stats/server.mjs` + `VITE_STATS=1 npm run dev`.
  server: {
    proxy: { '/api': 'http://localhost:8090', '/admin': 'http://localhost:8090' },
  },
  test: {
    environment: 'node',
  },
});
