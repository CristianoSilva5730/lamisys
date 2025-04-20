
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Configurations for bundling
  build: {
    outDir: 'dist',
    minify: 'terser',
    // Additional configurations to avoid issues with ESM
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    // Disable mangling for easier debugging
    terserOptions: {
      compress: {
        drop_console: false,
      },
    },
    // Increase chunk size warning limit to avoid warnings
    chunkSizeWarningLimit: 1000,
    // Manual chunks configuration to improve code splitting
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-tooltip',
            '@radix-ui/react-avatar'
          ],
          charts: ['recharts'],
          forms: ['react-hook-form', 'zod']
        }
      }
    }
  }
}));
