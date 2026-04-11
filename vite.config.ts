import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    VitePWA({
      registerType: "autoUpdate",
      devOptions: { enabled: false },
      includeAssets: ["favicon.ico", "favicon-32x32.png", "favicon-48x48.png", "apple-touch-icon.png", "pwa-192x192.png", "pwa-512x512.png", "Logo_Albus_redes.jpeg"],
      manifest: {
        name: "Albus - Tu asistente de migración",
        short_name: "Albus",
        description: "Simplificamos tu migración a España",
        theme_color: "#000000",
        background_color: "#ffffff",
        display: "standalone",
        start_url: "/dashboard",
        icons: [
          { src: "/pwa-192x192.png?v=4", sizes: "192x192", type: "image/png" },
          { src: "/pwa-512x512.png?v=4", sizes: "512x512", type: "image/png", purpose: "any maskable" },
        ],
      },
      workbox: {
        navigateFallbackDenylist: [/^\/~oauth/],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/storage\/.*/,
            handler: "CacheFirst",
            options: {
              cacheName: "vault-documents",
              expiration: { maxEntries: 50, maxAgeSeconds: 7 * 24 * 60 * 60 },
            },
          },
        ],
      },
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
